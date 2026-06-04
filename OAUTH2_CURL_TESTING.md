# OAuth2 Testing with cURL

Complete cURL commands for testing the OAuth2 flow without a browser.

---

## Prerequisites

```bash
# Make sure backend is running
curl -I http://localhost:8080/swagger-ui.html
# Should return: HTTP/1.1 200

# Make sure database is running
docker compose ps
```

---

## 1. Check OAuth2 Endpoints

### Check Google authorization endpoint
```bash
curl -v http://localhost:8080/oauth2/authorization/google
```

**Expected Response:**
- Status: `302 Found` (redirect)
- Header: `Location: https://accounts.google.com/o/oauth2/v2/auth?...`

---

## 2. Check API Documentation

### Get OpenAPI spec
```bash
curl http://localhost:8080/v3/api-docs | jq
```

### Access Swagger UI
```bash
# In browser: http://localhost:8080/swagger-ui.html
# Or with curl:
curl http://localhost:8080/swagger-ui/index.html
```

---

## 3. Test Without OAuth2 (Password Login)

### Create a test user first
```bash
# This would typically be done via admin panel
# For now, check if registration is available
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "fullName": "Test User"
  }'
```

### Login with password
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }' | jq
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "test@example.com",
  "role": "STUDENT"
}
```

---

## 4. Use JWT Token in API Calls

### Store token in variable
```bash
# Get token from login
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }' | jq -r '.token')

echo "Token: $TOKEN"
```

### Use token to access protected endpoints
```bash
# List all students
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/students | jq

# Create new student
curl -X POST http://localhost:8080/api/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "0123456789"
  }' | jq
```

### Get current user info
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/auth/me | jq
```

---

## 5. Test OAuth2 Flow (Advanced)

### Step 1: Get authorization code
```bash
# Open in browser or use curl
curl -v http://localhost:8080/oauth2/authorization/google
```

This will redirect you to Google login. After login, Google will call your callback:
```
GET /login/oauth2/code/google?code=AUTHORIZATION_CODE&state=STATE_VALUE
```

**Note:** You can't easily simulate this with cURL without automating browser login.

### Step 2: Alternative - Test with mock OAuth2 data

If you have a mock OAuth2 server, you can test the callback:

```bash
# Simulate the OAuth2 callback (requires internal debug endpoint)
curl -X POST http://localhost:8080/api/auth/oauth2-test \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@gmail.com",
    "name": "User Name",
    "providerId": "123456789",
    "provider": "google"
  }'
```

---

## 6. Test Protected Endpoints

### Get all students
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/students | jq '.[] | {id, fullName, email}'
```

### Get student by ID
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/students/1 | jq
```

### Get all teachers
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/teachers | jq
```

### Get all classes
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/classrooms | jq
```

### Get grades for a student
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/grades?studentId=1 | jq
```

### Get attendance records
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/attendance | jq
```

---

## 7. Decode JWT Token

### Decode without verification (local use)
```bash
# Extract payload
echo $TOKEN | cut -d'.' -f2 | base64 -d | jq

# Online: https://jwt.io/
```

### Full decoded example
```bash
# Header
echo $TOKEN | cut -d'.' -f1 | base64 -d | jq
# Payload
echo $TOKEN | cut -d'.' -f2 | base64 -d | jq
# Signature (can't decode, it's not base64)
echo $TOKEN | cut -d'.' -f3
```

---

## 8. Test Error Handling

### Invalid token
```bash
curl -H "Authorization: Bearer invalid-token" \
  http://localhost:8080/api/students
# Expected: 401 Unauthorized
```

### Expired token
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.token" \
  http://localhost:8080/api/students
# Expected: 401 Unauthorized
```

### Missing token
```bash
curl http://localhost:8080/api/students
# Expected: 401 Unauthorized or 403 Forbidden
```

### Public endpoints (no token needed)
```bash
# These should work without token
curl http://localhost:8080/v3/api-docs
curl http://localhost:8080/swagger-ui.html
```

---

## 9. Complete Test Scripts

### Bash script to test OAuth2 flow
```bash
#!/bin/bash

# colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Testing OAuth2 Backend Setup..."
echo ""

# Test 1: Check server running
echo -n "Test 1: Server running... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/swagger-ui.html | grep -q 200; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# Test 2: Check OAuth2 endpoint
echo -n "Test 2: OAuth2 endpoint... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/oauth2/authorization/google | grep -q -E "302|200"; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Test 3: Check public endpoints
echo -n "Test 3: API docs accessible... "
if curl -s http://localhost:8080/v3/api-docs | jq . > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Test 4: Login and get token
echo -n "Test 4: Password login... "
RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.com",
    "password": "admin123"
  }')

TOKEN=$(echo $RESPONSE | jq -r '.token // empty')
if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓${NC}"
    echo "Token: $TOKEN"
else
    echo -e "${RED}✗${NC}"
    echo "Check if user exists in database"
fi

echo ""
echo "All tests completed!"
```

Save as `test_oauth2.sh` and run:
```bash
chmod +x test_oauth2.sh
./test_oauth2.sh
```

---

## 10. Using Postman

### Import cURL to Postman

1. Open Postman
2. Click "Import" button
3. Paste cURL command:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/students
```
4. Postman auto-converts to request UI

### Create OAuth2 Collection

1. Create new Collection: "OAuth2 Tests"
2. Create requests:
   - `GET /oauth2/authorization/google`
   - `POST /auth/login`
   - `GET /api/students` (with Bearer token)
   - `GET /api/teachers` (with Bearer token)

3. Use Environment variables:
   - `{{base_url}}` = `http://localhost:8080`
   - `{{token}}` = paste JWT token
   - `{{email}}` = `test@example.com`

---

## 11. Common cURL Options

```bash
# Show response headers
curl -i URL

# Show request and response headers
curl -v URL

# Pretty print JSON
curl URL | jq

# Save output to file
curl URL > response.json

# Follow redirects
curl -L URL

# Set custom header
curl -H "Header: value" URL

# POST with data
curl -X POST -d "data=value" URL

# POST JSON
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}' URL

# Add multiple headers
curl -H "Header1: value1" \
     -H "Header2: value2" \
     URL

# Set timeout (seconds)
curl --max-time 10 URL

# Show only response headers
curl -I URL
```

---

## 12. Debugging Tips

### Check server logs
```bash
# If using gradle bootRun
# Logs appear in terminal

# Check specific errors
grep -i "oauth\|error\|exception" logs/application.log
```

### Check database
```bash
# Connect to PostgreSQL
psql postgresql://admin:130107@localhost:5433/managementSystemsc

# Check users
SELECT email, provider, provider_id, role FROM users WHERE email LIKE '%gmail%';

# Check specific user
SELECT * FROM users WHERE email = 'test@gmail.com';
```

### Check network
```bash
# Show all requests to localhost:8080
tcpdump -i lo port 8080

# Check port is open
netstat -tuln | grep 8080

# Check specific port
lsof -i :8080
```

---

## Final Checklist

Before OAuth2 production deployment:

- [ ] Can successfully call `/oauth2/authorization/google`
- [ ] Can successfully login with password and get JWT token
- [ ] Can use JWT token to access protected endpoints
- [ ] OAuth2 callback works in browser
- [ ] User is created in database after OAuth2 login
- [ ] JWT token is correctly stored in frontend
- [ ] CORS is configured correctly
- [ ] All endpoints are documented in Swagger
- [ ] Error handling works correctly
- [ ] Database backup strategy is in place

---

**Version:** 1.0  
**Updated:** June 1, 2026  
**Status:** ✅ Ready for Testing

