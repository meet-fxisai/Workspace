#!/bin/bash

# Test script to create users and organization for socket testing

BASE_URL="http://localhost:3000"

echo "🚀 Starting Socket Integration Test"
echo "=================================="

# Create Organization
echo "📋 Creating organization..."
ORG_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/users/register-organization" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Organization",
    "domain": "test.com"
  }')

echo "Organization created: $ORG_RESPONSE"

# Extract organization ID
ORG_ID=$(echo $ORG_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "📋 Organization ID: $ORG_ID"

# Create first user (admin)
echo "👤 Creating admin user..."
USER1_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/users/reg" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"John Admin\",
    \"email\": \"admin@test.com\",
    \"password\": \"password123\",
    \"role\": \"admin\",
    \"OrganizationId\": \"$ORG_ID\"
  }")

echo "Admin user created: $USER1_RESPONSE"

# Create second user (member)
echo "👤 Creating member user..."
USER2_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/users/reg" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Jane Member\",
    \"email\": \"member@test.com\",
    \"password\": \"password123\",
    \"role\": \"member\",
    \"OrganizationId\": \"$ORG_ID\"
  }")

echo "Member user created: $USER2_RESPONSE"

echo ""
echo "✅ Test data created successfully!"
echo "=================================="
echo "📧 You can now login with:"
echo "   Admin: admin@test.com / password123"
echo "   Member: member@test.com / password123"
echo ""
echo "🌐 Frontend: http://localhost:5000"
echo "🔌 Socket server running on port 3000"
echo ""
echo "🧪 To test socket functionality:"
echo "1. Open http://localhost:5000 in TWO different browser tabs"
echo "2. Login with different users in each tab"
echo "3. Check the Socket Test component on the home page"
echo "4. Both users should appear in the online users list"
