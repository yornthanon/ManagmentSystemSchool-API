# OAuth2 Google Login Setup Guide

## Overview

Your School Management System API is configured with **Google OAuth2 Login** integration. This allows users to authenticate using their Google accounts without needing a password in your application.

---

## Current Setup Status ✅

### Backend Configuration
- ✅ OAuth2 Security enabled with Spring Security 6.4.2
- ✅ Google OAuth2 provider configured in `application.properties`
- ✅ JWT token generation after OAuth2 authentication
- ✅ User auto-registration for new OAuth2 users (assigned as STUDENT role)
- ✅ CORS configured for frontend communication
- ✅ Swagger UI documentation ready

### Database Fields
The `User` entity includes OAuth2 fields:
- `provider` - OAuth2 provider name ("google")
- `providerId` - Unique ID from Google

### Security Features
- Admin users **cannot** use OAuth2 login (security restriction)
- New OAuth2 users default to **STUDENT** role
- Password is set to `null` for OAuth2 users
- JWT token issued upon successful authentication

---

## OAuth2 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Frontend redirects user to Google Login                       │
│    GET /oauth2/authorization/google                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ 2. User authenticates with Google                               │
│    (Google login screen)                                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ 3. Google redirects to callback with authorization code         │
│    GET /login/oauth2/code/google?code=...&state=...            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ 4. OAuth2SuccessHandler processes:                             │
│    - Extracts user info from OAuth2User                        │
│    - Checks if user exists in database                         │
│    - Creates new user if first time login                      │
│    - Generates JWT token                                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ 5. Redirect to frontend with JWT token                         │
│    http://localhost:5173/oauth2/redirect                       │
│    ?token=JWT_TOKEN&email=user@gmail.com&role=STUDENT          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 6. Frontend stores JWT token and declares user logged in        │
│    Uses token in Authorization header for API requests         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Setup Instructions

### Step 1: Create Google OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing one)
3. Enable **Google+ API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth2 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Select "Web Application"
   - Add Authorized redirect URIs:
     ```
     http://localhost:8080/login/oauth2/code/google
     ```
   - For production, add your actual domain:
     ```
     https://yourdomain.com/login/oauth2/code/google
     ```
   - Click "Create"

5. Copy the **Client ID** and **Client Secret**

### Step 2: Update Application Configuration

Edit `/src/main/resources/application.properties`:

```properties
# OAuth2 Google Configuration
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
spring.security.oauth2.client.registration.google.scope=email,profile
spring.security.oauth2.client.provider.google.user-name-attribute=sub

# Frontend redirect URL after authentication
app.oauth2.redirect-url=http://localhost:5173/oauth2/redirect
```

Or use environment variables (recommended for production):

```bash
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"
export OAUTH2_REDIRECT_URL="http://localhost:5173/oauth2/redirect"
```

### Step 3: Configure Frontend

Your frontend should handle the OAuth2 redirect and token. Example implementation:

```javascript
// In your React app (e.g., OAuth2Redirect.jsx)
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function OAuth2Redirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Get token from URL query params
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    const role = params.get('role');

    if (token) {
      // Store token in localStorage (or secure cookie)
      localStorage.setItem('authToken', token);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userRole', role);

      // Redirect to home page
      navigate('/');
    } else {
      // Handle error
      const error = params.get('error');
      console.error('OAuth2 error:', error);
      navigate('/login?error=' + (error || 'unknown'));
    }
  }, [navigate]);

  return <div>Authenticating...</div>;
}
```

---

## API Endpoints

### Public Endpoints (No JWT Required)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/oauth2/authorization/google` | GET | Redirect to Google login |
| `/login/oauth2/code/google` | GET | Google callback endpoint (automatic) |
| `/auth/**` | * | Authentication endpoints |
| `/v3/api-docs/**` | GET | OpenAPI specification |
| `/swagger-ui.html` | GET | Swagger UI documentation |

### Protected Endpoints (Require JWT Token)

Add JWT token in request header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

Example:
```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:8080/api/students
```

---

## Environment Variables

### Development (Local)

```bash
# Database
DB_URL=jdbc:postgresql://localhost:5433/managementSystemsc
DB_USERNAME=admin
DB_PASSWORD=130107

# OAuth2
GOOGLE_CLIENT_ID=YOUR_DEV_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_DEV_CLIENT_SECRET
OAUTH2_REDIRECT_URL=http://localhost:5173/oauth2/redirect

# JWT
JWT_SECRET=your-secret-key-change-in-production

# Server
PORT=8080
```

### Production (Example)

```bash
# Database
DB_URL=jdbc:postgresql://proddb.example.com:5432/managementdb
DB_USERNAME=prod_user
DB_PASSWORD=secure_password_here

# OAuth2
GOOGLE_CLIENT_ID=YOUR_PROD_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_PROD_CLIENT_SECRET
OAUTH2_REDIRECT_URL=https://yourdomain.com/oauth2/redirect

# JWT
JWT_SECRET=very-secure-random-key-at-least-32-characters

# Server
PORT=8080
```

---

## Testing OAuth2 Integration

### Method 1: Using Test Script

Run the provided test script:

```bash
chmod +x test_google_oauth2.sh
./test_google_oauth2.sh
```

### Method 2: Manual Testing

1. **Check if server is running:**
   ```bash
   curl -I http://localhost:8080/swagger-ui.html
   # Should return 200 OK
   ```

2. **Test OAuth2 endpoint:**
   ```bash
   curl -I http://localhost:8080/oauth2/authorization/google
   # Should return 302 (Redirect) or 200
   ```

3. **Test in browser:**
   - Open: `http://localhost:8080/oauth2/authorization/google`
   - You should be redirected to Google login
   - After login, you'll be redirected to frontend with token

### Method 3: Using Postman

1. Create a new OAuth2 request in Postman
2. Configure:
   - Grant Type: `Authorization Code`
   - Auth URL: `https://accounts.google.com/o/oauth2/v2/auth`
   - Access Token URL: `https://oauth2.googleapis.com/token`
   - Client ID: Your Google Client ID
   - Client Secret: Your Google Client Secret
   - Scope: `email profile`
   - Redirect URL: `https://oauth2.getpostman.com/callback`
3. Click "Get New Access Token"

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `invalid_client` | Wrong Client ID or Secret | Verify credentials in Google Cloud Console |
| `redirect_uri_mismatch` | Redirect URI not registered | Add redirect URI to Google OAuth2 app |
| `access_denied` | User denied permission | User needs to grant permissions |
| `admin_cannot_use_oauth2` | Admin trying to use OAuth2 | Admins must use password login |
| CORS error | Frontend not in allowed origins | Update CORS config in SecurityConfig |

### Error Response Example

```
http://localhost:5173/oauth2/redirect?error=admin_cannot_use_oauth2
```

Your frontend should parse the `error` parameter and display appropriate message.

---

## Database Schema

When a user logs in via OAuth2, the following data is saved:

```sql
INSERT INTO users (
    username,           -- email.split('@')[0] + UUID
    email,             -- user@gmail.com
    full_name,         -- User Full Name
    role,              -- STUDENT (default)
    provider,          -- 'google'
    provider_id,       -- Google's unique ID
    password           -- NULL (no password for OAuth2 users)
) VALUES (
    'john-a1b2c3',
    'john@gmail.com',
    'John Doe',
    'STUDENT',
    'google',
    '123456789',
    NULL
);
```

### Subsequent Logins

On subsequent logins, the user is found by `(email, provider)` combination instead of being created again.

---

## Security Considerations

### ✅ Implemented Security Features

1. **Stateless Authentication**: JWT tokens instead of sessions
2. **CORS Protection**: Configured for specific origins
3. **CSRF Protection**: Disabled (stateless API)
4. **Role-based Access**: Admin users cannot use OAuth2
5. **Password Security**: Uses BCrypt for regular users
6. **Token Expiration**: JWT tokens expire after 24 hours (configurable)

### 🔒 Production Best Practices

1. **Use HTTPS**: Always use HTTPS in production
2. **Secure Secrets**: Store `CLIENT_SECRET` in environment variables, never in code
3. **JWT Secret**: Use a strong, random 32+ character string
4. **Token Storage**: Consider secure HttpOnly cookies instead of localStorage
5. **Refresh Tokens**: Implement refresh token rotation (available in advanced setup)
6. **CORS**: Be specific about allowed origins, not `*`
7. **Rate Limiting**: Implement rate limiting on OAuth2 endpoints
8. **Audit Logging**: Log all OAuth2 authentication events

---

## Advanced Configuration

### Custom User Details During OAuth2 Login

Edit `OAuth2SuccessHandler.java`:

```java
User newUser = new User();
newUser.setEmail(email);
newUser.setFullName(name);
// Add custom fields
newUser.setPhoneNumber(oAuth2User.getAttribute("phone"));
// ...
```

### Multiple OAuth2 Providers

Add new provider in `application.properties`:

```properties
# GitHub OAuth2
spring.security.oauth2.client.registration.github.client-id=...
spring.security.oauth2.client.registration.github.client-secret=...

# Custom handling in SecurityConfig
```

### Custom JWT Claims

Edit `JwtTokenProvider.java` to add custom claims:

```java
private Claims getAllClaimsFromToken(String token) {
    return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    // Add custom claims here
}
```

---

## Troubleshooting

### Issue: "Redirect URI mismatch"

**Solution:**
1. Go to Google Cloud Console
2. Find your OAuth2 app
3. Add the exact redirect URI used in your request
4. Ensure no trailing slashes unless exactly matched

### Issue: CORS errors in frontend

**Solution:**
1. Check `SecurityConfig.java` line 54
2. Add your frontend URL to `setAllowedOrigins()`
3. Restart application

### Issue: User not found after OAuth2 login

**Solution:**
1. Check database for user with matching email
2. Verify `provider` field is set to "google"
3. Check application logs for errors

### Issue: JWT token not generated

**Solution:**
1. Verify `JwtTokenProvider` is correctly configured
2. Check JWT secret is set in environment
3. Verify user is saved to database

---

## Useful Resources

- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Spring Security OAuth2](https://spring.io/projects/spring-security-oauth2)
- [Spring Boot OAuth2 Starter](https://spring.io/projects/spring-security#null)
- [JWT.io - JWT Debugger](https://jwt.io/)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## Contact & Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs: `logs/application.log`
3. Test endpoints using Postman collection
4. Check GitHub Issues (if applicable)

---

**Last Updated:** June 1, 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready

