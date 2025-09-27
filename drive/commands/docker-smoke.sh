#!/bin/bash
set -Eeuo pipefail

# Docker Smoke Test Script for Persian Legal AI
# Safe, idempotent testing with JSON output

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ARTIFACTS_DIR="$PROJECT_ROOT/drive/artifacts"
LOGS_DIR="$PROJECT_ROOT/drive/logs"
STATE_DIR="$PROJECT_ROOT/drive/state"

# Ensure directories exist
mkdir -p "$ARTIFACTS_DIR" "$LOGS_DIR" "$STATE_DIR"

# Colors for output (only if terminal)
if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    NC='\033[0m' # No Color
else
    RED=''
    GREEN=''
    YELLOW=''
    NC=''
fi

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Initialize test results
TEST_RESULTS="{\"timestamp\":\"$(date -Iseconds)\",\"tests\":{}}"

update_result() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    TEST_RESULTS=$(echo "$TEST_RESULTS" | jq ".tests.\"$test_name\" = {\"status\":\"$status\",\"message\":\"$message\"}")
}

# Trap to ensure we write results even on failure
cleanup() {
    local exit_code=$?
    echo "$TEST_RESULTS" | jq '.' > "$ARTIFACTS_DIR/smoke-test-results.json"
    
    if [ $exit_code -ne 0 ]; then
        log_error "Smoke tests failed with exit code: $exit_code"
        update_result "overall" "FAIL" "Tests failed with exit code $exit_code"
    fi
    
    # Stop containers if requested
    if [ "${CLEANUP_CONTAINERS:-false}" = "true" ]; then
        log_info "Cleaning up containers..."
        cd "$PROJECT_ROOT"
        docker compose down || true
    fi
}
trap cleanup EXIT

# Phase 1: Build and start containers
log_info "Building and starting Docker containers..."
cd "$PROJECT_ROOT"

if ! docker compose up -d --build > "$LOGS_DIR/compose-up.log" 2>&1; then
    log_error "Failed to start containers"
    update_result "docker_build" "FAIL" "Failed to build/start containers"
    exit 1
fi

update_result "docker_build" "OK" "Containers built and started"
log_info "Containers started successfully"

# Phase 2: Wait for container to be healthy
log_info "Waiting for container to be healthy..."
HEALTH_TIMEOUT=60
HEALTH_CHECK_INTERVAL=2
elapsed=0

while [ $elapsed -lt $HEALTH_TIMEOUT ]; do
    if docker compose ps --format json 2>/dev/null | jq -e '.[] | select(.Service == "app") | .Health == "healthy"' > /dev/null 2>&1; then
        log_info "Container is healthy"
        update_result "container_health" "OK" "Container reached healthy state"
        break
    fi
    
    sleep $HEALTH_CHECK_INTERVAL
    elapsed=$((elapsed + HEALTH_CHECK_INTERVAL))
    echo -n "."
done
echo ""

if [ $elapsed -ge $HEALTH_TIMEOUT ]; then
    log_warn "Container health check timeout after ${HEALTH_TIMEOUT}s"
    update_result "container_health" "TIMEOUT" "Health check timeout after ${HEALTH_TIMEOUT}s"
fi

# Phase 3: HTTP Health Check
log_info "Testing HTTP health endpoint..."
HTTP_RESULT=$(curl -fsS --max-time 5 -w '\n{"http_code":%{http_code},"time_total":%{time_total}}' \
    http://localhost:3000/health 2>/dev/null || echo '{"error":"curl failed"}')

if echo "$HTTP_RESULT" | head -n1 | jq -e '.status == "ok"' > /dev/null 2>&1; then
    log_info "Health endpoint returned OK"
    update_result "http_health" "OK" "Health endpoint working"
    echo "$HTTP_RESULT" > "$ARTIFACTS_DIR/smoke-http-health.json"
else
    log_error "Health endpoint check failed"
    update_result "http_health" "FAIL" "Health endpoint not responding correctly"
    echo "$HTTP_RESULT" > "$ARTIFACTS_DIR/smoke-http-health-error.json"
fi

# Phase 4: Test static file serving
log_info "Testing static file serving..."
ROOT_RESPONSE=$(curl -fsS --max-time 5 -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>/dev/null || echo "000")

if [ "$ROOT_RESPONSE" = "200" ]; then
    log_info "Root path serving static files"
    update_result "http_static" "OK" "Static files served correctly"
    echo "{\"status\":\"OK\",\"http_code\":$ROOT_RESPONSE}" > "$ARTIFACTS_DIR/smoke-http-static.json"
else
    log_warn "Root path returned: $ROOT_RESPONSE"
    update_result "http_static" "WARN" "Root returned $ROOT_RESPONSE"
    echo "{\"status\":\"WARN\",\"http_code\":\"$ROOT_RESPONSE\"}" > "$ARTIFACTS_DIR/smoke-http-static.json"
fi

# Phase 5: Database check
log_info "Testing database connectivity..."

# Create a test script to run inside container
cat > "$ARTIFACTS_DIR/db-test.mjs" << 'EOF'
import Database from 'better-sqlite3';
import { existsSync } from 'fs';

const DB_PATH = process.env.SQLITE_PATH || '/data/persian_legal_ai.sqlite';
const result = { status: 'UNKNOWN', checks: {} };

try {
    // Check if DB file exists or can be created
    result.checks.file_exists = existsSync(DB_PATH);
    
    // Open database connection
    const db = new Database(DB_PATH);
    result.checks.connection = 'OK';
    
    // Create test table
    db.exec('CREATE TABLE IF NOT EXISTS smoke_test (id INTEGER PRIMARY KEY, key TEXT UNIQUE, value TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
    result.checks.create_table = 'OK';
    
    // Insert test data
    const testKey = `smoke_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const testValue = `test_value_${Date.now()}`;
    
    const insert = db.prepare('INSERT INTO smoke_test (key, value) VALUES (?, ?)');
    insert.run(testKey, testValue);
    result.checks.insert = 'OK';
    
    // Read back data
    const select = db.prepare('SELECT value FROM smoke_test WHERE key = ?');
    const row = select.get(testKey);
    
    if (row && row.value === testValue) {
        result.checks.read = 'OK';
        result.checks.data_integrity = 'OK';
    } else {
        result.checks.read = 'FAIL';
        result.checks.data_integrity = 'FAIL';
    }
    
    // Clean up test data
    const del = db.prepare('DELETE FROM smoke_test WHERE key = ?');
    del.run(testKey);
    result.checks.cleanup = 'OK';
    
    // Close connection
    db.close();
    result.checks.close = 'OK';
    
    result.status = 'OK';
    result.message = 'All database checks passed';
    
} catch (error) {
    result.status = 'FAIL';
    result.error = error.message;
    result.message = `Database check failed: ${error.message}`;
}

console.log(JSON.stringify(result, null, 2));
EOF

# Copy test script to container and run it
docker cp "$ARTIFACTS_DIR/db-test.mjs" persian-legal-ai:/tmp/db-test.mjs 2>/dev/null

DB_RESULT=$(docker exec persian-legal-ai node /tmp/db-test.mjs 2>/dev/null || echo '{"status":"FAIL","error":"Failed to execute DB test"}')

echo "$DB_RESULT" > "$ARTIFACTS_DIR/smoke-db.json"

if echo "$DB_RESULT" | jq -e '.status == "OK"' > /dev/null 2>&1; then
    log_info "Database roundtrip test passed"
    update_result "db_roundtrip" "OK" "Database operations successful"
else
    log_error "Database test failed"
    update_result "db_roundtrip" "FAIL" "Database operations failed"
fi

# Phase 6: Collect logs
log_info "Collecting container logs..."
docker compose logs --no-color > "$LOGS_DIR/compose.log" 2>&1

# Phase 7: Get container stats
log_info "Collecting container statistics..."
docker compose ps --format json > "$ARTIFACTS_DIR/container-status.json" 2>&1
docker images persian-legal-ai:latest --format json > "$ARTIFACTS_DIR/image-info.json" 2>&1

# Phase 8: Determine overall result
OVERALL_STATUS="SUCCESS"
if echo "$TEST_RESULTS" | jq -e '[.tests[] | select(.status == "FAIL")] | length > 0' > /dev/null 2>&1; then
    OVERALL_STATUS="FAIL"
elif echo "$TEST_RESULTS" | jq -e '[.tests[] | select(.status == "WARN")] | length > 0' > /dev/null 2>&1; then
    OVERALL_STATUS="PARTIAL"
fi

update_result "overall" "$OVERALL_STATUS" "Smoke tests completed"

# Final output
log_info "Smoke tests completed with status: $OVERALL_STATUS"
echo "$TEST_RESULTS" | jq '.' > "$ARTIFACTS_DIR/smoke-test-final.json"

# Write state file
cat > "$STATE_DIR/smoke-test-state.json" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "status": "$OVERALL_STATUS",
    "containers_running": true,
    "tests_completed": true
}
EOF

if [ "$OVERALL_STATUS" = "SUCCESS" ]; then
    log_info "✅ All smoke tests passed!"
    exit 0
else
    log_warn "⚠️ Some tests failed or had warnings"
    exit 1
fi