#!/bin/bash
# Script to review the intelligent file organization changes

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Pull Request Review Helper${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"

# Show branch information
echo -e "\n${YELLOW}Branch Information:${NC}"
git branch -vv | grep "*"
echo "Remote URL: $(git remote get-url origin)"

# Show commit summary
echo -e "\n${YELLOW}Commits in this PR:${NC}"
git log origin/main..HEAD --oneline

# Show files changed summary
echo -e "\n${YELLOW}Files Changed Summary:${NC}"
git diff origin/main...HEAD --stat | tail -5

# Count archived files by category
echo -e "\n${YELLOW}Archived Files by Category:${NC}"
echo "Servers: $(find /workspace/archive/by-category/servers -type f 2>/dev/null | wc -l)"
echo "MCP Servers: $(find /workspace/archive/by-category/mcp-servers -type f 2>/dev/null | wc -l)"
echo "Scripts: $(find /workspace/archive/by-category/scripts -type f 2>/dev/null | wc -l)"
echo "Documentation: $(find /workspace/archive/by-category/documentation -type f 2>/dev/null | wc -l)"
echo "Test Files: $(find /workspace/archive/by-category/test-files -type f 2>/dev/null | wc -l)"
echo "Configs: $(find /workspace/archive/by-category/configs -type f 2>/dev/null | wc -l)"

# Show detailed file movements
echo -e "\n${YELLOW}Sample of Archived Files (first 10):${NC}"
git diff origin/main...HEAD --name-status | grep "^D" | head -10

echo -e "\n${YELLOW}Sample of Added Archive Files (first 10):${NC}"
git diff origin/main...HEAD --name-status | grep "^A.*archive/" | head -10

# Check for any potential issues
echo -e "\n${YELLOW}Verification Checks:${NC}"

# Check if main server exists
if [ -f "/workspace/server/main.js" ]; then
    echo -e "${GREEN}✓${NC} Main server preserved"
else
    echo -e "${RED}✗${NC} Main server missing!"
fi

# Check if package.json exists
if [ -f "/workspace/package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json preserved"
else
    echo -e "${RED}✗${NC} package.json missing!"
fi

# Check if src directory exists
if [ -d "/workspace/src" ]; then
    echo -e "${GREEN}✓${NC} Source directory preserved"
else
    echo -e "${RED}✗${NC} Source directory missing!"
fi

# Check archive structure
if [ -d "/workspace/archive/metadata" ]; then
    echo -e "${GREEN}✓${NC} Archive metadata exists"
else
    echo -e "${RED}✗${NC} Archive metadata missing!"
fi

echo -e "\n${YELLOW}PR URL:${NC}"
echo "https://github.com/nimazasinich/newboltailearn2/pull/new/cursor/intelligent-file-organization-and-archiving-2083"

echo -e "\n${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}Review complete! Use the PR template above when creating the PR.${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"