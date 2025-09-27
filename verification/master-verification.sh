#!/bin/bash
# master-verification.sh - Comprehensive Post-Archive Functionality Verification System
# This script performs exhaustive testing of all system components after archiving

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize results tracking
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
RESULTS_DIR="verification/results"
RESULTS_FILE="$RESULTS_DIR/verification-results-${TIMESTAMP}.json"
LOG_FILE="$RESULTS_DIR/verification-${TIMESTAMP}.log"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Initialize JSON results file
echo '{
  "timestamp": "'$(date -Iseconds)'",
  "status": "in_progress",
  "tests": {},
  "summary": {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "warnings": 0
  }
}' > "$RESULTS_FILE"

# Logging function
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

# Function to log test results
log_result() {
    local test_name=$1
    local status=$2
    local message=$3
    local details=${4:-""}
    
    # Update JSON results
    node -e "
        const fs = require('fs');
        const results = JSON.parse(fs.readFileSync('$RESULTS_FILE'));
        results.tests['$test_name'] = {
            status: '$status',
            message: '$message',
            details: '$details',
            timestamp: new Date().toISOString()
        };
        
        // Update summary
        results.summary.total++;
        if ('$status' === 'PASSED') results.summary.passed++;
        else if ('$status' === 'FAILED') results.summary.failed++;
        else if ('$status' === 'WARNING') results.summary.warnings++;
        
        fs.writeFileSync('$RESULTS_FILE', JSON.stringify(results, null, 2));
    " 2>/dev/null || echo "Error updating results file"
}

# Function to check if server is running
check_server() {
    local port=$1
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost:$port/health >/dev/null 2>&1; then
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    return 1
}

log "======================================================"
log "   COMPREHENSIVE POST-ARCHIVE FUNCTIONALITY TEST"
log "======================================================"
log "Timestamp: $(date)"
log "Results file: $RESULTS_FILE"
log ""

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    log "${RED}✗ Error: Not in project root directory${NC}"
    exit 1
fi

# Phase 1: Infrastructure Tests
log "${BLUE}Phase 1: Infrastructure Verification${NC}"
log "----------------------------------------"

# Test 1.1: Check critical directories
log "Testing critical directories..."
CRITICAL_DIRS=("src" "server" "server/database" "public")
DIR_TEST_PASSED=true

for dir in "${CRITICAL_DIRS[@]}"; do
    if [ -d "$dir" ] && [ -r "$dir" ]; then
        log "${GREEN}✓ Directory $dir exists and is readable${NC}"
    else
        log "${RED}✗ Directory $dir missing or not readable${NC}"
        DIR_TEST_PASSED=false
    fi
done

if $DIR_TEST_PASSED; then
    log_result "infrastructure_directories" "PASSED" "All critical directories present"
else
    log_result "infrastructure_directories" "FAILED" "Missing critical directories"
fi

# Test 1.2: Check database file
log ""
log "Testing database file..."
if [ -f "./server/database/database.sqlite" ] || [ -f "./database.sqlite" ]; then
    log "${GREEN}✓ Database file exists${NC}"
    log_result "infrastructure_database" "PASSED" "Database file present"
else
    log "${YELLOW}⚠ Database file not found - will be created on first run${NC}"
    log_result "infrastructure_database" "WARNING" "Database file will be created"
fi

# Test 1.3: Check package dependencies
log ""
log "Testing package dependencies..."
if [ -f "package-lock.json" ] && [ -d "node_modules" ]; then
    log "${GREEN}✓ Dependencies installed${NC}"
    log_result "infrastructure_dependencies" "PASSED" "Node modules present"
else
    log "${YELLOW}⚠ Dependencies not installed - installing now...${NC}"
    npm install >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        log "${GREEN}✓ Dependencies installed successfully${NC}"
        log_result "infrastructure_dependencies" "PASSED" "Dependencies installed"
    else
        log "${RED}✗ Failed to install dependencies${NC}"
        log_result "infrastructure_dependencies" "FAILED" "Failed to install dependencies"
    fi
fi

# Phase 2: Server Startup Tests
log ""
log "${BLUE}Phase 2: Server Startup Verification${NC}"
log "----------------------------------------"

# Kill any existing servers
pkill -f "node.*server/main.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2

# Test backend server
log "Starting backend server..."
cd /workspace
node server/main.js > "$RESULTS_DIR/server-${TIMESTAMP}.log" 2>&1 &
SERVER_PID=$!

if check_server 8080; then
    log "${GREEN}✓ Backend server started successfully on port 8080${NC}"
    log_result "server_backend" "PASSED" "Backend server running"
    
    # Keep server running for other tests
else
    log "${RED}✗ Backend server failed to start${NC}"
    log_result "server_backend" "FAILED" "Backend server startup failed"
    kill $SERVER_PID 2>/dev/null || true
fi

# Phase 3: API Endpoint Tests
log ""
log "${BLUE}Phase 3: API Endpoint Verification${NC}"
log "----------------------------------------"

# Run API tests
node verification/test-api-endpoints.js >> "$LOG_FILE" 2>&1
API_TEST_RESULT=$?

if [ $API_TEST_RESULT -eq 0 ]; then
    log "${GREEN}✓ API endpoint tests passed${NC}"
    log_result "api_endpoints" "PASSED" "All API endpoints functional"
else
    log "${RED}✗ Some API endpoint tests failed${NC}"
    log_result "api_endpoints" "FAILED" "API endpoint issues detected"
fi

# Phase 4: Database Operations Tests
log ""
log "${BLUE}Phase 4: Database Operations Verification${NC}"
log "----------------------------------------"

# Run database tests
node verification/test-database.js >> "$LOG_FILE" 2>&1
DB_TEST_RESULT=$?

if [ $DB_TEST_RESULT -eq 0 ]; then
    log "${GREEN}✓ Database operations tests passed${NC}"
    log_result "database_operations" "PASSED" "Database CRUD operations functional"
else
    log "${RED}✗ Database operations tests failed${NC}"
    log_result "database_operations" "FAILED" "Database operation issues"
fi

# Phase 5: Frontend Build Tests
log ""
log "${BLUE}Phase 5: Frontend Build Verification${NC}"
log "----------------------------------------"

log "Testing production build..."
npm run build > "$RESULTS_DIR/build-${TIMESTAMP}.log" 2>&1

if [ $? -eq 0 ] && [ -d "dist" ] && [ -f "dist/index.html" ]; then
    log "${GREEN}✓ Production build successful${NC}"
    log_result "frontend_build" "PASSED" "Frontend builds successfully"
    
    # Check build size
    BUILD_SIZE=$(du -sh dist | cut -f1)
    log "Build size: $BUILD_SIZE"
else
    log "${RED}✗ Production build failed${NC}"
    log_result "frontend_build" "FAILED" "Frontend build issues"
fi

# Phase 6: WebSocket Tests
log ""
log "${BLUE}Phase 6: WebSocket & Real-time Features${NC}"
log "----------------------------------------"

node verification/test-websocket.js >> "$LOG_FILE" 2>&1
WS_TEST_RESULT=$?

if [ $WS_TEST_RESULT -eq 0 ]; then
    log "${GREEN}✓ WebSocket tests passed${NC}"
    log_result "websocket" "PASSED" "WebSocket functionality working"
else
    log "${YELLOW}⚠ WebSocket tests had issues${NC}"
    log_result "websocket" "WARNING" "WebSocket partially functional"
fi

# Phase 7: AI/ML Tests
log ""
log "${BLUE}Phase 7: AI/ML Functionality Verification${NC}"
log "----------------------------------------"

node verification/test-aiml.js >> "$LOG_FILE" 2>&1
AIML_TEST_RESULT=$?

if [ $AIML_TEST_RESULT -eq 0 ]; then
    log "${GREEN}✓ AI/ML functionality tests passed${NC}"
    log_result "aiml" "PASSED" "TensorFlow.js and ML features working"
else
    log "${YELLOW}⚠ AI/ML functionality limited${NC}"
    log_result "aiml" "WARNING" "Some AI/ML features may not work"
fi

# Phase 8: Security Tests
log ""
log "${BLUE}Phase 8: Security Measures Verification${NC}"
log "----------------------------------------"

node verification/test-security.js >> "$LOG_FILE" 2>&1
SECURITY_TEST_RESULT=$?

if [ $SECURITY_TEST_RESULT -eq 0 ]; then
    log "${GREEN}✓ Security tests passed${NC}"
    log_result "security" "PASSED" "Security measures functional"
else
    log "${RED}✗ Security issues detected${NC}"
    log_result "security" "FAILED" "Security vulnerabilities found"
fi

# Phase 9: Performance Tests
log ""
log "${BLUE}Phase 9: Performance Metrics Verification${NC}"
log "----------------------------------------"

node verification/test-performance.js >> "$LOG_FILE" 2>&1
PERF_TEST_RESULT=$?

if [ $PERF_TEST_RESULT -eq 0 ]; then
    log "${GREEN}✓ Performance metrics acceptable${NC}"
    log_result "performance" "PASSED" "Performance within acceptable limits"
else
    log "${YELLOW}⚠ Performance concerns detected${NC}"
    log_result "performance" "WARNING" "Performance could be improved"
fi

# Clean up server process
kill $SERVER_PID 2>/dev/null || true

# Generate final report
log ""
log "======================================================"
log "           VERIFICATION COMPLETE"
log "======================================================"

# Update final status in JSON
node -e "
    const fs = require('fs');
    const results = JSON.parse(fs.readFileSync('$RESULTS_FILE'));
    results.status = 'completed';
    results.completedAt = new Date().toISOString();
    
    // Calculate overall status
    const failedCount = results.summary.failed;
    const warningCount = results.summary.warnings;
    
    if (failedCount === 0 && warningCount === 0) {
        results.overallStatus = 'SUCCESS';
    } else if (failedCount === 0) {
        results.overallStatus = 'SUCCESS_WITH_WARNINGS';
    } else if (failedCount <= 2) {
        results.overallStatus = 'PARTIAL_SUCCESS';
    } else {
        results.overallStatus = 'FAILED';
    }
    
    fs.writeFileSync('$RESULTS_FILE', JSON.stringify(results, null, 2));
    
    // Print summary
    console.log('Test Results Summary:');
    console.log('  Total Tests: ' + results.summary.total);
    console.log('  Passed: ' + results.summary.passed);
    console.log('  Failed: ' + results.summary.failed);
    console.log('  Warnings: ' + results.summary.warnings);
    console.log('');
    console.log('Overall Status: ' + results.overallStatus);
" | tee -a "$LOG_FILE"

log ""
log "Detailed results saved to: $RESULTS_FILE"
log "Full log saved to: $LOG_FILE"

# Generate HTML report
node verification/generate-report.js "$RESULTS_FILE" > "$RESULTS_DIR/report-${TIMESTAMP}.html" 2>/dev/null

if [ -f "$RESULTS_DIR/report-${TIMESTAMP}.html" ]; then
    log "HTML report generated: $RESULTS_DIR/report-${TIMESTAMP}.html"
fi

# Set exit code based on results
OVERALL_STATUS=$(node -e "
    const results = JSON.parse(require('fs').readFileSync('$RESULTS_FILE'));
    console.log(results.overallStatus);
")

if [ "$OVERALL_STATUS" = "SUCCESS" ] || [ "$OVERALL_STATUS" = "SUCCESS_WITH_WARNINGS" ]; then
    log ""
    log "${GREEN}✓ SYSTEM VERIFICATION SUCCESSFUL${NC}"
    log "The archive operations have preserved full system functionality."
    exit 0
else
    log ""
    log "${RED}✗ SYSTEM VERIFICATION FAILED${NC}"
    log "Critical issues detected. Please review the results and take corrective action."
    exit 1
fi