# Executable Verification Skill for Claude Code

A Claude Code skill that teaches the agent to **recognize assumptions with high likelihood of being incorrect** and **generate verification scripts** to prove or disprove those assumptions before acting.

## The Problem

Claude makes assumptions constantly: about file locations, API signatures, configuration formats, existing patterns, dependency versions, how systems behave, what users mean. **Many failures stem not from lack of capability, but from incorrect assumptions.**

When Claude says "I'll put this in `src/routes/`" or "This function takes a callback," it's making assumptions that may be wrong.

## The Solution

Executable Verification teaches Claude a discipline:

> When you recognize you're making an assumption that could be wrong, **write a script to verify it** before proceeding.

This shifts from "I think X is true" to "I confirmed X is true."

## What It Looks Like

Claude pauses mid-task:

> "I'm about to add a route to `src/routes/`... but I'm assuming that directory exists and follows a consistent pattern. Let me verify:"

```bash
#!/bin/bash
# verification/assumptions/route-structure.sh

if [[ ! -d "src/routes" ]]; then
    echo "FAIL: src/routes/ does not exist"
    find . -name "*route*" -o -name "*router*" | grep -v node_modules
    exit 1
fi

echo "PASS: src/routes/ exists"
ls src/routes/*.ts 2>/dev/null
```

The script runs, confirms (or refutes) the assumption, and Claude proceeds with certainty.

## Installation

### Project-Level (Recommended)

```bash
mkdir -p .claude/skills
git clone https://github.com/andrueanderson/claude-skill-executable-verification.git .claude/skills/executable-verification
```

### Global

```bash
mkdir -p ~/.claude/skills
git clone https://github.com/andrueanderson/claude-skill-executable-verification.git ~/.claude/skills/executable-verification
```

### Verify Installation

Start Claude Code and ask:
```
"What skills are available?"
```

You should see `executable-verification` in the list.

## How It Works

The skill teaches Claude to:

1. **Recognize** high-risk assumptions (file structure, API behavior, patterns, etc.)
2. **Assess** whether verification is worth it (not everything needs a script)
3. **Write** a verification script (bash, TypeScript/bun, Python, etc.)
4. **Run** the script and incorporate findings
5. **Store** scripts in `verification/` for reuse

### Script Organization

```
verification/
├── assumptions/           # "Is X true?" checks
│   ├── config-structure.sh
│   ├── api-response-shape.ts
│   └── uses-prisma.sh
├── preconditions/         # "Can I do X?" checks
│   ├── deps-installed.sh
│   └── required-files-exist.sh
└── postconditions/        # "Did X work?" checks
    ├── tests-pass.sh
    └── build-succeeds.sh
```

### Script Types

**Bash** - Universal, good for file checks, pattern searches, version checks
```bash
#!/bin/bash
if grep -r "from '@prisma/client'" src/ > /dev/null; then
    echo "PASS: Project uses Prisma"
else
    echo "FAIL: No Prisma imports found"
    exit 1
fi
```

**TypeScript/Bun** - Good for AST analysis, type checking, complex logic
```typescript
#!/usr/bin/env bun
import { existsSync, readFileSync } from "fs";

const config = "src/config/index.ts";
if (!existsSync(config)) {
  console.log("FAIL: Config not found at", config);
  process.exit(1);
}
console.log("PASS: Config exists");
```

**Python** - Good for data analysis, database checks, scripting
```python
#!/usr/bin/env python3
import sqlite3
conn = sqlite3.connect("data/app.db")
# Check schema...
```

## When Claude Verifies

Claude verifies when assumptions are **high-risk**:

| Category | Example | Why Risky |
|----------|---------|-----------|
| File structure | "Config is in `src/config/`" | Structures vary wildly |
| API signatures | "This takes a callback" | Signatures change between versions |
| Dependencies | "This library handles X" | Undocumented behavior |
| Patterns | "The codebase uses this style" | Patterns are often inconsistent |
| External services | "The API returns this shape" | APIs change |

## Accumulated Value

Verification scripts become project artifacts:

- **Re-runnable**: Future sessions can re-verify assumptions
- **Documentation**: Scripts explain how things actually work
- **Onboarding**: New team members run scripts to understand the codebase
- **CI/CD**: Add verification to your pipeline

Commit them to git.

## Example Session

```
User: "Add a new API endpoint for user preferences"

Claude: I'll add this to the routes. First, let me verify the routing structure...

[Creates verification/assumptions/routes-structure.sh]
[Runs script]

Output:
PASS: src/routes/ exists with 8 route files
Pattern: Each route exports a Hono router

Now I know where to put it and what pattern to follow...
```

## The Tradeoff

Writing verification scripts costs time. But:
- Debugging wrong assumptions costs more
- Scripts are reusable
- Scripts become documentation
- Confidence increases

For anything non-trivial, verification pays for itself.

## Documentation

- **[SKILL.md](SKILL.md)** - Core skill definition (loaded by Claude)
- **[INSTALL.md](INSTALL.md)** - Detailed installation guide
- **[USAGE.md](USAGE.md)** - Usage patterns and examples

## Contributing

Contributions welcome! Ideas:
- More verification script patterns
- Language-specific templates (Go, Rust, etc.)
- CI/CD integration examples

## License

MIT License - see [LICENSE](LICENSE)

## Credits

Created by [Andrue Anderson](https://andrueslab.com)

---

**The goal: Shift from "I think X is true" to "I confirmed X is true."**
