#!/bin/bash
# Example: Verify file/directory structure
# Copy and adapt for your project

# What we're checking
TARGET_DIR="src/routes"
EXPECTED_PATTERN="*.ts"

echo "Checking: $TARGET_DIR exists with $EXPECTED_PATTERN files"

# Check directory exists
if [[ ! -d "$TARGET_DIR" ]]; then
    echo "FAIL: $TARGET_DIR does not exist"
    echo ""
    echo "Searching for alternatives..."
    find . -type d -name "*route*" 2>/dev/null | grep -v node_modules | head -5
    exit 1
fi

# Count matching files
file_count=$(ls $TARGET_DIR/$EXPECTED_PATTERN 2>/dev/null | wc -l | tr -d ' ')

if [[ "$file_count" -eq 0 ]]; then
    echo "FAIL: No $EXPECTED_PATTERN files in $TARGET_DIR"
    echo "Contents:"
    ls -la "$TARGET_DIR"
    exit 1
fi

echo "PASS: $TARGET_DIR exists with $file_count files"
echo "Files:"
ls $TARGET_DIR/$EXPECTED_PATTERN 2>/dev/null
