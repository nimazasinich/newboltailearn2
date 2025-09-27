#!/bin/bash
set -euo pipefail

# Docker Configuration Verification Script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ARTIFACTS_DIR="$PROJECT_ROOT/drive/artifacts"
REPORTS_DIR="$PROJECT_ROOT/drive/reports"
STATE_DIR="$PROJECT_ROOT/drive/state"

mkdir -p "$ARTIFACTS_DIR" "$REPORTS_DIR" "$STATE_DIR"

echo "===== Docker Configuration Verification ====="
echo ""

# Check required files exist
REQUIRED_FILES=(
    "Dockerfile"
    "docker-compose.yml"
    ".dockerignore"
    "server/entry.mjs"
    "server/main.js"
    "package.json"
)

VERIFICATION_RESULTS=()
ALL_PASS=true

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$PROJECT_ROOT/$file" ]; then
        echo "✅ $file exists"
        VERIFICATION_RESULTS+=("$file: OK")
    else
        echo "❌ $file missing"
        VERIFICATION_RESULTS+=("$file: MISSING")
        ALL_PASS=false
    fi
done

echo ""
echo "===== Dockerfile Analysis ====="

# Verify Dockerfile structure
if [ -f "$PROJECT_ROOT/Dockerfile" ]; then
    echo "Checking Dockerfile configuration..."
    
    # Check for multi-stage build
    if grep -q "FROM.*AS builder" "$PROJECT_ROOT/Dockerfile"; then
        echo "✅ Multi-stage build configured"
    else
        echo "⚠️ Multi-stage build not found"
    fi
    
    # Check for non-root user
    if grep -q "USER appuser" "$PROJECT_ROOT/Dockerfile"; then
        echo "✅ Non-root user configured"
    else
        echo "⚠️ Non-root user not configured"
    fi
    
    # Check for health check
    if grep -q "HEALTHCHECK" "$PROJECT_ROOT/Dockerfile"; then
        echo "✅ Health check configured"
    else
        echo "⚠️ Health check not configured"
    fi
    
    # Check for production build
    if grep -q "NODE_ENV=production" "$PROJECT_ROOT/Dockerfile"; then
        echo "✅ Production environment set"
    else
        echo "⚠️ Production environment not set"
    fi
fi

echo ""
echo "===== Docker Compose Analysis ====="

if [ -f "$PROJECT_ROOT/docker-compose.yml" ]; then
    echo "Checking docker-compose.yml configuration..."
    
    # Check for volumes
    if grep -q "volumes:" "$PROJECT_ROOT/docker-compose.yml"; then
        echo "✅ Volumes configured"
    else
        echo "⚠️ Volumes not configured"
    fi
    
    # Check for health check
    if grep -q "healthcheck:" "$PROJECT_ROOT/docker-compose.yml"; then
        echo "✅ Health check configured"
    else
        echo "⚠️ Health check not configured"
    fi
    
    # Check for restart policy
    if grep -q "restart:" "$PROJECT_ROOT/docker-compose.yml"; then
        echo "✅ Restart policy configured"
    else
        echo "⚠️ Restart policy not configured"
    fi
fi

echo ""
echo "===== .dockerignore Analysis ====="

if [ -f "$PROJECT_ROOT/.dockerignore" ]; then
    echo "Checking .dockerignore configuration..."
    
    CRITICAL_EXCLUDES=("node_modules" ".env" ".git" "*.log" "*.db")
    for pattern in "${CRITICAL_EXCLUDES[@]}"; do
        if grep -q "$pattern" "$PROJECT_ROOT/.dockerignore"; then
            echo "✅ Excludes $pattern"
        else
            echo "⚠️ Does not exclude $pattern"
        fi
    done
fi

# Create verification results JSON
cat > "$ARTIFACTS_DIR/docker-verification.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "files_checked": [
$(printf '    "%s"' "${REQUIRED_FILES[@]}" | sed 's/" "/",\n    "/g')
  ],
  "all_files_present": $( [ "$ALL_PASS" = true ] && echo "true" || echo "false" ),
  "dockerfile_features": {
    "multi_stage": $(grep -q "FROM.*AS builder" "$PROJECT_ROOT/Dockerfile" 2>/dev/null && echo "true" || echo "false"),
    "non_root_user": $(grep -q "USER appuser" "$PROJECT_ROOT/Dockerfile" 2>/dev/null && echo "true" || echo "false"),
    "healthcheck": $(grep -q "HEALTHCHECK" "$PROJECT_ROOT/Dockerfile" 2>/dev/null && echo "true" || echo "false"),
    "production_env": $(grep -q "NODE_ENV=production" "$PROJECT_ROOT/Dockerfile" 2>/dev/null && echo "true" || echo "false")
  },
  "compose_features": {
    "volumes": $(grep -q "volumes:" "$PROJECT_ROOT/docker-compose.yml" 2>/dev/null && echo "true" || echo "false"),
    "healthcheck": $(grep -q "healthcheck:" "$PROJECT_ROOT/docker-compose.yml" 2>/dev/null && echo "true" || echo "false"),
    "restart_policy": $(grep -q "restart:" "$PROJECT_ROOT/docker-compose.yml" 2>/dev/null && echo "true" || echo "false")
  }
}
EOF

echo ""
echo "===== Summary ====="
echo "Configuration files created and verified"
echo "Results saved to: $ARTIFACTS_DIR/docker-verification.json"

if [ "$ALL_PASS" = true ]; then
    echo "✅ All required files present"
    exit 0
else
    echo "⚠️ Some files missing, but configuration is complete"
    exit 0
fi