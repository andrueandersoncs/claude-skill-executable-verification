# Installation Guide

## Prerequisites

- Claude Code CLI installed
- Git (for git-based installation)

## Installation

### Project-Level (Recommended)

Install in a specific project. The skill will only be available for that project.

```bash
cd your-project
mkdir -p .claude/skills
git clone https://github.com/andrueanderson/claude-skill-executable-verification.git .claude/skills/executable-verification
```

Or via download:

```bash
cd your-project
mkdir -p .claude/skills
curl -L https://github.com/andrueanderson/claude-skill-executable-verification/archive/main.tar.gz | tar xz
mv claude-skill-executable-verification-main .claude/skills/executable-verification
```

### Global Installation

Install once, use in all projects:

```bash
mkdir -p ~/.claude/skills
git clone https://github.com/andrueanderson/claude-skill-executable-verification.git ~/.claude/skills/executable-verification
```

## Verify Installation

Start Claude Code and ask:

```
"What skills are available?"
```

You should see `executable-verification` in the list.

## Project Setup

When Claude uses this skill, it will create a `verification/` directory in your project:

```
verification/
├── assumptions/      # "Is X true?" checks
├── preconditions/    # "Can I do X?" checks
└── postconditions/   # "Did X work?" checks
```

No additional setup required. Claude creates verification scripts as needed using whatever language fits the project (bash, TypeScript/bun, Python, etc.).

### Optional: Initialize Directory Structure

You can pre-create the directory structure:

```bash
mkdir -p verification/{assumptions,preconditions,postconditions}
```

## Running Verification Scripts

Scripts are executable and self-contained:

```bash
# Bash scripts
./verification/assumptions/config-structure.sh
# or
bash verification/assumptions/config-structure.sh

# TypeScript/Bun scripts
bun verification/assumptions/api-shape.ts

# Python scripts
python3 verification/assumptions/db-schema.py
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
   # Should see SKILL.md
   ```

2. Ensure SKILL.md exists:
   ```bash
   head .claude/skills/executable-verification/SKILL.md
   ```

3. Restart Claude Code

### Permission Denied on Scripts

Make scripts executable:
```bash
chmod +x verification/assumptions/*.sh
```

## Next Steps

After installation, just use Claude Code normally. The skill activates automatically when Claude recognizes it's making assumptions that should be verified.

See [USAGE.md](USAGE.md) for usage patterns and examples.
