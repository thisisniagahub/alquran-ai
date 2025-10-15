#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║           AL-QURAN AI APP - START SCRIPT                         ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if MongoDB is running
echo -n "Checking MongoDB... "
if pgrep -x "mongod" > /dev/null; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo "Please start MongoDB first: sudo systemctl start mongod"
    exit 1
fi

# Start backend
echo ""
echo "Starting Backend Server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /app/backend

# Check if already running
if lsof -Pi :8001 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠ Backend already running on port 8001${NC}"
    echo "Kill it with: kill \$(lsof -t -i:8001)"
else
    nohup python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
    echo "  Log file: /tmp/backend.log"
    
    # Wait for server to start
    echo -n "  Waiting for server to be ready"
    for i in {1..10}; do
        sleep 1
        echo -n "."
        if curl -s http://localhost:8001/api/health > /dev/null 2>&1; then
            echo -e " ${GREEN}✓${NC}"
            break
        fi
    done
fi

echo ""
echo "Backend API: http://localhost:8001"
echo "API Docs: http://localhost:8001/docs"
echo ""

# Frontend instructions
echo "Starting Frontend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Option 1: Web Browser"
echo "  cd /app/frontend && yarn web"
echo ""
echo "Option 2: iOS Simulator"
echo "  cd /app/frontend && yarn ios"
echo ""
echo "Option 3: Android Emulator"
echo "  cd /app/frontend && yarn android"
echo ""
echo "Option 4: Expo Dev Client"
echo "  cd /app/frontend && yarn start"
echo "  Then scan QR code with Expo Go app"
echo ""

# Testing
echo "Quick Tests:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  bash /app/test_api_endpoints.sh"
echo ""

# Status check
echo "Status Check:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s http://localhost:8001/api/health | jq . || echo "Backend not responding"
echo ""

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                    APP STARTED SUCCESSFULLY                      ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
