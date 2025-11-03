#!/bin/bash

echo "Testing API endpoints..."

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s http://localhost:3002/health

# Test login
echo -e "\n\n2. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pilzno.org","password":"'${ADMIN_PASSWORD:-YOUR_PASSWORD_HERE}'"}')

echo "Login response:"
echo $LOGIN_RESPONSE

# Extract token (simple approach)
if [[ $LOGIN_RESPONSE == *"token"* ]] || [[ $LOGIN_RESPONSE == *"accessToken"* ]]; then
    echo -e "\n3. Testing family member creation..."
    
    MEMBER_RESPONSE=$(curl -s -X POST http://localhost:3002/api/family-members \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer admin123" \
      -d @test_member_creation.json)
    
    echo "Member creation response:"
    echo $MEMBER_RESPONSE
else
    echo "Failed to get authentication token"
fi
