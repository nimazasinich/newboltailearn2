#!/bin/bash
# health-check.sh - Health check script for services

set -e

# Default values
SERVICE=${SERVICE:-"frontend"}
PORT=${PORT:-3000}
ENDPOINT=${ENDPOINT:-"/"}

# Health check function
check_health() {
    local url="http://localhost:${PORT}${ENDPOINT}"
    
    # Try curl first
    if command -v curl &> /dev/null; then
        if curl -f -s -o /dev/null -w "%{http_code}" "$url" | grep -q "^[23]"; then
            echo "Health check passed for $SERVICE at $url"
            exit 0
        else
            echo "Health check failed for $SERVICE at $url"
            exit 1
        fi
    # Fall back to wget
    elif command -v wget &> /dev/null; then
        if wget --quiet --tries=1 --spider "$url"; then
            echo "Health check passed for $SERVICE at $url"
            exit 0
        else
            echo "Health check failed for $SERVICE at $url"
            exit 1
        fi
    # Fall back to nc for basic port check
    elif command -v nc &> /dev/null; then
        if nc -z localhost "$PORT"; then
            echo "Port check passed for $SERVICE on port $PORT"
            exit 0
        else
            echo "Port check failed for $SERVICE on port $PORT"
            exit 1
        fi
    else
        echo "No health check tool available (curl, wget, or nc)"
        exit 1
    fi
}

# Run health check
check_health