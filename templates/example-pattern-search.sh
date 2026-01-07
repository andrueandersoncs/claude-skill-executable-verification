#!/bin/bash
# Example: Search for patterns in codebase
# Copy and adapt for your project

# What pattern to search for
PATTERN="from ['\"]@prisma/client['\"]"
SEARCH_DIR="src"

echo "Searching for: $PATTERN in $SEARCH_DIR/"

# Check if search directory exists
if [[ ! -d "$SEARCH_DIR" ]]; then
    echo "FAIL: $SEARCH_DIR directory not found"
    exit 1
fi

# Search for pattern
matches=$(grep -r "$PATTERN" "$SEARCH_DIR" 2>/dev/null)

if [[ -z "$matches" ]]; then
    echo "FAIL: Pattern not found"
    echo ""
    echo "This codebase may not use Prisma, or imports are structured differently"
    exit 1
fi

match_count=$(echo "$matches" | wc -l | tr -d ' ')
echo "PASS: Found $match_count matches"
echo ""
echo "First 5 matches:"
echo "$matches" | head -5
