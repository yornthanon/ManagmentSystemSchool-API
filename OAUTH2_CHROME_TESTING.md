# Test OAuth2 on Chrome - Step by Step Guide

Complete guide to test Google OAuth2 login in Chrome browser.

---

## Prerequisites

Make sure everything is running:

```bash
# Terminal 1: Check Docker database
docker compose ps
# Should show: management_system_db is running

# Terminal 2: Check backend
curl -I http://localhost:8080/swagger-ui.html
# Should return: HTTP/1.1 200 OK
```

---

## Step 1: Open Chrome DevTools

1. Open Chrome browser
2. Press: `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
3. Tabs to open:
   - **Console** - See errors/logs
   - **Network** - Watch requests
   - **Application** - View localStorage/cookies

Keep DevTools open during testing.

---

## Step 2: Test Backend Connectivity

1. Open new Chrome tab
2. Go to: **http://localhost:8080/swagger-ui.html**

**Expected result:** Swagger UI opens with list of API endpoints

If this fails:
- Backend not running → run `./gradlew bootRun`
- Docker database not running → run `docker compose up -d`

---

## Step 3: Check OAuth2 Endpoint

1. Open new Chrome tab
2. Go to: **http://localhost:8080/oauth2/authorization/google**

**Expected result:** 
- You should be redirected to Google login page
- OR redirected to: `https://accounts.google.com/...`

If this fails:
- Check error in DevTools Console
- Verify Google Client ID is set correctly in `application.properties`

---

## Step 4: View Current Configuration

1. Open new Chrome tab
2. Go to: **http://localhost:8080/v3/api-docs**

**Expected result:** JSON showing all API endpoints

Look for:
```json
"paths": {
  "/oauth2/authorization/google": { ... },
  "/login/oauth2/code/google": { ... }
}
```

---

## Step 5: Test OAuth2 Login Flow (Complete)

### Option A: If you have a Google Account

1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Go to: **http://localhost:8080/oauth2/authorization/google**

**What happens:**
- Status: `302 Found` (redirect)
- You're taken to Google login
- Enter your Gmail email and password
- Google asks for permissions (click Allow)
- You're redirected back to: `http://localhost:5173/oauth2/redirect?token=...`

**Check Network tab for:**
- Request 1: GET `/oauth2/authorization/google` → Status 302
- Request 2: GET Google login page
- Request 3: POST to Google API
- Request 4: GET `/login/oauth2/code/google?code=...` → Status 302
- Request 5: GET `http://localhost:5173/oauth2/redirect?token=...`

### Option B: Test Without Real Google Account

Skip to Step 7 below.

---

## Step 6: Check Token Storage (After Successful Login)

After OAuth2 login completes:

1. Open DevTools → **Application** tab
2. Left sidebar → **Storage** → **Local Storage**
3. Select: `http://localhost:5173`

**Expected stored data:**
```
authToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
userEmail: your-email@gmail.com
userRole: STUDENT
```

---

## Step 7: Test with Password Login (No Google Account Needed)

If you don't have a Google account, test with password login:

### Step 7a: Get a JWT Token

1. Open Chrome DevTools (F12)
2. Go to **Console** tab
3. Paste this code:

```javascript
fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@school.com',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Token:', data.token);
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('userEmail', data.email);
  localStorage.setItem('userRole', data.role);
  console.log('Token saved to localStorage!');
})
.catch(e => console.error('Error:', e));
```

**Expected output in Console:**
```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Token saved to localStorage!
```

### Step 7b: Verify Token Stored

1. Go to **Application** tab → **Local Storage**
2. Should see:
   - `authToken: eyJhbGc...`
   - `userEmail: admin@school.com`
   - `userRole: ADMIN`

### Step 7c: Use Token to Call Protected API

In Console, paste:

```javascript
const token = localStorage.getItem('authToken');

fetch('http://localhost:8080/api/students', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log('Students:', data))
.catch(e => console.error('Error:', e));
```

**Expected output:**
```
Students: [
  { id: 1, fullName: "John Doe", email: "john@school.com", ... },
  ...
]
```

---

## Step 8: Decode JWT Token

1. Go to: **https://jwt.io/**
2. Paste your JWT token in the left box
3. You should see decoded token:

```json
{
  "header": { "alg": "HS256", "typ": "JWT" },
  "payload": {
    "email": "admin@school.com",
    "role": "ADMIN",
    "iat": 1717225650,
    "exp": 1717312050
  }
}
```

**Key fields:**
- `email` - User email
- `role` - User role (STUDENT/TEACHER/ADMIN)
- `exp` - Expiration time (24 hours from issue)

---

## Step 9: Test API Endpoints with Token

1. Open Console (F12)
2. Get your token first:

```javascript
const token = localStorage.getItem('authToken');
```

3. Test different endpoints:

### Get all students
```javascript
fetch('http://localhost:8080/api/students', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.table(data))
.catch(e => console.error(e));
```

### Get all teachers
```javascript
fetch('http://localhost:8080/api/teachers', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.table(data))
.catch(e => console.error(e));
```

### Get all classes
```javascript
fetch('http://localhost:8080/api/classrooms', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.table(data))
.catch(e => console.error(e));
```

### Create new student
```javascript
fetch('http://localhost:8080/api/students', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullName: 'Test Student',
    email: 'test@school.com',
    phone: '0123456789'
  })
})
.then(r => r.json())
.then(data => console.log('Created:', data))
.catch(e => console.error(e));
```

---

## Step 10: Monitor Network Requests

1. Open **Network** tab in DevTools
2. Make API calls (from Console)
3. Watch network requests:

**Key columns:**
- **Name** - Endpoint URL
- **Method** - GET/POST/PUT/DELETE
- **Status** - 200 (success), 401 (unauthorized), 500 (error)
- **Type** - xhr (API call), document, fetch
- **Time** - Response time

**Look for:**
- ✅ Requests with Status 200 = Success
- ❌ Requests with Status 401 = Token expired/invalid
- ❌ Requests with Status 403 = Permission denied

---

## Step 11: Test Error Scenarios

### Test 1: Invalid Token

In Console:
```javascript
fetch('http://localhost:8080/api/students', {
  headers: { 'Authorization': 'Bearer invalid-token' }
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(data => console.log('Response:', data))
.catch(e => console.error(e));
```

**Expected:** Status 401 (Unauthorized)

### Test 2: No Token

In Console:
```javascript
fetch('http://localhost:8080/api/students')
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(data => console.log('Response:', data))
.catch(e => console.error(e));
```

**Expected:** Status 401 or 403 (Forbidden)

### Test 3: Expired Token

Wait 24+ hours, then try to use token (or manually create expired token at jwt.io)

**Expected:** Status 401 (Token expired)

---

## Step 12: Test with Frontend (React)

If you have React frontend running on `http://localhost:5173`:

1. Open React app in Chrome
2. Click "Login" button
3. Click "Login with Google"
4. You'll be redirected to Google login
5. After login, you'll be redirected back to app with token
6. Token should be stored in localStorage
7. You should be logged in! ✅

---

## Common Issues & Solutions

### Issue: "redirect_uri_mismatch"

**Problem:** Google login redirects with error about redirect URI

**Solution:**
1. Go to Google Cloud Console
2. Check OAuth2 credentials
3. Verify redirect URI is: `http://localhost:8080/login/oauth2/code/google`
4. Restart backend
5. Try again

### Issue: CORS Error in Console

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
1. Check backend is configured for CORS
2. Verify frontend URL is in allowed origins
3. Check `SecurityConfig.java` line 54
4. Restart backend
5. Try again

### Issue: Token Not Working

**Problem:** Console shows 401 when using token

**Causes:**
- Token is expired (24 hour expiry)
- Token format is wrong
- Token doesn't have required claims
- Backend secret doesn't match

**Solution:**
1. Get new token (Step 7a)
2. Verify token format: `Bearer TOKEN`
3. Check token signature at jwt.io

### Issue: Can't Login

**Error:** Login endpoint returns error

**Possible causes:**
- Wrong email/password
- User doesn't exist in database
- Database not running

**Solution:**
1. Check user exists: Go to database and query users table
2. Try default user: `admin@school.com` / `admin123`
3. Check database is running: `docker compose ps`

---

## Chrome DevTools Shortcuts

| Shortcut | Action |
|----------|--------|
| F12 | Open/close DevTools |
| Ctrl+Shift+I | Open DevTools |
| Ctrl+` | Toggle Console |
| Ctrl+Shift+J | Open Console |
| Ctrl+Shift+E | Network tab |
| Ctrl+Shift+C | Select element |
| F5 | Refresh page |
| Ctrl+R | Hard refresh |
| Ctrl+Shift+R | Clear cache & refresh |

---

## Useful Console Commands

```javascript
// Check if token exists
localStorage.getItem('authToken')

// Clear all local storage
localStorage.clear()

// Clear specific item
localStorage.removeItem('authToken')

// See all stored data
Object.keys(localStorage).forEach(key => {
  console.log(`${key}: ${localStorage.getItem(key)}`)
})

// Make API call with logging
async function testAPI() {
  const token = localStorage.getItem('authToken');
  console.log('Using token:', token);
  
  try {
    const response = await fetch('http://localhost:8080/api/students', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Data:', data);
    return data;
  } catch (e) {
    console.error('Error:', e);
  }
}

testAPI();
```

---

## Testing Checklist

Map each test to Chrome DevTools:

- [ ] **Swagger UI loads** - Test endpoint 1
- [ ] **OAuth2 redirect works** - Check Network tab
- [ ] **Google login completes** - Watch redirect flow
- [ ] **Token appears in URL** - Check Network tab final request
- [ ] **Token stored in localStorage** - Check Application tab
- [ ] **Can use token to call API** - Console API call
- [ ] **Token shows in Network headers** - Check Authorization header
- [ ] **Protected endpoints work** - Console test multiple endpoints
- [ ] **Expired token returns 401** - Error scenario test
- [ ] **No token returns 401** - Error scenario test

---

## Full Testing Script

Copy-paste this entire script into Chrome Console to test everything:

```javascript
console.log('=== OAuth2 Testing Script ===');

// Test 1: Get token
console.log('Test 1: Getting JWT token...');
fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@school.com',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(data => {
  if (data.token) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userRole', data.role);
    console.log('✅ Token obtained:', data.token.substring(0, 20) + '...');
    
    // Test 2: Use token
    console.log('Test 2: Using token to call API...');
    return fetch('http://localhost:8080/api/students', {
      headers: { 'Authorization': `Bearer ${data.token}` }
    })
    .then(r => r.json())
    .then(students => {
      console.log('✅ API call successful!');
      console.log('Students:', students);
      
      // Test 3: Check stored data
      console.log('Test 3: Checking localStorage...');
      console.log('✅ Stored data:');
      console.log('  - Token:', localStorage.getItem('authToken').substring(0, 20) + '...');
      console.log('  - Email:', localStorage.getItem('userEmail'));
      console.log('  - Role:', localStorage.getItem('userRole'));
      
      console.log('=== All Tests Passed! ===');
    });
  } else {
    console.error('❌ No token received:', data);
  }
})
.catch(e => console.error('❌ Error:', e));
```

---

## Next Steps

After successful testing:

1. ✅ Test with real Google account (Step 5)
2. ✅ Integrate with React frontend
3. ✅ Deploy to production
4. ✅ Setup SSL/HTTPS certificate
5. ✅ Configure production OAuth2 credentials

---

## Support

If tests fail:

1. **Check backend logs:**
   ```bash
   # Terminal where backend is running
   # Look for ERROR messages
   ```

2. **Check database:**
   ```bash
   docker exec management_system_db psql -U admin -d managementSystemsc -c "SELECT email, role FROM users;"
   ```

3. **Check configuration:**
   ```bash
   # Verify environment variables
   echo $GOOGLE_CLIENT_ID
   echo $GOOGLE_CLIENT_SECRET
   ```

4. **Restart services:**
   ```bash
   # Restart backend
   kill $(lsof -t -i:8080)
   ./gradlew bootRun
   ```

---

**Version:** 1.0  
**Created:** June 1, 2026  
**Status:** ✅ Ready for Testing

