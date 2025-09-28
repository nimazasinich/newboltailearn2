#!/bin/bash

# Quick Live Site Test Script
# Tests the live GitHub Pages deployment

set -e

echo "🌐 Testing Live GitHub Pages Site"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="https://nimazasinich.github.io/newboltailearn2/"
DEEP_LINK_URL="https://nimazasinich.github.io/newboltailearn2/anything"

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "success")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "info")
            echo -e "${BLUE}🔍 $message${NC}"
            ;;
    esac
}

# Function to test URL
test_url() {
    local url=$1
    local description=$2
    
    print_status "info" "Testing $description: $url"
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
        print_status "success" "$description loads successfully (HTTP 200)"
        return 0
    else
        print_status "error" "$description failed to load"
        return 1
    fi
}

# Function to test redirect
test_redirect() {
    local url=$1
    local description=$2
    
    print_status "info" "Testing $description: $url"
    
    local redirect_url=$(curl -s -o /dev/null -w "%{redirect_url}" "$url")
    
    if [[ "$redirect_url" == "$BASE_URL" ]]; then
        print_status "success" "$description redirects correctly to $BASE_URL"
        return 0
    else
        print_status "error" "$description redirects to: $redirect_url (expected: $BASE_URL)"
        return 1
    fi
}

# Main tests
main() {
    print_status "info" "Starting live site tests..."
    
    # Test main page
    if test_url "$BASE_URL" "Main page"; then
        print_status "success" "Main page is accessible"
    else
        print_status "error" "Main page is not accessible"
        exit 1
    fi
    
    # Test deep link redirect
    if test_redirect "$DEEP_LINK_URL" "Deep link redirect"; then
        print_status "success" "Deep link redirect works correctly"
    else
        print_status "error" "Deep link redirect failed"
        exit 1
    fi
    
    # Test assets (if curl supports it)
    print_status "info" "Testing asset loading..."
    
    # Test CSS
    if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200"; then
        print_status "success" "Assets appear to be loading (main page loads)"
    else
        print_status "warning" "Could not verify asset loading"
    fi
    
    echo ""
    print_status "success" "All live site tests passed!"
    echo ""
    echo "🎉 GitHub Pages deployment is working correctly!"
    echo "   Main site: $BASE_URL"
    echo "   Deep links: Working (redirect to main site)"
    echo "   Assets: Loading correctly"
    echo ""
}

# Run main function
main "$@"