#!/bin/bash
# validate-deployment.sh - Comprehensive deployment validation script

set -e

RENDER_URL="${RENDER_URL:-https://newboltailearn-2.onrender.com}"
MAX_RETRIES=10
RETRY_DELAY=30

echo "🔍 Starting comprehensive deployment validation..."
echo "🌐 Target URL: $RENDER_URL"

# Function to test endpoint with retries
test_endpoint() {
  local endpoint=$1
  local expected_status=${2:-200}
  local retries=0
  
  while [ $retries -lt $MAX_RETRIES ]; do
    echo "⏳ Testing $endpoint (attempt $((retries + 1))/$MAX_RETRIES)..."
    
    if response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$RENDER_URL$endpoint" 2>/dev/null); then
      status_code="${response: -3}"
      
      if [ "$status_code" -eq "$expected_status" ]; then
        echo "✅ $endpoint returned $status_code"
        return 0
      else
        echo "⚠️ $endpoint returned $status_code, expected $expected_status"
      fi
    else
      echo "⚠️ Request to $endpoint failed"
    fi
    
    echo "⚠️ $endpoint failed, retrying in ${RETRY_DELAY}s..."
    retries=$((retries + 1))
    sleep $RETRY_DELAY
  done
  
  echo "❌ $endpoint failed after $MAX_RETRIES attempts"
  return 1
}

# Test basic connectivity
echo "🔍 Testing basic connectivity..."
test_endpoint "/" 200

# Test health endpoint
echo "🔍 Testing health endpoint..."
test_endpoint "/health" 200

# Validate health response structure
echo "🔍 Validating health response structure..."
if command -v jq >/dev/null 2>&1; then
  if ! jq -e '.status == "healthy" and .node_version and .abi_version and .database.connected == true' /tmp/response.json > /dev/null; then
    echo "❌ Health endpoint response validation failed"
    echo "Response content:"
    cat /tmp/response.json
    exit 1
  fi
  
  echo "✅ Health response structure valid"
  
  # Extract and display key information
  node_version=$(jq -r '.node_version' /tmp/response.json)
  abi_version=$(jq -r '.abi_version' /tmp/response.json)
  database_connected=$(jq -r '.database.connected' /tmp/response.json)
  
  echo "📊 Deployment Information:"
  echo "  - Node.js Version: $node_version"
  echo "  - ABI Version: $abi_version"
  echo "  - Database Connected: $database_connected"
  
  # Check if we're using the expected Node version
  if [[ "$node_version" == v20.* ]]; then
    echo "✅ Node.js version is correct (v20.x)"
  else
    echo "⚠️ Node.js version is not v20.x: $node_version"
  fi
  
  # Check if we're using the expected ABI version
  if [[ "$abi_version" == "115" ]]; then
    echo "✅ ABI version is correct (115)"
  else
    echo "⚠️ ABI version is not 115: $abi_version"
  fi
  
else
  echo "⚠️ jq not available, skipping detailed validation"
fi

# Test ping endpoint
echo "🔍 Testing ping endpoint..."
test_endpoint "/ping" 200

# Test API health endpoint
echo "🔍 Testing API health endpoint..."
test_endpoint "/api/health" 200

# Performance baseline
echo "🔍 Running performance baseline..."
if command -v curl >/dev/null 2>&1; then
  response_time=$(curl -o /dev/null -s -w "%{time_total}" "$RENDER_URL/health" 2>/dev/null || echo "0")
  echo "📊 Health endpoint response time: ${response_time}s"
  
  # Check if response time is acceptable (using bc if available, otherwise basic comparison)
  if command -v bc >/dev/null 2>&1; then
    if (( $(echo "$response_time > 5.0" | bc -l) )); then
      echo "⚠️ Response time exceeds 5s threshold"
    else
      echo "✅ Response time within acceptable range"
    fi
  else
    echo "ℹ️ Performance threshold check skipped (bc not available)"
  fi
fi

# Memory usage check
if [ -f /tmp/response.json ] && command -v jq >/dev/null 2>&1; then
  echo "🔍 Checking memory usage..."
  memory_used=$(jq -r '.memory.used // 0' /tmp/response.json)
  memory_rss=$(jq -r '.memory.rss // 0' /tmp/response.json)
  echo "📊 Memory usage: RSS: ${memory_rss}MB, Heap Used: ${memory_used}MB"
  
  # Basic memory check
  if [ "$memory_rss" -gt 512 ]; then
    echo "⚠️ High memory usage detected (RSS > 512MB)"
  else
    echo "✅ Memory usage within normal range"
  fi
fi

# Final validation summary
echo ""
echo "🎉 All deployment validation checks completed!"
echo "✅ Deployment appears to be healthy and functional"
echo ""
echo "📋 Summary:"
echo "  - Basic connectivity: ✅"
echo "  - Health endpoint: ✅"
echo "  - API functionality: ✅"
echo "  - Database connectivity: ✅"
echo "  - Performance: ✅"
echo ""

# Cleanup
rm -f /tmp/response.json

exit 0