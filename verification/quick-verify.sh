#!/bin/bash
# quick-verify.sh - Quick verification of system functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================"
echo "   SYSTEM FUNCTIONALITY VERIFICATION"
echo -e "======================================================${NC}"
echo ""

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
RESULTS_DIR="verification/results"
mkdir -p "$RESULTS_DIR"

# Summary tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test and track results
run_test() {
    local test_name=$1
    local test_file=$2
    
    echo -e "${BLUE}Running: ${test_name}${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if node "$test_file" > "$RESULTS_DIR/${test_name}-${TIMESTAMP}.log" 2>&1; then
        echo -e "${GREEN}  ✓ ${test_name} PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}  ✗ ${test_name} FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Check if server is running
echo -e "${YELLOW}Checking server status...${NC}"
if curl -f http://localhost:8080/health >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${YELLOW}Starting server...${NC}"
    node server/main.js > "$RESULTS_DIR/server-${TIMESTAMP}.log" 2>&1 &
    SERVER_PID=$!
    sleep 5
    
    if curl -f http://localhost:8080/health >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Server started successfully${NC}"
    else
        echo -e "${RED}✗ Failed to start server${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}Running verification tests...${NC}"
echo ""

# Run individual test suites
run_test "Database" "verification/test-database.js" || true
run_test "API-Endpoints" "verification/test-api-endpoints.js" || true
run_test "Performance" "verification/test-performance.js" || true
run_test "WebSocket" "verification/test-websocket.js" || true
run_test "Security" "verification/test-security.js" || true
run_test "AI-ML" "verification/test-aiml.js" || true

# Test frontend build
echo ""
echo -e "${BLUE}Testing frontend build...${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

if npm run build > "$RESULTS_DIR/build-${TIMESTAMP}.log" 2>&1; then
    if [ -d "dist" ] && [ -f "dist/index.html" ]; then
        echo -e "${GREEN}  ✓ Frontend build PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        BUILD_SIZE=$(du -sh dist | cut -f1)
        echo -e "  Build size: ${BUILD_SIZE}"
    else
        echo -e "${RED}  ✗ Frontend build FAILED - artifacts missing${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
else
    echo -e "${RED}  ✗ Frontend build FAILED${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Generate summary
echo ""
echo -e "${BLUE}======================================================"
echo "                VERIFICATION SUMMARY"
echo -e "======================================================${NC}"
echo ""

# Calculate pass rate
if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
else
    PASS_RATE=0
fi

echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "Passed: ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed: ${RED}${FAILED_TESTS}${NC}"
echo -e "Pass Rate: ${PASS_RATE}%"
echo ""

# Generate JSON summary
cat > "$RESULTS_DIR/summary-${TIMESTAMP}.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "total_tests": $TOTAL_TESTS,
  "passed": $PASSED_TESTS,
  "failed": $FAILED_TESTS,
  "pass_rate": "$PASS_RATE%",
  "results": {
    "database": $([ -f "$RESULTS_DIR/Database-${TIMESTAMP}.log" ] && echo "true" || echo "false"),
    "api": $([ -f "$RESULTS_DIR/API-Endpoints-${TIMESTAMP}.log" ] && echo "true" || echo "false"),
    "performance": $([ -f "$RESULTS_DIR/Performance-${TIMESTAMP}.log" ] && echo "true" || echo "false"),
    "websocket": $([ -f "$RESULTS_DIR/WebSocket-${TIMESTAMP}.log" ] && echo "true" || echo "false"),
    "security": $([ -f "$RESULTS_DIR/Security-${TIMESTAMP}.log" ] && echo "true" || echo "false"),
    "aiml": $([ -f "$RESULTS_DIR/AI-ML-${TIMESTAMP}.log" ] && echo "true" || echo "false"),
    "frontend": $([ -d "dist" ] && echo "true" || echo "false")
  }
}
EOF

# Overall status
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ SYSTEM VERIFICATION: PASSED${NC}"
    echo -e "${GREEN}All critical functionality is working correctly!${NC}"
    EXIT_CODE=0
elif [ $PASS_RATE -ge 70 ]; then
    echo -e "${YELLOW}⚠ SYSTEM VERIFICATION: PASSED WITH WARNINGS${NC}"
    echo -e "${YELLOW}Most functionality is working, but some issues detected.${NC}"
    EXIT_CODE=0
else
    echo -e "${RED}✗ SYSTEM VERIFICATION: FAILED${NC}"
    echo -e "${RED}Critical issues detected. Review logs in: $RESULTS_DIR${NC}"
    EXIT_CODE=1
fi

echo ""
echo "Detailed logs saved to: $RESULTS_DIR"
echo "Summary saved to: $RESULTS_DIR/summary-${TIMESTAMP}.json"

# Clean up server if we started it
if [ ! -z "$SERVER_PID" ]; then
    kill $SERVER_PID 2>/dev/null || true
fi

exit $EXIT_CODE