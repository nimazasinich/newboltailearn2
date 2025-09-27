#!/bin/bash
# Phase 2: Archive duplicate server implementations

ARCHIVE_ROOT="/workspace/archive"
DATE_STAMP=$(date +%Y-%m-%d)
TIME_STAMP=$(date +%H%M%S)
LOG_FILE="$ARCHIVE_ROOT/metadata/archive-log-$DATE_STAMP.json"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Phase 2: Archiving Duplicate Servers${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"

# Function to archive a file
archive_file() {
    local source=$1
    local dest_dir=$2
    local tags=$3
    local reason=$4
    
    if [ -f "$source" ]; then
        local filename=$(basename "$source")
        mkdir -p "$dest_dir"
        
        echo -e "${BLUE}Archiving: $source${NC}"
        echo "  Tags: $tags"
        echo "  Reason: $reason"
        
        cp "$source" "$dest_dir/$filename"
        if [ $? -eq 0 ]; then
            rm "$source"
            echo -e "${GREEN}  ✓ Archived successfully${NC}"
            
            # Log the operation
            echo "{\"file\": \"$source\", \"archived_to\": \"$dest_dir/$filename\", \"tags\": \"$tags\", \"reason\": \"$reason\", \"timestamp\": \"$DATE_STAMP $TIME_STAMP\"}" >> "$LOG_FILE.tmp"
        else
            echo -e "${RED}  ✗ Failed to archive${NC}"
        fi
    else
        echo -e "${YELLOW}  File not found: $source${NC}"
    fi
}

# Archive duplicate server implementations
echo -e "${BLUE}Note: Keeping /workspace/server/main.js as the production server${NC}"

# Archive server.js (duplicate of main)
archive_file "/workspace/server.js" \
    "$ARCHIVE_ROOT/by-category/servers/deprecated" \
    "duplicate-main,superseded,v1,production-wrapper" \
    "Duplicate wrapper of server/main.js, functionality covered by main.js"

# Archive simple-server.js (simplified version)
archive_file "/workspace/simple-server.js" \
    "$ARCHIVE_ROOT/by-category/servers/development" \
    "testing-only,minimal,development,simplified" \
    "Simplified test server for development, not needed in production"

# Archive integrated-server.js (experimental)
archive_file "/workspace/integrated-server.js" \
    "$ARCHIVE_ROOT/by-category/servers/experimental" \
    "experimental,integration-attempt,incomplete" \
    "Experimental integration server, functionality merged into main.js"

# Archive start-server.js (wrapper script)
archive_file "/workspace/start-server.js" \
    "$ARCHIVE_ROOT/by-category/servers/deprecated" \
    "wrapper-script,deprecated,unused,startup" \
    "Server startup wrapper script, replaced by npm scripts"

# Archive start-unified.js (unified wrapper)
archive_file "/workspace/start-unified.js" \
    "$ARCHIVE_ROOT/by-category/servers/deprecated" \
    "wrapper-script,unified-attempt,unused" \
    "Unified server startup script, functionality in package.json scripts"

# Check if server/index.js exists and archive it
if [ -f "/workspace/server/index.js" ]; then
    archive_file "/workspace/server/index.js" \
        "$ARCHIVE_ROOT/by-category/servers/deprecated" \
        "alternative-impl,replaced-by-main,v1" \
        "Alternative server implementation, replaced by server/main.js"
fi

echo -e "${GREEN}Phase 2 completed! Duplicate servers archived.${NC}"
echo -e "${BLUE}Production server preserved: /workspace/server/main.js${NC}"