#!/bin/bash
# Initialize verification directory structure
# Run from your project root

set -e

echo "Initializing Executable Verification..."
echo ""

# Create directory structure
echo "Creating directories..."
mkdir -p verification/assumptions
mkdir -p verification/preconditions
mkdir -p verification/postconditions

echo "  Created: verification/assumptions/"
echo "  Created: verification/preconditions/"
echo "  Created: verification/postconditions/"

# Create a sample script
cat > verification/assumptions/example.sh << 'EOF'
#!/bin/bash
# Example verification script
# Rename and customize for your project

echo "Checking: example assumption"

# Replace with your actual check
if [[ -f "package.json" ]]; then
    echo "PASS: package.json exists"
else
    echo "FAIL: package.json not found"
    exit 1
fi
EOF

chmod +x verification/assumptions/example.sh
echo "  Created: verification/assumptions/example.sh"

# Add to .gitignore (commented out by default)
if [[ -f ".gitignore" ]]; then
    if ! grep -q "# Verification scripts" .gitignore 2>/dev/null; then
        cat >> .gitignore << 'EOF'

# Verification scripts (uncomment to exclude)
# verification/
EOF
        echo "  Updated: .gitignore"
    fi
fi

echo ""
echo "Done! Next steps:"
echo ""
echo "1. Run the example script:"
echo "   ./verification/assumptions/example.sh"
echo ""
echo "2. Create your own verification scripts:"
echo "   - verification/assumptions/  - 'Is X true?' checks"
echo "   - verification/preconditions/ - 'Can I do X?' checks"
echo "   - verification/postconditions/ - 'Did X work?' checks"
echo ""
echo "3. See examples in:"
echo "   .claude/skills/executable-verification/templates/"
