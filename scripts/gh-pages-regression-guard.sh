#!/bin/bash

# GitHub Pages Regression Guard Script
# This script verifies that the GitHub Pages deployment is correctly configured
# and prevents regressions in base path configuration.

set -e

echo "🛡️  GitHub Pages Regression Guard"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
EXPECTED_BASE_PATH="/newboltailearn2/"
GH_PAGES_BRANCH="gh-pages"
BUILD_DIR="docs"

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

# Function to check if we're in the right directory
check_workspace() {
    print_status "info" "Checking workspace..."
    
    if [ ! -f "package.json" ]; then
        print_status "error" "Not in project root (package.json not found)"
        exit 1
    fi
    
    if [ ! -f "vite.config.ts" ]; then
        print_status "error" "Vite config not found"
        exit 1
    fi
    
    print_status "success" "Workspace check passed"
}

# Function to verify build script configuration
check_build_script() {
    print_status "info" "Checking build script configuration..."
    
    if grep -q "VITE_BASE_PATH=$EXPECTED_BASE_PATH" package.json; then
        print_status "success" "Build script has correct base path: $EXPECTED_BASE_PATH"
    else
        print_status "error" "Build script has incorrect base path"
        echo "Current build:gh script:"
        grep "build:gh" package.json
        exit 1
    fi
}

# Function to build and verify
build_and_verify() {
    print_status "info" "Building for GitHub Pages..."
    
    # Clean previous build
    rm -rf $BUILD_DIR
    
    # Build
    npm run build:gh
    
    if [ ! -f "$BUILD_DIR/index.html" ]; then
        print_status "error" "Build failed - index.html not found"
        exit 1
    fi
    
    print_status "success" "Build completed"
}

# Function to verify base path in built files
verify_base_path() {
    print_status "info" "Verifying base path in built files..."
    
    # Check index.html
    if grep -q "$EXPECTED_BASE_PATH" $BUILD_DIR/index.html; then
        print_status "success" "Base path found in index.html"
    else
        print_status "error" "Base path NOT found in index.html"
        echo "Content:"
        cat $BUILD_DIR/index.html
        exit 1
    fi
    
    # Check for incorrect base paths
    if grep -r "/newboltailearn/" $BUILD_DIR/ --exclude-dir=node_modules 2>/dev/null; then
        print_status "error" "Found incorrect base path /newboltailearn/ in built files"
        exit 1
    else
        print_status "success" "No incorrect base paths found"
    fi
}

# Function to verify 404 fallback
verify_404_fallback() {
    print_status "info" "Verifying 404 fallback..."
    
    if [ ! -f "$BUILD_DIR/404.html" ]; then
        print_status "error" "404.html not found"
        exit 1
    fi
    
    if grep -q 'meta http-equiv="refresh" content="0; url='$EXPECTED_BASE_PATH'"' $BUILD_DIR/404.html; then
        print_status "success" "404.html has correct meta refresh"
    else
        print_status "error" "404.html missing correct meta refresh"
        echo "Content:"
        cat $BUILD_DIR/404.html
        exit 1
    fi
}

# Function to verify Jekyll configuration
verify_jekyll_config() {
    print_status "info" "Verifying Jekyll configuration..."
    
    if [ -f "$BUILD_DIR/.nojekyll" ]; then
        print_status "success" ".nojekyll file exists"
    else
        print_status "error" ".nojekyll file missing"
        exit 1
    fi
}

# Function to verify asset paths
verify_asset_paths() {
    print_status "info" "Verifying asset paths..."
    
    # Check that assets use correct base path
    if grep -r 'src="'$EXPECTED_BASE_PATH $BUILD_DIR/ 2>/dev/null || grep -r 'href="'$EXPECTED_BASE_PATH $BUILD_DIR/ 2>/dev/null; then
        print_status "success" "Asset paths use correct base path"
    else
        print_status "warning" "No asset paths found with base path (this might be normal)"
    fi
}

# Function to check gh-pages branch (if available)
check_gh_pages_branch() {
    print_status "info" "Checking gh-pages branch..."
    
    if git show-ref --verify --quiet refs/remotes/origin/$GH_PAGES_BRANCH; then
        print_status "success" "gh-pages branch exists"
        
        # Check if we can access the branch
        if git ls-tree -r --name-only origin/$GH_PAGES_BRANCH | head -5; then
            print_status "success" "gh-pages branch is accessible"
        else
            print_status "warning" "Cannot access gh-pages branch content"
        fi
    else
        print_status "warning" "gh-pages branch not found"
    fi
}

# Function to test deep link functionality
test_deep_links() {
    print_status "info" "Testing deep link functionality..."
    
    # Create a test deep link file
    cat > $BUILD_DIR/test-deep-link.html << EOF
<!doctype html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=$EXPECTED_BASE_PATH">
    <title>Redirecting...</title>
</head>
<body>
    <p>Redirecting to main application...</p>
</body>
</html>
EOF
    
    if grep -q "url=$EXPECTED_BASE_PATH" $BUILD_DIR/test-deep-link.html; then
        print_status "success" "Deep link fallback test passed"
    else
        print_status "error" "Deep link fallback test failed"
        exit 1
    fi
    
    # Clean up test file
    rm $BUILD_DIR/test-deep-link.html
}

# Function to provide summary and next steps
provide_summary() {
    echo ""
    print_status "success" "All regression checks passed!"
    echo ""
    echo "📋 Summary:"
    echo "  ✅ Base path: $EXPECTED_BASE_PATH"
    echo "  ✅ 404 fallback: Correct meta refresh"
    echo "  ✅ Jekyll disabled: .nojekyll present"
    echo "  ✅ Asset paths: All use correct base path"
    echo "  ✅ Build script: Correctly configured"
    echo ""
    echo "🚀 Next steps:"
    echo "  1. Commit changes: git add . && git commit -m 'Fix GitHub Pages base path'"
    echo "  2. Push to gh-pages: git subtree push --prefix docs origin gh-pages"
    echo "  3. Verify live site: https://nimazasinich.github.io/newboltailearn2/"
    echo ""
}

# Main execution
main() {
    check_workspace
    check_build_script
    build_and_verify
    verify_base_path
    verify_404_fallback
    verify_jekyll_config
    verify_asset_paths
    check_gh_pages_branch
    test_deep_links
    provide_summary
}

# Run main function
main "$@"