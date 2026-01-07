#!/bin/bash
# Example: Verify dependencies and versions
# Copy and adapt for your project

echo "Checking dependencies..."

# Check Node.js version
REQUIRED_NODE_MAJOR=18
if command -v node &> /dev/null; then
    node_version=$(node -v | cut -d'v' -f2)
    node_major=$(echo "$node_version" | cut -d'.' -f1)

    if [[ "$node_major" -lt "$REQUIRED_NODE_MAJOR" ]]; then
        echo "FAIL: Node.js $REQUIRED_NODE_MAJOR+ required, found $node_version"
        exit 1
    fi
    echo "PASS: Node.js $node_version"
else
    echo "FAIL: Node.js not installed"
    exit 1
fi

# Check if package.json exists
if [[ ! -f "package.json" ]]; then
    echo "FAIL: package.json not found"
    exit 1
fi

# Check for specific dependency
REQUIRED_DEP="typescript"
if grep -q "\"$REQUIRED_DEP\"" package.json; then
    echo "PASS: $REQUIRED_DEP found in package.json"
else
    echo "FAIL: $REQUIRED_DEP not found in package.json"
    exit 1
fi

# Check if node_modules exists
if [[ ! -d "node_modules" ]]; then
    echo "WARN: node_modules not found - run npm install"
fi

echo ""
echo "All dependency checks passed"
