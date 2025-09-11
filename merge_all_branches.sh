#!/bin/bash
# merge_all_branches.sh

set -e  # خروج در صورت خطا

echo "🚀 Starting merge process for newboltailearn..."

# تنظیمات
BACKUP_BRANCH="backup-merge-$(date +%Y%m%d-%H%M%S)"

# آماده‌سازی
git checkout main
git branch "$BACKUP_BRANCH"
git fetch origin
git pull origin main

echo "✅ Backup created: $BACKUP_BRANCH"

# لیست شاخه‌ها برای merge (از آسان به سخت)
branches=(
    "cursor/fix-navigation-sidebar-rtl-and-font-issues-bcd6"
    "cursor/polish-spa-ui-with-routing-layout-and-a11y-fc55"  
    "main2"
)

# پیام‌های commit
declare -A commit_messages=(
    ["cursor/fix-navigation-sidebar-rtl-and-font-issues-bcd6"]="Merge: Fix navigation sidebar RTL and font issues

- Resolves navigation sidebar RTL layout problems
- Fixes font rendering issues  
- Closes #3"

    ["cursor/polish-spa-ui-with-routing-layout-and-a11y-fc55"]="Merge: Polish SPA UI with routing, layout and accessibility

- Improves SPA user interface
- Enhances routing and layout system
- Adds accessibility improvements
- Closes #4"

    ["main2"]="Merge: main2 branch integration

- Integrates changes from main2 branch
- Manual review completed for complex merge"
)

# حلقه merge
for branch in "${branches[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔄 Merging: $branch"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Merge attempt
    if git merge --no-ff --no-commit "origin/$branch"; then
        echo "✅ Clean merge successful"
        git status
        
        # Check if there's anything to commit
        if git diff --staged --quiet; then
            echo "ℹ️  No changes to commit - branch already up to date"
        else
            # کامیت
            git commit -m "${commit_messages[$branch]}"
        fi
        echo "✅ Branch $branch merged successfully"
        
    else
        echo "❌ Conflicts detected in $branch"
        echo "Please resolve manually:"
        echo "1. Edit conflicted files"
        echo "2. git add ."
        echo "3. git commit -m '${commit_messages[$branch]}'"
        echo "4. Re-run this script"
        exit 1
    fi
    
    sleep 2
done

# تست نهایی
echo "🧪 Running final tests..."
if npm test; then
    echo "✅ All tests passed!"
    
    # Push
    echo "📤 Pushing to origin..."
    git push origin main
    
    echo "🎉 SUCCESS! All branches merged and pushed."
    echo "📋 Merged branches:"
    for branch in "${branches[@]}"; do
        echo "   ✅ $branch"
    done
    
    echo "🗑️  Clean up remote branches:"
    echo "git push origin --delete cursor/fix-navigation-sidebar-rtl-and-font-issues-bcd6"
    echo "git push origin --delete cursor/polish-spa-ui-with-routing-layout-and-a11y-fc55"  
    echo "git push origin --delete main2"
    
else
    echo "❌ Tests failed!"
    echo "💡 Rollback with: git reset --hard $BACKUP_BRANCH"
    exit 1
fi