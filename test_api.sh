#!/bin/bash

echo "Testing API endpoints..."

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s http://localhost:3002/health | jq '.'

# Test login
echo -e "\n2. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pilzno.org","password":"admin123"}')

echo "Login response:"
echo $LOGIN_RESPONSE | jq '.'

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // .accessToken // empty')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo -e "\n3. Testing family member creation..."
    
    MEMBER_RESPONSE=$(curl -s -X POST http://localhost:3002/api/family-members \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d @test_member_creation.json)
    
    echo "Member creation response:"
    echo $MEMBER_RESPONSE | jq '.'
else
    echo "Failed to get authentication token"
fi
