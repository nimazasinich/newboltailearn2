#!/bin/bash
# db-smoke-test.sh - Full CRUD round-trip test for SQLite database

set -e

# Configuration
DATABASE_PATH=${DATABASE_PATH:-/data/database.sqlite}
TEST_TABLE="smoke_test_$(date +%s)"
EXIT_CODE=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# JSON output file
OUTPUT_FILE="/workspace/drive/artifacts/DB_SMOKE.json"
mkdir -p "$(dirname "$OUTPUT_FILE")"

# Initialize JSON result
JSON_RESULT='{"timestamp":"'$(date -Iseconds)'","tests":[],"summary":{"total":0,"passed":0,"failed":0}}'

# Logging functions
log_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    EXIT_CODE=1
}

# Add test result to JSON
add_test_result() {
    local name=$1
    local status=$2
    local duration=$3
    local details=$4
    
    JSON_RESULT=$(echo "$JSON_RESULT" | jq \
        --arg name "$name" \
        --arg status "$status" \
        --arg duration "$duration" \
        --arg details "$details" \
        '.tests += [{"name": $name, "status": $status, "duration": $duration, "details": $details}]')
}

# Test function wrapper
run_test() {
    local test_name=$1
    local test_command=$2
    
    log_test "$test_name"
    
    local start_time=$(date +%s%N)
    
    if eval "$test_command" &> /dev/null; then
        local end_time=$(date +%s%N)
        local duration=$(( ($end_time - $start_time) / 1000000 ))
        log_pass "$test_name completed in ${duration}ms"
        add_test_result "$test_name" "passed" "${duration}ms" "Test completed successfully"
        return 0
    else
        local end_time=$(date +%s%N)
        local duration=$(( ($end_time - $start_time) / 1000000 ))
        log_fail "$test_name failed after ${duration}ms"
        add_test_result "$test_name" "failed" "${duration}ms" "Test failed: $?"
        return 1
    fi
}

# Start smoke tests
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   SQLite Database Smoke Test Suite    ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Test 0: Database connectivity
log_test "Database Connectivity"
if sqlite3 "$DATABASE_PATH" "SELECT 1;" &> /dev/null; then
    log_pass "Database is accessible at $DATABASE_PATH"
    add_test_result "Database Connectivity" "passed" "0ms" "Database is accessible"
else
    log_fail "Cannot connect to database at $DATABASE_PATH"
    add_test_result "Database Connectivity" "failed" "0ms" "Cannot connect to database"
    echo "$JSON_RESULT" > "$OUTPUT_FILE"
    exit 1
fi

# Test 1: CREATE - Create test table
run_test "CREATE Table" "sqlite3 '$DATABASE_PATH' 'CREATE TABLE $TEST_TABLE (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    value INTEGER,
    data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);'"

# Test 2: INSERT - Insert test data
run_test "INSERT Single Row" "sqlite3 '$DATABASE_PATH' \"INSERT INTO $TEST_TABLE (name, value, data) VALUES ('test_item_1', 100, 'Test data 1');\""

run_test "INSERT Multiple Rows" "sqlite3 '$DATABASE_PATH' \"
INSERT INTO $TEST_TABLE (name, value, data) VALUES 
    ('test_item_2', 200, 'Test data 2'),
    ('test_item_3', 300, 'Test data 3'),
    ('test_item_4', 400, 'Test data 4'),
    ('test_item_5', 500, 'Test data 5');
\""

# Test 3: SELECT - Verify inserted data
log_test "SELECT - Verify Data"
ROW_COUNT=$(sqlite3 "$DATABASE_PATH" "SELECT COUNT(*) FROM $TEST_TABLE;")
if [ "$ROW_COUNT" -eq 5 ]; then
    log_pass "SELECT verified: $ROW_COUNT rows found"
    add_test_result "SELECT Verification" "passed" "0ms" "Found $ROW_COUNT rows as expected"
else
    log_fail "SELECT failed: Expected 5 rows, found $ROW_COUNT"
    add_test_result "SELECT Verification" "failed" "0ms" "Expected 5 rows, found $ROW_COUNT"
fi

# Test 4: SELECT with WHERE clause
run_test "SELECT with WHERE" "sqlite3 '$DATABASE_PATH' \"SELECT * FROM $TEST_TABLE WHERE value > 250;\""

# Test 5: UPDATE - Modify data
run_test "UPDATE Single Row" "sqlite3 '$DATABASE_PATH' \"UPDATE $TEST_TABLE SET value = 150, data = 'Updated data' WHERE name = 'test_item_1';\""

run_test "UPDATE Multiple Rows" "sqlite3 '$DATABASE_PATH' \"UPDATE $TEST_TABLE SET value = value * 2 WHERE value >= 300;\""

# Test 6: Verify UPDATE
log_test "Verify UPDATE"
UPDATED_VALUE=$(sqlite3 "$DATABASE_PATH" "SELECT value FROM $TEST_TABLE WHERE name = 'test_item_1';")
if [ "$UPDATED_VALUE" -eq 150 ]; then
    log_pass "UPDATE verified: Value correctly updated to $UPDATED_VALUE"
    add_test_result "UPDATE Verification" "passed" "0ms" "Value updated correctly"
else
    log_fail "UPDATE failed: Expected 150, got $UPDATED_VALUE"
    add_test_result "UPDATE Verification" "failed" "0ms" "Expected 150, got $UPDATED_VALUE"
fi

# Test 7: DELETE - Remove specific rows
run_test "DELETE Single Row" "sqlite3 '$DATABASE_PATH' \"DELETE FROM $TEST_TABLE WHERE name = 'test_item_1';\""

# Test 8: Verify DELETE
log_test "Verify DELETE"
ROW_COUNT_AFTER_DELETE=$(sqlite3 "$DATABASE_PATH" "SELECT COUNT(*) FROM $TEST_TABLE;")
if [ "$ROW_COUNT_AFTER_DELETE" -eq 4 ]; then
    log_pass "DELETE verified: $ROW_COUNT_AFTER_DELETE rows remaining"
    add_test_result "DELETE Verification" "passed" "0ms" "Correct number of rows after deletion"
else
    log_fail "DELETE failed: Expected 4 rows, found $ROW_COUNT_AFTER_DELETE"
    add_test_result "DELETE Verification" "failed" "0ms" "Expected 4 rows, found $ROW_COUNT_AFTER_DELETE"
fi

# Test 9: Transaction test
log_test "Transaction Test"
sqlite3 "$DATABASE_PATH" <<EOF
BEGIN TRANSACTION;
INSERT INTO $TEST_TABLE (name, value, data) VALUES ('transaction_test', 999, 'Transaction data');
UPDATE $TEST_TABLE SET value = 1000 WHERE name = 'transaction_test';
COMMIT;
EOF

TRANSACTION_VALUE=$(sqlite3 "$DATABASE_PATH" "SELECT value FROM $TEST_TABLE WHERE name = 'transaction_test';")
if [ "$TRANSACTION_VALUE" -eq 1000 ]; then
    log_pass "Transaction test passed"
    add_test_result "Transaction Test" "passed" "0ms" "Transaction completed successfully"
else
    log_fail "Transaction test failed"
    add_test_result "Transaction Test" "failed" "0ms" "Transaction failed"
fi

# Test 10: Index creation and usage
run_test "CREATE Index" "sqlite3 '$DATABASE_PATH' \"CREATE INDEX idx_${TEST_TABLE}_value ON $TEST_TABLE(value);\""

# Test 11: Complex query with JOIN (using existing tables)
log_test "Complex Query Test"
COMPLEX_RESULT=$(sqlite3 "$DATABASE_PATH" "SELECT COUNT(*) FROM $TEST_TABLE WHERE value IN (SELECT value FROM $TEST_TABLE WHERE value > 100);")
if [ -n "$COMPLEX_RESULT" ]; then
    log_pass "Complex query executed successfully"
    add_test_result "Complex Query" "passed" "0ms" "Query executed successfully"
else
    log_fail "Complex query failed"
    add_test_result "Complex Query" "failed" "0ms" "Query execution failed"
fi

# Test 12: Performance test - Bulk insert
log_test "Performance Test - Bulk Insert"
START_TIME=$(date +%s%N)
sqlite3 "$DATABASE_PATH" <<EOF
BEGIN TRANSACTION;
$(for i in {1..1000}; do echo "INSERT INTO $TEST_TABLE (name, value, data) VALUES ('bulk_item_$i', $i, 'Bulk data $i');"; done)
COMMIT;
EOF
END_TIME=$(date +%s%N)
DURATION=$(( ($END_TIME - $START_TIME) / 1000000 ))
log_pass "Bulk insert of 1000 rows completed in ${DURATION}ms"
add_test_result "Bulk Insert Performance" "passed" "${DURATION}ms" "1000 rows inserted"

# Test 13: Cleanup - Drop test table
run_test "DROP Table (Cleanup)" "sqlite3 '$DATABASE_PATH' \"DROP TABLE IF EXISTS $TEST_TABLE;\""

# Generate summary
TOTAL_TESTS=$(echo "$JSON_RESULT" | jq '.tests | length')
PASSED_TESTS=$(echo "$JSON_RESULT" | jq '[.tests[] | select(.status == "passed")] | length')
FAILED_TESTS=$(echo "$JSON_RESULT" | jq '[.tests[] | select(.status == "failed")] | length')

JSON_RESULT=$(echo "$JSON_RESULT" | jq \
    --arg total "$TOTAL_TESTS" \
    --arg passed "$PASSED_TESTS" \
    --arg failed "$FAILED_TESTS" \
    '.summary = {"total": ($total | tonumber), "passed": ($passed | tonumber), "failed": ($failed | tonumber)}')

# Add database info to JSON
DB_SIZE=$(du -h "$DATABASE_PATH" 2>/dev/null | cut -f1 || echo "unknown")
JSON_RESULT=$(echo "$JSON_RESULT" | jq \
    --arg size "$DB_SIZE" \
    --arg path "$DATABASE_PATH" \
    '.database = {"path": $path, "size": $size}')

# Save JSON result
echo "$JSON_RESULT" | jq '.' > "$OUTPUT_FILE"

# Print summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}           Test Summary                ${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "Passed: ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed: ${RED}${FAILED_TESTS}${NC}"
echo -e "Database Size: ${DB_SIZE}"
echo -e "Results saved to: ${OUTPUT_FILE}"

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "\n${GREEN}✓ All smoke tests passed successfully!${NC}"
else
    echo -e "\n${RED}✗ Some tests failed. Please check the logs.${NC}"
fi

exit $EXIT_CODE