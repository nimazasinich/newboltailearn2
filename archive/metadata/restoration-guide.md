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
