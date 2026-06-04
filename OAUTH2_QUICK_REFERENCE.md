# OAuth2 Configuration Quick Reference

## 🚀 Quick Start (5 minutes)

### 1. Get Google OAuth2 Credentials
```bash
# Go to: https://console.cloud.google.com/
# 1. Create project
# 2. Enable Google+ API
# 3. Create OAuth2 credentials (Web Application)
# 4. Add redirect URI: http://localhost:8080/login/oauth2/code/google
# 5. Copy Client ID and Secret
```

### 2. Configure Backend
```bash
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"
export OAUTH2_REDIRECT_URL="http://localhost:5173/oauth2/redirect"
```

### 3. Run Application
```bash
# Terminal 1: Start Docker database
cd /home/yornthanon/IdeaProjects
docker compose up -d

# Terminal 2: Start Spring Boot backend
./gradlew bootRun

# Terminal 3: Start React frontend
npm start
```

### 4. Test
- Open: http://localhost:5173/login
- Click "Login with Google"
- You get redirected to Google login
- After login, return to app with JWT token ✅

---

## 📋 Configuration Files

### Backend Configuration

**File:** `src/main/resources/application.properties`

```properties
# OAuth2 Credentials
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID:...}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET:...}
spring.security.oauth2.client.registration.google.scope=email,profile
spring.security.oauth2.client.provider.google.user-name-attribute=sub

# Frontend redirect after auth
app.oauth2.redirect-url=${OAUTH2_REDIRECT_URL:http://localhost:5173/oauth2/redirect}
```

### Key Classes

| Class | Location | Purpose |
|-------|----------|---------|
| `SecurityConfig` | `security/SecurityConfig.java` | OAuth2 setup & CORS |
| `OAuth2SuccessHandler` | `security/OAuth2SuccessHandler.java` | Handle login success |
| `JwtTokenProvider` | `util/JwtTokenProvider.java` | Generate/validate JWT |
| `User` | `entity/User.java` | User entity with OAuth2 fields |

---

## 🔗 API Endpoints

### OAuth2 Endpoints (Public)
```
GET  /oauth2/authorization/google      → Redirect to Google login
GET  /login/oauth2/code/google        → Google callback (auto)
```

### Protected Endpoints (Require JWT)
```
GET  /api/students                    → List students
POST /api/students                    → Create student
GET  /api/teachers                    → List teachers
...
```

### Making API Calls
```javascript
// Add to request header:
Authorization: Bearer JWT_TOKEN

// Example:
fetch('/api/students', {
  headers: {
    'Authorization': 'Bearer eyJhbGc...'
  }
})
```

---

## 🗄️ Database

### User Fields for OAuth2
```sql
SELECT 
  email,        -- user@gmail.com
  full_name,    -- User Full Name
  provider,     -- 'google'
  provider_id,  -- Google unique ID
  role,         -- 'STUDENT' (default for new OAuth2 users)
  password      -- NULL (no password for OAuth2 users)
FROM users;
```

### First Login Flow
1. User clicks "Login with Google"
2. Redirected to Google → user logs in
3. Google calls: `/login/oauth2/code/google?code=...`
4. Backend extracts email, name, ID from Google
5. Check if user exists by (email, provider)
6. If new → create user with STUDENT role
7. Generate JWT token
8. Redirect to frontend with token in URL

---

## 🔐 Security Features

✅ **Implemented**
- Stateless JWT authentication
- CORS protection (specific origins)
- Admin users cannot use OAuth2 (password only)
- Password encrypted with BCrypt (regular users)
- JWT expiration: 24 hours
- OAuth2 fields in database

🛠️ **Additional Setup for Production**
- HTTPS required
- Secure JWT secret (32+ chars, random)
- HttpOnly cookies instead of localStorage
- Rate limiting on OAuth2 endpoints
- Audit logging

---

## 🧪 Testing

### Test Script
```bash
chmod +x test_google_oauth2.sh
./test_google_oauth2.sh
```

### Manual Test
```bash
# Check if server running
curl -I http://localhost:8080/swagger-ui.html

# Test OAuth2 endpoint
curl -I http://localhost:8080/oauth2/authorization/google
# Expected: 302 (Redirect) or 200

# Use browser
open http://localhost:8080/oauth2/authorization/google
```

### JWT Token Test
```bash
# Decode token at: https://jwt.io
# Extract token from URL after login
# token=eyJhbGc...

# Use token in API call:
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8080/api/students
```

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| `redirect_uri_mismatch` | Add exact URI to Google Cloud Console |
| CORS error | Update `setAllowedOrigins()` in SecurityConfig |
| Token not stored | Check OAuth2Redirect.jsx is loaded |
| API returns 401 | Check Authorization header has Bearer token |
| Google redirect failed | Verify Client ID and Secret are correct |
| User not created | Check database constraints, use UUID for username |

---

## 📝 Environment Setup

### Development
```bash
# OAuth2
GOOGLE_CLIENT_ID=YOUR_DEV_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_DEV_CLIENT_SECRET
OAUTH2_REDIRECT_URL=http://localhost:5173/oauth2/redirect

# Database
DB_URL=jdbc:postgresql://localhost:5433/managementSystemsc
DB_USERNAME=admin
DB_PASSWORD=130107

# JWT
JWT_SECRET=your-secret-key-for-development
```

### Production
```bash
# OAuth2
GOOGLE_CLIENT_ID=YOUR_PROD_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_PROD_SECRET
OAUTH2_REDIRECT_URL=https://yourdomain.com/oauth2/redirect

# Database
DB_URL=jdbc:postgresql://prod-db:5432/managementdb
DB_USERNAME=prod_user
DB_PASSWORD=SECURE_PASSWORD

# JWT
JWT_SECRET=VERY_SECURE_32_PLUS_CHARS_RANDOM_KEY

# Server
PORT=8080
HTTPS_ENABLED=true
```

---

## 🎯 Common Tasks

### Add New OAuth2 Provider (e.g., GitHub)
1. Edit `application.properties`:
```properties
spring.security.oauth2.client.registration.github.client-id=...
spring.security.oauth2.client.registration.github.client-secret=...
```
2. Update SecurityConfig if custom logic needed
3. Update OAuth2SuccessHandler for provider-specific fields

### Change Default Role for New OAuth2 Users
Edit `OAuth2SuccessHandler.java` line 54:
```java
newUser.setRole(Role.TEACHER);  // Change from STUDENT
```

### Require Email Verification for OAuth2
Add in `OAuth2SuccessHandler.java`:
```java
newUser.setEmailVerified(true);  // Only for OAuth2 users
```

### Store Additional User Info
Edit `OAuth2SuccessHandler.java`:
```java
String phoneNumber = oAuth2User.getAttribute("@value");
newUser.setPhoneNumber(phoneNumber);
```

---

## 📚 File Structure

```
IdeaProjects/
├── src/main/java/com/online/managamentsystemschool/
│   ├── security/
│   │   ├── SecurityConfig.java              ← OAuth2 configuration
│   │   ├── OAuth2SuccessHandler.java        ← Login success handler
│   │   ├── JWTAuthFilter.java
│   │   └── CustomUserDetailsService.java
│   ├── entity/
│   │   ├── User.java                        ← OAuth2 fields here
│   │   └── ...
│   ├── repository/
│   │   ├── UserRepository.java
│   │   └── ...
│   └── ...
├── src/main/resources/
│   ├── application.properties                ← OAuth2 config here
│   └── ...
├── docker-compose.yml                        ← Database setup
├── OAUTH2_SETUP.md                          ← Full setup guide
└── OAUTH2_FRONTEND_GUIDE.md                 ← Frontend implementation
```

---

## ✅ Verification Checklist

- [ ] Google Cloud Console project created
- [ ] Google+ API enabled
- [ ] OAuth2 credentials created
- [ ] Redirect URI added to Google Cloud Console
- [ ] GOOGLE_CLIENT_ID set in environment
- [ ] GOOGLE_CLIENT_SECRET set in environment
- [ ] OAUTH2_REDIRECT_URL set in environment
- [ ] Backend running on port 8080
- [ ] Frontend running on port 5173
- [ ] Database running in Docker
- [ ] OAuth2Redirect route added to frontend
- [ ] Auth context created
- [ ] API calls include JWT header
- [ ] Swagger UI accessible at /swagger-ui.html
- [ ] Can successfully login with Google

---

## 🔗 Useful Links

- [Google Console](https://console.cloud.google.com/)
- [JWT Debugger](https://jwt.io/)
- [Spring Security Docs](https://spring.io/projects/spring-security)
- [OAuth2 RFC 6749](https://tools.ietf.org/html/rfc6749)

---

**Version:** 1.0  
**Updated:** June 1, 2026  
**Status:** ✅ Ready for Development

