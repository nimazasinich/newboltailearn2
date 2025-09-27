#!/bin/bash
# Phase 4: Archive redundant shell scripts

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
echo -e "${GREEN}   Phase 4: Archiving Redundant Shell Scripts${NC}"
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

echo -e "${BLUE}Archiving Git automation scripts...${NC}"

# Git automation scripts
archive_file "/workspace/auto-commit-merge.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/git-automation" \
    "git-automation,deprecated,risky" \
    "Automated git operations, replaced by manual workflows"

archive_file "/workspace/complete-safe-merge.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/git-automation" \
    "merge-utility,manual,safe-version" \
    "Safe merge utility, functionality in git commands"

archive_file "/workspace/execute-merge.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/git-automation" \
    "merge-automation,risky,deprecated" \
    "Automated merge execution, replaced by manual process"

archive_file "/workspace/merge_all_branches.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/git-automation" \
    "bulk-merge,dangerous,deprecated" \
    "Bulk branch merging, too risky for production"

archive_file "/workspace/commit-and-merge.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/git-automation" \
    "git-automation,commit-merge,deprecated" \
    "Combined commit and merge, replaced by separate operations"

archive_file "/workspace/safe-merge.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/git-automation" \
    "merge-utility,safe,backup" \
    "Safe merge script, kept for reference"

archive_file "/workspace/replace_branch_with_main.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/git-automation" \
    "branch-replace,dangerous,deprecated" \
    "Branch replacement script, risky operation"

archive_file "/workspace/create_runflare_branch.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/git-automation" \
    "branch-creation,specific,one-time" \
    "Specific branch creation script, one-time use"

echo -e "${BLUE}Archiving deployment scripts...${NC}"

# Deployment scripts (keeping only necessary ones)
archive_file "/workspace/DEPLOY_OR_DIE.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/deployment" \
    "deployment,manual,urgent,dramatic" \
    "Dramatic deployment script, replaced by standard deploy"

archive_file "/workspace/EXECUTE_NOW.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/deployment" \
    "deployment,immediate,deprecated" \
    "Immediate execution script, replaced by npm scripts"

archive_file "/workspace/RUN_ME_NOW.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/deployment" \
    "deployment,manual,urgent" \
    "Urgent run script, replaced by standard commands"

archive_file "/workspace/COMPLETE_MISSION.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/deployment" \
    "deployment,complete,one-time" \
    "Mission completion script, one-time use"

archive_file "/workspace/deploy-enhanced.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/deployment" \
    "deployment,enhanced,deprecated" \
    "Enhanced deployment, functionality in main deploy"

echo -e "${BLUE}Archiving test and validation scripts...${NC}"

# Test and validation scripts
archive_file "/workspace/TEST_EVERYTHING.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/testing" \
    "testing,comprehensive,deprecated" \
    "Comprehensive test script, replaced by npm test commands"

archive_file "/workspace/FINAL_VERIFICATION.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/testing" \
    "verification,final,one-time" \
    "Final verification script, one-time use"

archive_file "/workspace/DATABASE_VALIDATION_COMPLETE.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/testing" \
    "database,validation,complete,one-time" \
    "Database validation completion script"

archive_file "/workspace/verify-fixes.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/testing" \
    "verification,fixes,deprecated" \
    "Fix verification script, replaced by test suite"

archive_file "/workspace/complete-fix.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/utilities" \
    "fixes,complete,deprecated" \
    "Complete fix script, one-time use"

archive_file "/workspace/quick-fix.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/utilities" \
    "fixes,quick,deprecated" \
    "Quick fix script, replaced by proper solutions"

echo -e "${BLUE}Archiving Docker-related scripts...${NC}"

# Docker scripts (keep essential ones in docker/scripts)
archive_file "/workspace/docker-autofix.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/docker" \
    "docker,autofix,deprecated" \
    "Docker autofix script, replaced by proper Docker commands"

archive_file "/workspace/docker-verify.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/docker" \
    "docker,verification,deprecated" \
    "Docker verification, functionality in docker-compose"

archive_file "/workspace/get-docker.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/docker" \
    "docker,installation,external" \
    "Docker installation script, use official Docker docs"

# Keep docker-build.sh and docker-run.sh as they might be useful
echo -e "${YELLOW}Keeping docker-build.sh and docker-run.sh (may be useful)${NC}"

# Archive other utility scripts
archive_file "/workspace/k8s-debug-script.sh" \
    "$ARCHIVE_ROOT/by-category/scripts/utilities" \
    "kubernetes,debug,specialized" \
    "Kubernetes debug script, not needed for current deployment"

echo -e "${GREEN}Phase 4 completed! Redundant shell scripts archived.${NC}"
echo -e "${BLUE}Essential scripts preserved in their respective directories.${NC}"