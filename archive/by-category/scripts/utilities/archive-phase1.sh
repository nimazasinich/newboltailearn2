#!/bin/bash
# Phase 1: Archive existing backups and archives

source /workspace/intelligent-archive.sh 2>/dev/null

echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Phase 1: Organizing Existing Archives${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"

# Archive existing backup directory
if [ -d "/workspace/backups" ]; then
    echo -e "${BLUE}Moving existing backups directory...${NC}"
    cp -r /workspace/backups "$ARCHIVE_ROOT/by-date/pre-existing-backups" 2>/dev/null
    if [ $? -eq 0 ]; then
        rm -rf /workspace/backups
        echo -e "${GREEN}  ✓ Backups directory archived${NC}"
    fi
fi

# Archive cursor-memory directory
if [ -d "/workspace/cursor-memory" ]; then
    echo -e "${BLUE}Archiving cursor-memory directory...${NC}"
    cp -r /workspace/cursor-memory "$ARCHIVE_ROOT/by-functionality/infrastructure/cursor-memory" 2>/dev/null
    if [ $? -eq 0 ]; then
        rm -rf /workspace/cursor-memory
        echo -e "${GREEN}  ✓ Cursor memory archived${NC}"
    fi
fi

# Archive old documentation files
echo -e "${BLUE}Archiving documentation files...${NC}"
for file in /workspace/*_SUMMARY.md /workspace/*_GUIDE.md /workspace/*_REPORT.md /workspace/*_STATUS.md; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        cp "$file" "$ARCHIVE_ROOT/by-category/documentation/summaries/$filename" 2>/dev/null
        if [ $? -eq 0 ]; then
            rm "$file"
            echo -e "${GREEN}  ✓ Archived: $filename${NC}"
        fi
    fi
done

echo -e "${GREEN}Phase 1 completed!${NC}"