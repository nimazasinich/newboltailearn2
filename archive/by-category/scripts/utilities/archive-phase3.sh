#!/bin/bash
# Phase 3: Archive MCP (Model Context Protocol) server variants

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
echo -e "${GREEN}   Phase 3: Archiving MCP Server Variants${NC}"
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

echo -e "${BLUE}Archiving Model Context Protocol (MCP) server implementations...${NC}"

# Archive MCP JavaScript implementations
archive_file "/workspace/complete-mcp-server.js" \
    "$ARCHIVE_ROOT/by-category/mcp-servers/v1" \
    "v1,complete-implementation,baseline,javascript" \
    "First complete MCP implementation, superseded by enhanced versions"

archive_file "/workspace/persian-mcp-server.js" \
    "$ARCHIVE_ROOT/by-category/mcp-servers/v1" \
    "v1,basic-persian,initial,persian-language" \
    "Basic Persian MCP implementation, replaced by enhanced versions"

archive_file "/workspace/persian-mcp-server-enhanced.js" \
    "$ARCHIVE_ROOT/by-category/mcp-servers/v2" \
    "v2.1,enhanced-persian,improved,persian-language" \
    "Enhanced Persian MCP server, superseded by intelligent version"

archive_file "/workspace/smart-persian-mcp-server.js" \
    "$ARCHIVE_ROOT/by-category/mcp-servers/v2" \
    "v2,improved-persian,smart,persian-language" \
    "Smart Persian MCP server, functionality merged into ultimate version"

archive_file "/workspace/intelligent-persian-mcp-server.js" \
    "$ARCHIVE_ROOT/by-category/mcp-servers/v3" \
    "v3,persian-specialized,intelligent,advanced" \
    "Intelligent Persian language specialized MCP server"

# Archive MCP Module (MJS) implementations
archive_file "/workspace/complete-mcp-server.mjs" \
    "$ARCHIVE_ROOT/by-category/mcp-servers/v1" \
    "v1,complete-implementation,module,esm" \
    "ES Module version of complete MCP server"

archive_file "/workspace/cursor-mcp-server.mjs" \
    "$ARCHIVE_ROOT/by-category/mcp-servers/experiments" \
    "cursor-specific,specialized,experimental" \
    "Cursor-specific MCP server implementation"

archive_file "/workspace/enhanced-cursor-mcp-server.mjs" \
    "$ARCHIVE_ROOT/by-category/mcp-servers/v2" \
    "v2,enhanced-version,cursor-specific,improved" \
    "Enhanced cursor-specific MCP server"

archive_file "/workspace/ultimate-persian-mcp-server.mjs" \
    "$ARCHIVE_ROOT/by-category/mcp-servers/v3" \
    "v3,ultimate-version,persian,final" \
    "Ultimate Persian MCP server implementation"

archive_file "/workspace/smart-persian-mcp-bundle.mjs" \
    "$ARCHIVE_ROOT/by-category/mcp-servers/v2" \
    "v2,bundle,persian,packaged" \
    "Bundled smart Persian MCP server"

# Archive MCP config files
archive_file "/workspace/complete-mcp-config.json" \
    "$ARCHIVE_ROOT/by-category/mcp-servers/configs" \
    "config,v1,complete,json" \
    "Configuration for complete MCP server"

archive_file "/workspace/cursor-mcp-config.json" \
    "$ARCHIVE_ROOT/by-category/mcp-servers/configs" \
    "config,cursor,json" \
    "Configuration for cursor MCP server"

archive_file "/workspace/enhanced-cursor-mcp-config.json" \
    "$ARCHIVE_ROOT/by-category/mcp-servers/configs" \
    "config,enhanced,cursor,json" \
    "Configuration for enhanced cursor MCP server"

# Archive MCP test files
archive_file "/workspace/test-complete-mcp.js" \
    "$ARCHIVE_ROOT/by-category/test-files/mcp-tests" \
    "test,mcp,complete,validation" \
    "Test file for complete MCP server"

archive_file "/workspace/test-mcp-installation.js" \
    "$ARCHIVE_ROOT/by-category/test-files/mcp-tests" \
    "test,mcp,installation,validation" \
    "Test file for MCP installation"

echo -e "${GREEN}Phase 3 completed! MCP server variants archived.${NC}"