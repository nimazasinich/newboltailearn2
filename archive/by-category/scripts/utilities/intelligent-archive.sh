#!/bin/bash
# Intelligent Archive System - Smart file archiving with tagging
# Created: $(date +%Y-%m-%d)
# Purpose: Safely archive redundant files while preserving all functionality

ARCHIVE_ROOT="/workspace/archive"
DATE_STAMP=$(date +%Y-%m-%d)
TIME_STAMP=$(date +%H%M%S)
LOG_FILE="$ARCHIVE_ROOT/metadata/archive-log-$DATE_STAMP.json"
TAG_FILE="$ARCHIVE_ROOT/metadata/file-tags.json"
RESTORATION_GUIDE="$ARCHIVE_ROOT/metadata/restoration-guide.md"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create comprehensive archive structure
create_archive_structure() {
    echo -e "${BLUE}Creating intelligent archive structure...${NC}"
    
    # By-date structure
    mkdir -p "$ARCHIVE_ROOT/by-date/$DATE_STAMP-cleanup"/{duplicate-servers,legacy-components,old-scripts,redundant-configs,mcp-servers,test-files}
    
    # By-category structure  
    mkdir -p "$ARCHIVE_ROOT/by-category/servers"/{production,development,deprecated,experimental}
    mkdir -p "$ARCHIVE_ROOT/by-category/components"/{ui-legacy,charts-old,dashboards}
    mkdir -p "$ARCHIVE_ROOT/by-category/scripts"/{deployment,testing,utilities,git-automation}
    mkdir -p "$ARCHIVE_ROOT/by-category/mcp-servers"/{v1,v2,v3,experiments}
    mkdir -p "$ARCHIVE_ROOT/by-category/configs"/{docker,build,old-configs}
    mkdir -p "$ARCHIVE_ROOT/by-category/documentation"/{guides,summaries,reports}
    mkdir -p "$ARCHIVE_ROOT/by-category/test-files"/{runners,validators,html-tests}
    
    # By-functionality structure
    mkdir -p "$ARCHIVE_ROOT/by-functionality"/{authentication,ai-ml,database,frontend,infrastructure,testing}
    
    # Metadata directory
    mkdir -p "$ARCHIVE_ROOT/metadata"
    
    # Initialize log files if they don't exist
    if [ ! -f "$LOG_FILE" ]; then
        echo "[]" > "$LOG_FILE"
    fi
    
    if [ ! -f "$TAG_FILE" ]; then
        echo "{}" > "$TAG_FILE"
    fi
    
    echo -e "${GREEN}Archive structure created successfully!${NC}"
}

# Function to safely archive a file with tags
archive_with_tags() {
    local source_file=$1
    local category_path=$2
    local tags=$3
    local reason=$4
    
    if [ ! -f "$source_file" ]; then
        echo -e "${YELLOW}File not found: $source_file${NC}"
        return 1
    fi
    
    local filename=$(basename "$source_file")
    local archive_path="$ARCHIVE_ROOT/$category_path"
    
    echo -e "${BLUE}Archiving: $source_file${NC}"
    echo "  → Target: $archive_path"
    echo "  → Tags: $tags"
    echo "  → Reason: $reason"
    
    # Create target directory
    mkdir -p "$archive_path"
    
    # Copy file first (safer than move)
    cp "$source_file" "$archive_path/$filename" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        # Log the archive operation
        local log_entry="{\"file\": \"$source_file\", \"archived_to\": \"$archive_path/$filename\", \"tags\": \"$tags\", \"reason\": \"$reason\", \"date\": \"$DATE_STAMP\", \"time\": \"$TIME_STAMP\", \"status\": \"success\"}"
        
        # Append to JSON log (handle array format)
        if [ -f "$LOG_FILE" ]; then
            # Remove closing bracket, add comma and new entry, add closing bracket
            sed -i '$ s/]$//' "$LOG_FILE" 2>/dev/null || sed -i '' '$ s/]$//' "$LOG_FILE"
            if [ $(wc -l < "$LOG_FILE") -gt 1 ]; then
                echo "," >> "$LOG_FILE"
            fi
            echo "  $log_entry" >> "$LOG_FILE"
            echo "]" >> "$LOG_FILE"
        fi
        
        # Now remove the original file
        rm "$source_file"
        echo -e "${GREEN}  ✓ Successfully archived${NC}"
        return 0
    else
        echo -e "${RED}  ✗ Failed to archive${NC}"
        return 1
    fi
}

# Function to archive with verification
archive_with_verification() {
    local source_file=$1
    local category_path=$2
    local tags=$3
    local reason=$4
    
    # First check if file exists in imports/requires
    echo -e "${BLUE}Verifying dependencies for: $source_file${NC}"
    
    # Check for imports in src and server directories
    local import_count=$(grep -r "$(basename $source_file .js)\|$(basename $source_file .mjs)" /workspace/src /workspace/server 2>/dev/null | wc -l)
    
    if [ $import_count -gt 0 ]; then
        echo -e "${YELLOW}  ⚠ Warning: File may be imported by $import_count other files${NC}"
        echo "  Proceeding with caution..."
    fi
    
    # Archive the file
    archive_with_tags "$source_file" "$category_path" "$tags" "$reason"
}

# Create restoration guide
create_restoration_guide() {
    cat > "$RESTORATION_GUIDE" << 'EOF'
# Archive Restoration Guide

## Quick Restoration

To restore any archived file:

```bash
# 1. Find the file in archive log
grep "filename.js" /workspace/archive/metadata/archive-log-*.json

# 2. Copy back from archive
cp /workspace/archive/path/to/file.js /workspace/original/location/

# 3. Test functionality
npm test
```

## Archive Structure

- **by-date/**: Files organized by archive date
- **by-category/**: Files organized by type (servers, components, scripts, etc.)
- **by-functionality/**: Files organized by feature area
- **metadata/**: Logs, tags, and documentation

## Tag System

Files are tagged with:
- **Status**: unused, deprecated, superseded, experimental
- **Version**: v1, v2, v3, legacy, latest
- **Purpose**: development, testing, backup, research
- **Risk**: safe-archive, needs-verification

## Emergency Full Restore

If needed, restore everything:

```bash
# Restore all archived files
find /workspace/archive -type f -name "*.js" -o -name "*.mjs" | while read f; do
    # Logic to restore based on metadata
    echo "Would restore: $f"
done
```

## Contact

For questions about archived files, check:
- archive-log-*.json for archive history
- file-tags.json for categorization
EOF
    
    echo -e "${GREEN}Restoration guide created${NC}"
}

# Main execution
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Intelligent Archive System - Starting${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"

# Create archive structure
create_archive_structure

# Create restoration guide
create_restoration_guide

echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Archive system ready for operations${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"