#!/bin/bash

echo "======================================"
echo "AL-QURAN API ENDPOINT TESTING"
echo "======================================"
echo ""

API_URL="http://localhost:8001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -n "Testing: $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    elif [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
        echo -e "${YELLOW}⚠ AUTH REQUIRED${NC} (HTTP $http_code)"
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "Response: $body" | head -c 200
        echo ""
    fi
}

echo "======================================"
echo "1. HEALTH CHECK ENDPOINTS"
echo "======================================"
test_endpoint "GET" "/" "Root endpoint"
test_endpoint "GET" "/api/health" "Health check"

echo ""
echo "======================================"
echo "2. QURAN ENDPOINTS (Public)"
echo "======================================"
test_endpoint "GET" "/api/quran/surahs" "Get all surahs"
test_endpoint "GET" "/api/quran/surah/1" "Get Surah 1 (Al-Fatihah)"
test_endpoint "GET" "/api/quran/surah/1/translations?languages=en,ms" "Get Surah with translations"
test_endpoint "GET" "/api/quran/ayah/1/1" "Get specific ayah"
test_endpoint "GET" "/api/quran/juz/1" "Get Juz 1"
test_endpoint "GET" "/api/quran/search?q=mercy&edition=quran-simple" "Search Quran"
test_endpoint "GET" "/api/quran/editions" "Get available editions"
test_endpoint "GET" "/api/quran/daily-verse" "Get daily verse"

echo ""
echo "======================================"
echo "3. AUTHENTICATED ENDPOINTS"
echo "======================================"
echo "(These require valid JWT token)"
test_endpoint "GET" "/api/profile" "Get user profile"
test_endpoint "GET" "/api/bookmarks" "Get bookmarks"
test_endpoint "GET" "/api/progress" "Get reading progress"

echo ""
echo "======================================"
echo "TEST SUMMARY"
echo "======================================"
echo "✓ Public endpoints should return HTTP 200"
echo "⚠ Auth endpoints should return HTTP 401/403"
echo "✗ Any other response indicates an issue"
echo ""
