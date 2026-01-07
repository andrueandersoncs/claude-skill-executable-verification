# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

This is a Claude Code skill that implements **Executable Verification** - teaching Claude to recognize assumptions it's making that have a high likelihood of being incorrect, and to generate verification scripts that prove or disprove those assumptions before acting.

## Repository Structure

```
├── SKILL.md           # Core skill definition (loaded by Claude Code)
├── README.md          # Public documentation
├── INSTALL.md         # Installation guide
├── USAGE.md           # Usage patterns and examples
├── scripts/
│   └── init-verification.sh  # Optional bootstrap script
└── templates/         # Example verification scripts
```

## Key Concepts

### The Core Idea

Claude makes assumptions constantly (file locations, API signatures, patterns, etc.). Many failures stem from incorrect assumptions, not lack of capability.

**Executable Verification** = When you recognize you're making a risky assumption, write a script to verify it before proceeding.

### Verification Script Types

1. **Bash scripts** - Universal, good for file checks, pattern searches, version checks
2. **TypeScript/Bun scripts** - Good for AST analysis, type checking, API probing
3. **Python scripts** - Good for data analysis, database checks
4. **Tests** - Unit/integration/e2e tests as verification

### Script Organization (in target projects)

```
verification/
├── assumptions/      # "Is X true?" checks
├── preconditions/    # "Can I do X?" checks
└── postconditions/   # "Did X work?" checks
```

## Modifying the Skill

- `SKILL.md` is the main skill definition - changes here affect how Claude Code uses the skill
- Keep the skill focused on the mental discipline (recognize → assess → verify → proceed)
- Examples should be practical and language-agnostic where possible
- Bash scripts should be the default/universal option

## Installation Paths

- Project-level: `.claude/skills/executable-verification/`
- Global: `~/.claude/skills/executable-verification/`
