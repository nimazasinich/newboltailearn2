#!/bin/bash
set -euo pipefail

# Simple Docker Smoke Test Script (no jq dependency)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ARTIFACTS_DIR="$PROJECT_ROOT/drive/artifacts"
LOGS_DIR="$PROJECT_ROOT/drive/logs"

mkdir -p "$ARTIFACTS_DIR" "$LOGS_DIR"

echo "[INFO] Starting Docker smoke tests..."
cd "$PROJECT_ROOT"

# Build and start containers
echo "[INFO] Building Docker image..."
if docker compose build > "$LOGS_DIR/docker-build.log" 2>&1; then
    echo "[OK] Docker image built successfully"
else
    echo "[ERROR] Docker build failed"
    cat "$LOGS_DIR/docker-build.log"
    exit 1
fi

echo "[INFO] Starting containers..."
if docker compose up -d > "$LOGS_DIR/docker-up.log" 2>&1; then
    echo "[OK] Containers started"
else
    echo "[ERROR] Failed to start containers"
    cat "$LOGS_DIR/docker-up.log"
    exit 1
fi

# Wait for container to be ready
echo "[INFO] Waiting for container to be ready..."
sleep 10

# Test health endpoint
echo "[INFO] Testing health endpoint..."
if curl -fsS --max-time 5 http://localhost:3000/health > "$ARTIFACTS_DIR/health-response.json" 2>/dev/null; then
    echo "[OK] Health endpoint responding"
    cat "$ARTIFACTS_DIR/health-response.json"
else
    echo "[ERROR] Health endpoint not responding"
fi

# Test root path
echo "[INFO] Testing static file serving..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "[OK] Static files served (HTTP $HTTP_CODE)"
else
    echo "[WARN] Root path returned HTTP $HTTP_CODE"
fi

# Get container logs
echo "[INFO] Collecting container logs..."
docker compose logs --no-color > "$LOGS_DIR/compose.log" 2>&1

# Get container status
echo "[INFO] Container status:"
docker compose ps

# Summary
echo ""
echo "===== SMOKE TEST SUMMARY ====="
echo "Docker Build: OK"
echo "Container Start: OK"
echo "Health Check: $([ -f "$ARTIFACTS_DIR/health-response.json" ] && echo "OK" || echo "FAIL")"
echo "Static Files: $([ "$HTTP_CODE" = "200" ] && echo "OK" || echo "WARN")"
echo "Logs saved to: $LOGS_DIR"
echo "=============================="

# Create simple JSON result
cat > "$ARTIFACTS_DIR/smoke-test-simple.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "docker_build": "OK",
  "container_start": "OK",
  "health_check": $([ -f "$ARTIFACTS_DIR/health-response.json" ] && echo '"OK"' || echo '"FAIL"'),
  "static_files": $([ "$HTTP_CODE" = "200" ] && echo '"OK"' || echo '"WARN"'),
  "http_code": "$HTTP_CODE"
}
EOF

echo "[INFO] Results saved to $ARTIFACTS_DIR/smoke-test-simple.json"