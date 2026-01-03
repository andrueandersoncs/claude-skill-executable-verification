# Installation Guide

This guide covers different ways to install the Executable Verification skill for Claude Code.

## Prerequisites

- Claude Code CLI installed
- Git (for git-based installation)
- Node.js/Bun (for running verification scripts)

## Installation Methods

### 1. Project-Level Installation (Recommended)

Install in a specific project. The skill will only be available for that project.

#### Via Git Clone

```bash
cd your-project
mkdir -p .claude/skills
git clone https://github.com/andrueanderson/claude-skill-executable-verification.git .claude/skills/executable-verification
```

#### Via Download

```bash
cd your-project
mkdir -p .claude/skills

# Download and extract
curl -L https://github.com/andrueanderson/claude-skill-executable-verification/archive/main.tar.gz | tar xz
mv claude-skill-executable-verification-main .claude/skills/executable-verification
```

#### Manual Download

1. Download the [latest release](https://github.com/andrueanderson/claude-skill-executable-verification/releases)
2. Extract to `.claude/skills/executable-verification` in your project

### 2. Global Installation

Install once, use in all projects.

```bash
mkdir -p ~/.claude/skills
git clone https://github.com/andrueanderson/claude-skill-executable-verification.git ~/.claude/skills/executable-verification
```

Now the skill is available in **every** Claude Code project!

### 3. Verify Installation

After installation, verify the skill is loaded:

```bash
# Start Claude Code in your project
claude

# Ask:
> What skills are available?
```

You should see `executable-verification` in the list.

## Quick Setup

After installing, bootstrap your project:

```bash
# Make sure you're in your project root
cd your-project

# Run the setup script
.claude/skills/executable-verification/scripts/init-verification.sh
```

This will:
- ✅ Create `research/` and `planning/` directories
- ✅ Copy verification templates
- ✅ Install dependencies (ts-morph, tsx)
- ✅ Add verification scripts to package.json
- ✅ Update .gitignore

## Manual Setup

If you prefer manual setup:

### 1. Create Directories

```bash
mkdir -p research planning
```

### 2. Copy Templates

Copy templates and rename for your feature/bug:

For TypeScript projects:
```bash
cp .claude/skills/executable-verification/templates/research-typescript.ts research/my-feature.ts
cp .claude/skills/executable-verification/templates/planning-template.ts planning/my-feature.ts
```

For JavaScript projects:
```bash
cp .claude/skills/executable-verification/templates/research-javascript.js research/my-feature.js
cp .claude/skills/executable-verification/templates/planning-template.ts planning/my-feature.ts
```

Name files after the feature or bug (e.g., `oauth-authentication.ts`, `fix-session-bug.ts`).

### 3. Install Dependencies

```bash
# Using npm
npm install -D ts-morph tsx

# Using bun
bun add -D ts-morph tsx

# Using yarn
yarn add -D ts-morph tsx
```

### 4. Run Verification Scripts

Run feature-specific scripts directly:
```bash
npx tsx research/my-feature.ts
npx tsx planning/my-feature.ts
```

Optionally add convenience scripts to `package.json` for frequently-run verifications:
```json
{
  "scripts": {
    "verify:my-feature": "tsx research/my-feature.ts && tsx planning/my-feature.ts"
  }
}
```

## Updating

### Project-Level

```bash
cd your-project/.claude/skills/executable-verification
git pull origin main
```

### Global

```bash
cd ~/.claude/skills/executable-verification
git pull origin main
```

## Uninstallation

### Project-Level

```bash
rm -rf .claude/skills/executable-verification
```

### Global

```bash
rm -rf ~/.claude/skills/executable-verification
```

## Troubleshooting

### Skill Not Showing Up

1. Check the directory structure:
   ```bash
   ls -la .claude/skills/executable-verification/
   # Should see SKILL.md and other files
   ```

2. Ensure SKILL.md exists:
   ```bash
   cat .claude/skills/executable-verification/SKILL.md
   ```

3. Restart Claude Code

### Dependencies Not Installing

If the setup script fails to install dependencies:

```bash
# Manually install
npm install -D ts-morph tsx

# Or with bun
bun add -D ts-morph tsx
```

### Permission Denied on init-verification.sh

```bash
chmod +x .claude/skills/executable-verification/scripts/init-verification.sh
```

### Module Not Found Errors

Make sure you're running verification scripts from the project root:

```bash
cd /path/to/your/project
npx tsx research/my-feature.ts
```

## Next Steps

After installation:

1. Read [USAGE.md](USAGE.md) for usage guide
2. Try the skill: "Use executable verification to implement a feature"
3. Create feature-specific scripts in `research/` and `planning/`
4. Run verification: `npx tsx research/my-feature.ts`

## Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review [USAGE.md](USAGE.md)
3. Open an issue on [GitHub](https://github.com/andrueanderson/claude-skill-executable-verification/issues)
