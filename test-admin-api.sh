#!/bin/bash

# EESA Admin Panel API Testing Script
# This script tests all CRUD operations for the admin panel

echo "🔍 EESA Admin Panel API Testing"
echo "================================"

# Base URL for API
API_URL="http://localhost:8000/api"
COOKIES_FILE="./cookies.txt"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Function to print section
print_section() {
    echo -e "\n${YELLOW}📋 $1${NC}"
    echo "-------------------"
}

# Step 1: Get CSRF Token
print_section "Authentication Setup"
echo "Getting CSRF token..."
CSRF_RESPONSE=$(curl -s -b $COOKIES_FILE -c $COOKIES_FILE -X GET "$API_URL/accounts/auth/csrf/")
CSRF_TOKEN=$(echo $CSRF_RESPONSE | grep -o '"csrfToken":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$CSRF_TOKEN" ]; then
    print_result 0 "CSRF token obtained: ${CSRF_TOKEN:0:20}..."
else
    print_result 1 "Failed to get CSRF token"
    exit 1
fi

# Step 2: Test Events API
print_section "Events Management"

# Test GET events
echo "Testing GET /api/events/events/"
EVENTS_RESPONSE=$(curl -s -b $COOKIES_FILE -X GET "$API_URL/events/events/" -w "%{http_code}")
HTTP_CODE="${EVENTS_RESPONSE: -3}"
if [ "$HTTP_CODE" = "200" ]; then
    EVENT_COUNT=$(echo $EVENTS_RESPONSE | grep -o '"count":[0-9]*' | cut -d':' -f2 | head -1)
    print_result 0 "GET Events successful - Found $EVENT_COUNT events"
else
    print_result 1 "GET Events failed - HTTP $HTTP_CODE"
fi

# Test POST event
echo "Testing POST /api/events/events/"
EVENT_DATA='{
  "title": "Test Event API Script",
  "description": "Testing event creation from script",
  "event_type": "workshop",
  "status": "draft",
  "start_date": "2024-11-15T10:00:00Z",
  "end_date": "2024-11-15T17:00:00Z",
  "location": "Test Location Script",
  "registration_required": true,
  "max_participants": 50,
  "registration_fee": "25.00"
}'

CREATE_RESPONSE=$(curl -s -b $COOKIES_FILE -c $COOKIES_FILE -X POST "$API_URL/events/events/" \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: $CSRF_TOKEN" \
  -d "$EVENT_DATA" \
  -w "%{http_code}")

HTTP_CODE="${CREATE_RESPONSE: -3}"
if [ "$HTTP_CODE" = "201" ]; then
    NEW_EVENT_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -1)
    print_result 0 "POST Event successful - Created event ID: $NEW_EVENT_ID"
else
    print_result 1 "POST Event failed - HTTP $HTTP_CODE"
    echo "Response: ${CREATE_RESPONSE%???}"
fi

# Step 3: Test Careers API
print_section "Career Management"

# Test GET careers
echo "Testing GET /api/careers/opportunities/"
CAREERS_RESPONSE=$(curl -s -b $COOKIES_FILE -X GET "$API_URL/careers/opportunities/" -w "%{http_code}")
HTTP_CODE="${CAREERS_RESPONSE: -3}"
if [ "$HTTP_CODE" = "200" ]; then
    CAREER_COUNT=$(echo $CAREERS_RESPONSE | grep -o '"count":[0-9]*' | cut -d':' -f2 | head -1)
    print_result 0 "GET Careers successful - Found $CAREER_COUNT opportunities"
else
    print_result 1 "GET Careers failed - HTTP $HTTP_CODE"
fi

# Test POST career
echo "Testing POST /api/careers/opportunities/create/"
CAREER_DATA='{
  "title": "Test Job API Script",
  "company": "Script Test Company",
  "location": "Remote",
  "job_type": "full_time",
  "experience_level": "entry",
  "description": "Testing job creation from script",
  "requirements": "Bash scripting, API testing",
  "skills": "Shell scripting, curl, API testing",
  "salary_range": "3-5 LPA",
  "application_url": "https://test.com/apply",
  "application_deadline": "2024-12-31T23:59:59Z"
}'

CREATE_CAREER_RESPONSE=$(curl -s -b $COOKIES_FILE -c $COOKIES_FILE -X POST "$API_URL/careers/opportunities/create/" \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: $CSRF_TOKEN" \
  -d "$CAREER_DATA" \
  -w "%{http_code}")

HTTP_CODE="${CREATE_CAREER_RESPONSE: -3}"
if [ "$HTTP_CODE" = "201" ]; then
    NEW_CAREER_ID=$(echo $CREATE_CAREER_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2 | head -1)
    print_result 0 "POST Career successful - Created career ID: $NEW_CAREER_ID"
else
    print_result 1 "POST Career failed - HTTP $HTTP_CODE"
    echo "Response: ${CREATE_CAREER_RESPONSE%???}"
fi

# Step 4: Test Other APIs
print_section "Other Endpoints"

# Test Academics endpoints
echo "Testing GET /api/academics/schemes/"
SCHEMES_RESPONSE=$(curl -s -b $COOKIES_FILE -X GET "$API_URL/academics/schemes/" -w "%{http_code}")
HTTP_CODE="${SCHEMES_RESPONSE: -3}"
if [ "$HTTP_CODE" = "200" ]; then
    print_result 0 "GET Academic Schemes successful"
else
    print_result 1 "GET Academic Schemes failed - HTTP $HTTP_CODE"
fi

echo "Testing GET /api/academics/resources/"
RESOURCES_RESPONSE=$(curl -s -b $COOKIES_FILE -X GET "$API_URL/academics/resources/" -w "%{http_code}")
HTTP_CODE="${RESOURCES_RESPONSE: -3}"
if [ "$HTTP_CODE" = "200" ]; then
    RESOURCE_COUNT=$(echo $RESOURCES_RESPONSE | grep -o '"count":[0-9]*' | cut -d':' -f2 | head -1)
    print_result 0 "GET Academic Resources successful - Found $RESOURCE_COUNT resources"
else
    print_result 1 "GET Academic Resources failed - HTTP $HTTP_CODE"
fi

# Test Team endpoint
echo "Testing GET /api/team/"
TEAM_RESPONSE=$(curl -s -b $COOKIES_FILE -X GET "$API_URL/team/" -w "%{http_code}")
HTTP_CODE="${TEAM_RESPONSE: -3}"
if [ "$HTTP_CODE" = "200" ]; then
    print_result 0 "GET Team Members successful"
else
    print_result 1 "GET Team Members failed - HTTP $HTTP_CODE"
fi

# Test Alumni endpoint
echo "Testing GET /api/alumni/alumni/"
ALUMNI_RESPONSE=$(curl -s -b $COOKIES_FILE -X GET "$API_URL/alumni/alumni/" -w "%{http_code}")
HTTP_CODE="${ALUMNI_RESPONSE: -3}"
if [ "$HTTP_CODE" = "200" ]; then
    ALUMNI_COUNT=$(echo $ALUMNI_RESPONSE | grep -o '"count":[0-9]*' | cut -d':' -f2 | head -1)
    print_result 0 "GET Alumni successful - Found $ALUMNI_COUNT alumni"
else
    print_result 1 "GET Alumni failed - HTTP $HTTP_CODE"
fi

# Summary
print_section "Test Summary"
echo "🎯 API Testing completed!"
echo "📊 Check results above for any failures"
echo "🌐 Frontend should be working at: http://localhost:3000/eesa"
echo ""
echo "💡 Next steps:"
echo "   1. Open http://localhost:3000/eesa in browser"
echo "   2. Navigate to Events panel and try creating an event"
echo "   3. Navigate to Careers panel and try creating a job"
echo "   4. Check browser console for any errors"
