#!/bin/bash
# Phase 5: Archive test files, documentation, and other redundant files

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
echo -e "${GREEN}   Phase 5: Archiving Test Files & Documentation${NC}"
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
        
        cp "$source" "$dest_dir/$filename"
        if [ $? -eq 0 ]; then
            rm "$source"
            echo -e "${GREEN}  ✓ Archived${NC}"
        else
            echo -e "${RED}  ✗ Failed${NC}"
        fi
    fi
}

echo -e "${BLUE}Archiving test runner files...${NC}"

# Test runner files
archive_file "/workspace/test-enhanced-app.js" \
    "$ARCHIVE_ROOT/by-category/test-files/runners" \
    "test,enhanced-app,validation" \
    "Enhanced app test file"

archive_file "/workspace/test-phase2.js" \
    "$ARCHIVE_ROOT/by-category/test-files/runners" \
    "test,phase2,validation" \
    "Phase 2 test file"

archive_file "/workspace/test-training.js" \
    "$ARCHIVE_ROOT/by-category/test-files/runners" \
    "test,training,validation" \
    "Training test file"

archive_file "/workspace/test-database-fixes.js" \
    "$ARCHIVE_ROOT/by-category/test-files/validators" \
    "test,database,fixes" \
    "Database fixes test"

archive_file "/workspace/test_complete_flow.js" \
    "$ARCHIVE_ROOT/by-category/test-files/runners" \
    "test,complete-flow,e2e" \
    "Complete flow test"

archive_file "/workspace/test_dashboard_flow.js" \
    "$ARCHIVE_ROOT/by-category/test-files/runners" \
    "test,dashboard,flow" \
    "Dashboard flow test"

archive_file "/workspace/test_page_content.js" \
    "$ARCHIVE_ROOT/by-category/test-files/validators" \
    "test,page,content" \
    "Page content test"

archive_file "/workspace/test-worker-credentials.js" \
    "$ARCHIVE_ROOT/by-category/test-files/validators" \
    "test,worker,credentials" \
    "Worker credentials test"

archive_file "/workspace/e2e-test-runner.js" \
    "$ARCHIVE_ROOT/by-category/test-files/runners" \
    "test,e2e,runner" \
    "E2E test runner"

archive_file "/workspace/integration-test-runner.js" \
    "$ARCHIVE_ROOT/by-category/test-files/runners" \
    "test,integration,runner" \
    "Integration test runner"

archive_file "/workspace/master-test-runner.js" \
    "$ARCHIVE_ROOT/by-category/test-files/runners" \
    "test,master,runner" \
    "Master test runner"

archive_file "/workspace/stress-test-runner.js" \
    "$ARCHIVE_ROOT/by-category/test-files/runners" \
    "test,stress,performance" \
    "Stress test runner"

archive_file "/workspace/run-tests.js" \
    "$ARCHIVE_ROOT/by-category/test-files/runners" \
    "test,runner,generic" \
    "Generic test runner"

archive_file "/workspace/validate-dashboard.js" \
    "$ARCHIVE_ROOT/by-category/test-files/validators" \
    "validation,dashboard,test" \
    "Dashboard validator"

echo -e "${BLUE}Archiving HTML test files...${NC}"

# HTML test files
archive_file "/workspace/test-frontend.html" \
    "$ARCHIVE_ROOT/by-category/test-files/html-tests" \
    "test,frontend,html" \
    "Frontend HTML test"

archive_file "/workspace/test-worker-login.html" \
    "$ARCHIVE_ROOT/by-category/test-files/html-tests" \
    "test,worker,login,html" \
    "Worker login HTML test"

archive_file "/workspace/cursor-install.html" \
    "$ARCHIVE_ROOT/by-category/test-files/html-tests" \
    "cursor,install,html" \
    "Cursor install HTML"

archive_file "/workspace/enhanced-install.html" \
    "$ARCHIVE_ROOT/by-category/test-files/html-tests" \
    "enhanced,install,html" \
    "Enhanced install HTML"

echo -e "${BLUE}Archiving documentation and report files...${NC}"

# Documentation files (already moved most in Phase 1, get remaining)
archive_file "/workspace/COMPREHENSIVE-INTEGRATION.md" \
    "$ARCHIVE_ROOT/by-category/documentation/guides" \
    "documentation,integration,comprehensive" \
    "Comprehensive integration guide"

archive_file "/workspace/COMPLETE-INTEGRATION-SUMMARY.md" \
    "$ARCHIVE_ROOT/by-category/documentation/summaries" \
    "documentation,integration,summary" \
    "Integration summary"

archive_file "/workspace/DOCKER_COMMANDS.md" \
    "$ARCHIVE_ROOT/by-category/documentation/guides" \
    "documentation,docker,commands" \
    "Docker commands guide"

archive_file "/workspace/DOCKER_COMPLETE.md" \
    "$ARCHIVE_ROOT/by-category/documentation/guides" \
    "documentation,docker,complete" \
    "Complete Docker guide"

archive_file "/workspace/DOCKER_SETUP.md" \
    "$ARCHIVE_ROOT/by-category/documentation/guides" \
    "documentation,docker,setup" \
    "Docker setup guide"

archive_file "/workspace/DOCKER_TROUBLESHOOTING.md" \
    "$ARCHIVE_ROOT/by-category/documentation/guides" \
    "documentation,docker,troubleshooting" \
    "Docker troubleshooting"

archive_file "/workspace/DEPLOYMENT.md" \
    "$ARCHIVE_ROOT/by-category/documentation/guides" \
    "documentation,deployment,guide" \
    "Deployment guide"

archive_file "/workspace/IMPLEMENTATION_COMPLETE.md" \
    "$ARCHIVE_ROOT/by-category/documentation/summaries" \
    "documentation,implementation,complete" \
    "Implementation complete doc"

archive_file "/workspace/PRODUCTION_READY_IMPLEMENTATION.md" \
    "$ARCHIVE_ROOT/by-category/documentation/summaries" \
    "documentation,production,ready" \
    "Production ready doc"

archive_file "/workspace/PROPER-INTEGRATION-PLAN.md" \
    "$ARCHIVE_ROOT/by-category/documentation/guides" \
    "documentation,integration,plan" \
    "Integration plan"

archive_file "/workspace/fix_typescript_imports.md" \
    "$ARCHIVE_ROOT/by-category/documentation/guides" \
    "documentation,typescript,fixes" \
    "TypeScript import fixes"

archive_file "/workspace/merge-commands.md" \
    "$ARCHIVE_ROOT/by-category/documentation/guides" \
    "documentation,git,merge" \
    "Merge commands doc"

archive_file "/workspace/GIT_COMMANDS_EXECUTED.md" \
    "$ARCHIVE_ROOT/by-category/documentation/reports" \
    "documentation,git,commands" \
    "Git commands executed"

echo -e "${BLUE}Archiving utility and helper files...${NC}"

# Utility files
archive_file "/workspace/clean-install.js" \
    "$ARCHIVE_ROOT/by-category/scripts/utilities" \
    "utility,install,clean" \
    "Clean install utility"

archive_file "/workspace/db-healer.js" \
    "$ARCHIVE_ROOT/by-category/scripts/utilities" \
    "utility,database,healer" \
    "Database healer utility"

archive_file "/workspace/env-healer.js" \
    "$ARCHIVE_ROOT/by-category/scripts/utilities" \
    "utility,environment,healer" \
    "Environment healer utility"

archive_file "/workspace/git-safety.js" \
    "$ARCHIVE_ROOT/by-category/scripts/utilities" \
    "utility,git,safety" \
    "Git safety utility"

archive_file "/workspace/create-cursor-install-link.js" \
    "$ARCHIVE_ROOT/by-category/scripts/utilities" \
    "utility,cursor,install" \
    "Cursor install link creator"

archive_file "/workspace/create-enhanced-install-link.js" \
    "$ARCHIVE_ROOT/by-category/scripts/utilities" \
    "utility,enhanced,install" \
    "Enhanced install link creator"

archive_file "/workspace/start.js" \
    "$ARCHIVE_ROOT/by-category/servers/deprecated" \
    "server,start,wrapper" \
    "Start wrapper script"

echo -e "${BLUE}Archiving text and configuration files...${NC}"

# Text files
archive_file "/workspace/cursor-install-link.txt" \
    "$ARCHIVE_ROOT/by-category/documentation/reports" \
    "cursor,install,link" \
    "Cursor install link"

archive_file "/workspace/enhanced-install-link.txt" \
    "$ARCHIVE_ROOT/by-category/documentation/reports" \
    "enhanced,install,link" \
    "Enhanced install link"

archive_file "/workspace/example_usage.txt" \
    "$ARCHIVE_ROOT/by-category/documentation/guides" \
    "documentation,usage,example" \
    "Example usage"

archive_file "/workspace/EXECUTE_IMMEDIATELY.txt" \
    "$ARCHIVE_ROOT/by-category/documentation/reports" \
    "documentation,execute,urgent" \
    "Execute immediately doc"

archive_file "/workspace/ONE_LINE_COMMAND.txt" \
    "$ARCHIVE_ROOT/by-category/documentation/reports" \
    "documentation,command,oneline" \
    "One line command"

archive_file "/workspace/githu.txt" \
    "$ARCHIVE_ROOT/by-category/documentation/reports" \
    "documentation,github,typo" \
    "GitHub typo file"

echo -e "${BLUE}Archiving file lists and reports...${NC}"

# File lists
archive_file "/workspace/all_files_and_folders.txt" \
    "$ARCHIVE_ROOT/by-category/documentation/reports" \
    "report,files,complete" \
    "All files list"

archive_file "/workspace/clean_file_list.txt" \
    "$ARCHIVE_ROOT/by-category/documentation/reports" \
    "report,files,clean" \
    "Clean file list"

archive_file "/workspace/complete_file_list.txt" \
    "$ARCHIVE_ROOT/by-category/documentation/reports" \
    "report,files,complete" \
    "Complete file list"

archive_file "/workspace/file_list.txt" \
    "$ARCHIVE_ROOT/by-category/documentation/reports" \
    "report,files,basic" \
    "Basic file list"

archive_file "/workspace/tree_structure.txt" \
    "$ARCHIVE_ROOT/by-category/documentation/reports" \
    "report,structure,tree" \
    "Tree structure report"

echo -e "${BLUE}Archiving config and batch files...${NC}"

# Config and batch files
archive_file "/workspace/enterprise-config.json" \
    "$ARCHIVE_ROOT/by-category/configs/old-configs" \
    "config,enterprise,json" \
    "Enterprise config"

archive_file "/workspace/reliability-config.json" \
    "$ARCHIVE_ROOT/by-category/configs/old-configs" \
    "config,reliability,json" \
    "Reliability config"

archive_file "/workspace/launch-enhanced-app.bat" \
    "$ARCHIVE_ROOT/by-category/scripts/utilities" \
    "batch,windows,enhanced" \
    "Windows enhanced launch"

archive_file "/workspace/launch-real-system.bat" \
    "$ARCHIVE_ROOT/by-category/scripts/utilities" \
    "batch,windows,system" \
    "Windows system launch"

archive_file "/workspace/setup-cursor-mcp.bat" \
    "$ARCHIVE_ROOT/by-category/scripts/utilities" \
    "batch,windows,cursor" \
    "Windows cursor setup"

echo -e "${BLUE}Archiving patch files...${NC}"

# Patch files
for patch in /workspace/*.patch; do
    if [ -f "$patch" ]; then
        archive_file "$patch" \
            "$ARCHIVE_ROOT/by-category/documentation/reports" \
            "patch,git,changes" \
            "Git patch file"
    fi
done

echo -e "${BLUE}Archiving test result files...${NC}"

# Test results
archive_file "/workspace/test-results-complete.json" \
    "$ARCHIVE_ROOT/by-category/test-files/results" \
    "test,results,complete" \
    "Complete test results"

archive_file "/workspace/test-results-integration.json" \
    "$ARCHIVE_ROOT/by-category/test-files/results" \
    "test,results,integration" \
    "Integration test results"

archive_file "/workspace/test-results-stress.json" \
    "$ARCHIVE_ROOT/by-category/test-files/results" \
    "test,results,stress" \
    "Stress test results"

echo -e "${BLUE}Archiving database files...${NC}"

# Database backups
archive_file "/workspace/test_migration.db" \
    "$ARCHIVE_ROOT/by-functionality/database" \
    "database,test,migration" \
    "Test migration database"

archive_file "/workspace/persian_legal_ai.db.backup" \
    "$ARCHIVE_ROOT/by-functionality/database" \
    "database,backup,persian" \
    "Persian legal AI database backup"

echo -e "${BLUE}Archiving other misc files...${NC}"

# Misc files
archive_file "/workspace/et --soft c56aefd" \
    "$ARCHIVE_ROOT/by-category/documentation/reports" \
    "misc,git,command-typo" \
    "Git command typo file"

archive_file "/workspace/ync local with remote" \
    "$ARCHIVE_ROOT/by-category/documentation/reports" \
    "misc,sync,typo" \
    "Sync typo file"

archive_file "/workspace/404.html" \
    "$ARCHIVE_ROOT/by-functionality/frontend" \
    "frontend,404,html" \
    "404 error page"

echo -e "${GREEN}Phase 5 completed! Test files and documentation archived.${NC}"