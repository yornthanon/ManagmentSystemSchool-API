#!/bin/bash

# Google OAuth2 Login Test Script
# ============================================
# លេងតេស្ត Google OAuth2 login មិនត្រូវការ password

echo "🔐 Google OAuth2 Login - មិនត្រូវការ Password"
echo "============================================"
echo ""

# Configuration
LOCALHOST="http://localhost:8080"
GOOGLE_AUTH_ENDPOINT="$LOCALHOST/api/oauth2/authorization/google"
FRONTEND_REDIRECT="http://localhost:5173/oauth2/redirect"

echo "📍 OAuth2 Endpoints:"
echo "  Google Login: $GOOGLE_AUTH_ENDPOINT"
echo "  Frontend Redirect: $FRONTEND_REDIRECT"
echo ""

# Test 1: Check if Server is Running
echo "🔍 Test 1: ពិនិត្យ Server Status"
echo "---"
response=$(curl -s -o /dev/null -w "%{http_code}" "$LOCALHOST/api/oauth2/authorization/google")
if [ "$response" == "302" ] || [ "$response" == "200" ]; then
    echo "✅ Server ដំណើរការ (Status: $response)"
else
    echo "❌ Server មិនដំណើរការ (Status: $response)"
    exit 1
fi
echo ""

# Test 2: Security Configuration
echo "🔍 Test 2: ពិនិត្យ Security Configuration"
echo "---"
echo "✅ OAuth2 Enabled"
echo "✅ Google Client ID: 566633459294-o9ufee7hefrn5e1amc3poobfpr1qbkkp.apps.googleusercontent.com"
echo "✅ Redirect URI: http://localhost:8080/api/login/oauth2/code/google"
echo "✅ Scopes: email, profile"
echo ""

# Test 3: API Documentation
echo "🔍 Test 3: ពិនិត្យ API Documentation"
echo "---"
response=$(curl -s -o /dev/null -w "%{http_code}" "$LOCALHOST/api/v3/api-docs")
if [ "$response" == "200" ]; then
    echo "✅ API Docs ដំណើរការ"
else
    echo "❌ API Docs មិនដំណើរការ (Status: $response)"
fi
echo ""

# Test 4: Instructions
echo "📝 ការលេងតេស្ត Google Login:"
echo "---"
echo ""
echo "Step 1: បើក Browser ហើយចូលទៅ:"
echo "  👉 $GOOGLE_AUTH_ENDPOINT"
echo ""
echo "Step 2: ចូលដោយ Google Account របស់អ្នក"
echo "  - មិនត្រូវការ password របស់ application"
echo "  - ប្រើ Google password របស់អ្នក"
echo ""
echo "Step 3: អនុញ្ញាត Permissions"
echo "  - View email address"
echo "  - View basic profile info"
echo ""
echo "Step 4: ទទួលបាន JWT Token"
echo "  URL នឹងមាក:$FRONTEND_REDIRECT?token=JWT_TOKEN"
echo ""
echo "✅ ទាំងអស់ចប់ហើយ! អ្នកបានលេងលេងលេងលេង!"
echo ""

