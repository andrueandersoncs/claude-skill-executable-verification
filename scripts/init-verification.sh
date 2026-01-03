#!/bin/bash

# Executable Verification Setup Script
# This script initializes executable verification in your project

set -e

echo "🚀 Initializing Executable Verification..."
echo ""

# Detect project type
PROJECT_TYPE="typescript"
if [ -f "tsconfig.json" ]; then
  PROJECT_TYPE="typescript"
  echo "✅ Detected TypeScript project"
elif [ -f "jsconfig.json" ] || [ -f "package.json" ]; then
  PROJECT_TYPE="javascript"
  echo "✅ Detected JavaScript project"
else
  echo "⚠️  Could not detect project type, defaulting to TypeScript"
fi

# Create directories
echo ""
echo "📁 Creating directories..."
mkdir -p research
mkdir -p planning
echo "   Created: research/"
echo "   Created: planning/"

# Copy templates
echo ""
echo "📋 Copying templates..."

SKILL_DIR=".claude/skills/executable-verification"

if [ "$PROJECT_TYPE" = "typescript" ]; then
  cp "$SKILL_DIR/templates/research-typescript.ts" research/assumptions.ts
  echo "   Created: research/assumptions.ts"
else
  cp "$SKILL_DIR/templates/research-javascript.js" research/assumptions.js
  echo "   Created: research/assumptions.js"
fi

cp "$SKILL_DIR/templates/planning-template.ts" planning/preconditions.ts
echo "   Created: planning/preconditions.ts"

# Update package.json with scripts
echo ""
echo "📦 Updating package.json..."

if [ -f "package.json" ]; then
  # Check if jq is available for JSON manipulation
  if command -v jq &> /dev/null; then
    # Use jq to add scripts
    TEMP_FILE=$(mktemp)
    jq '.scripts."verify:research" = "tsx research/assumptions.ts" |
        .scripts."verify:plan" = "tsx planning/preconditions.ts" |
        .scripts."verify:all" = "npm run verify:research && npm run verify:plan"' \
      package.json > "$TEMP_FILE"
    mv "$TEMP_FILE" package.json
    echo "   ✅ Added verification scripts to package.json"
  else
    echo "   ⚠️  jq not found - please manually add these scripts to package.json:"
    echo '   "verify:research": "tsx research/assumptions.ts"'
    echo '   "verify:plan": "tsx planning/preconditions.ts"'
    echo '   "verify:all": "npm run verify:research && npm run verify:plan"'
  fi
else
  echo "   ⚠️  No package.json found - skipping script addition"
fi

# Install dependencies
echo ""
echo "📥 Installing dependencies..."

if [ "$PROJECT_TYPE" = "typescript" ]; then
  if command -v npm &> /dev/null; then
    npm install -D ts-morph tsx 2>/dev/null || echo "   ⚠️  Failed to install - run manually: npm install -D ts-morph tsx"
  else
    echo "   ⚠️  npm not found - please install: ts-morph, tsx"
  fi
fi

# Create .gitignore entries
echo ""
echo "📝 Updating .gitignore..."

if [ -f ".gitignore" ]; then
  if ! grep -q "# Executable Verification" .gitignore; then
    cat >> .gitignore << EOF

# Executable Verification
# Uncomment if you don't want to commit verification artifacts
# research/
# planning/
EOF
    echo "   ✅ Added verification entries to .gitignore"
  else
    echo "   ℹ️  .gitignore already contains verification entries"
  fi
else
  echo "   ⚠️  No .gitignore found - consider creating one"
fi

# Success message
echo ""
echo "✅ Executable Verification initialized successfully!"
echo ""
echo "📚 Next steps:"
echo ""
echo "1. Customize your research assumptions:"
if [ "$PROJECT_TYPE" = "typescript" ]; then
  echo "   Edit: research/assumptions.ts"
else
  echo "   Edit: research/assumptions.js"
fi
echo ""
echo "2. Customize your planning preconditions:"
echo "   Edit: planning/preconditions.ts"
echo ""
echo "3. Run verification:"
if [ "$PROJECT_TYPE" = "typescript" ]; then
  echo "   npx tsx research/assumptions.ts"
else
  echo "   node research/assumptions.js"
fi
echo "   npx tsx planning/preconditions.ts"
echo ""
echo "4. Or use npm scripts:"
echo "   npm run verify:research"
echo "   npm run verify:plan"
echo "   npm run verify:all"
echo ""
echo "📖 Documentation:"
echo "   .claude/skills/executable-verification/README.md"
echo "   .claude/skills/executable-verification/research-phase.md"
echo "   .claude/skills/executable-verification/planning-phase.md"
echo ""
echo "Happy coding! 🚀"
