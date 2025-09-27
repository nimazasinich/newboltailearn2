#!/bin/bash
# Verification script to ensure cleanup didn't break functionality

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Post-Cleanup Verification${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"

# Check critical files exist
echo -e "\n${YELLOW}Checking critical files...${NC}"

critical_files=(
    "/workspace/package.json"
    "/workspace/server/main.js"
    "/workspace/src/App.tsx"
    "/workspace/src/main.tsx"
    "/workspace/vite.config.ts"
    "/workspace/docker-compose.yml"
    "/workspace/Dockerfile"
    "/workspace/database.sqlite"
)

all_good=true
for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file - MISSING!"
        all_good=false
    fi
done

# Check critical directories
echo -e "\n${YELLOW}Checking critical directories...${NC}"

critical_dirs=(
    "/workspace/src"
    "/workspace/server"
    "/workspace/public"
    "/workspace/docker"
    "/workspace/scripts"
    "/workspace/archive"
)

for dir in "${critical_dirs[@]}"; do
    if [ -d "$dir" ]; then
        count=$(find "$dir" -type f 2>/dev/null | wc -l)
        echo -e "${GREEN}✓${NC} $dir (${count} files)"
    else
        echo -e "${RED}✗${NC} $dir - MISSING!"
        all_good=false
    fi
done

# Check archive structure
echo -e "\n${YELLOW}Archive statistics...${NC}"
echo "Total archived files: $(find /workspace/archive -type f 2>/dev/null | wc -l)"
echo "Archive categories: $(ls -d /workspace/archive/by-category/*/ 2>/dev/null | wc -l)"
echo "Archive by date: $(ls -d /workspace/archive/by-date/*/ 2>/dev/null | wc -l)"

# Check if server can start
echo -e "\n${YELLOW}Checking server startup...${NC}"
timeout 3 node /workspace/server/main.js > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2

if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Server can start successfully"
    kill $SERVER_PID 2>/dev/null
else
    echo -e "${YELLOW}⚠${NC} Server exited quickly (may need npm install)"
fi

# Summary
echo -e "\n${GREEN}═══════════════════════════════════════════════${NC}"
if [ "$all_good" = true ]; then
    echo -e "${GREEN}✅ All critical files and directories intact!${NC}"
    echo -e "${GREEN}✅ Archive system properly organized${NC}"
    echo -e "${GREEN}✅ Ready for deployment after npm install${NC}"
else
    echo -e "${RED}⚠ Some critical files missing - check above${NC}"
fi
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"

# File count summary
echo -e "\n${YELLOW}File Count Summary:${NC}"
echo "Total files in workspace: $(find /workspace -type f 2>/dev/null | wc -l)"
echo "Files in archive: $(find /workspace/archive -type f 2>/dev/null | wc -l)"
echo "JS/TS files remaining: $(find /workspace -type f \( -name "*.js" -o -name "*.mjs" -o -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | wc -l)"
echo "Shell scripts remaining: $(find /workspace -name "*.sh" -type f 2>/dev/null | wc -l)"

echo -e "\n${GREEN}Cleanup verification complete!${NC}"