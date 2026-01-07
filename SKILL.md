---
name: executable-verification
description: Recognizes assumptions that could be wrong and generates verification scripts to prove or disprove them before acting. Triggers when making assumptions about file structure, API signatures, dependencies, patterns, or external services. Use when phrases like "probably", "usually", or "should be" arise.
---

# Executable Verification

When you catch yourself making an assumption that could be wrong, write a script to verify it before proceeding.

## When to Verify

Verify high-risk assumptions:

| Category | Example | Risk |
|----------|---------|------|
| File/directory structure | "Config is in `src/config/`" | High |
| API signatures | "Takes a callback as second arg" | High |
| Dependencies | "This library handles X" | High |
| Patterns | "Codebase uses this style" | Medium |
| External services | "API returns this shape" | High |

**Triggers:** "probably", "usually", "should be", "I think", knowledge that goes stale

## Verification Workflow

Copy this checklist when verifying:

```
Verification:
- [ ] Recognized assumption
- [ ] Assessed risk (worth verifying?)
- [ ] Wrote script in verification/
- [ ] Ran script
- [ ] Proceeded or pivoted based on result
```

## Script Organization

Store scripts in `verification/` at project root:

```
verification/
├── assumptions/      # "Is X true?" checks
├── preconditions/    # "Can I do X?" checks
└── postconditions/   # "Did X work?" checks
```

Name scripts after what they verify: `routes-exist.sh`, `auth-uses-jwt.ts`

## Quick Patterns

### Bash: File existence

```bash
#!/bin/bash
if [[ ! -d "src/routes" ]]; then
    echo "FAIL: src/routes/ does not exist"
    exit 1
fi
echo "PASS: src/routes/ exists"
```

### Bash: Pattern search

```bash
#!/bin/bash
if grep -rq "from '@prisma/client'" src/; then
    echo "PASS: Uses Prisma"
else
    echo "FAIL: No Prisma imports"
    exit 1
fi
```

### TypeScript/Bun: File check

```typescript
#!/usr/bin/env bun
import { existsSync } from "fs";
if (!existsSync("src/config/index.ts")) {
  console.log("FAIL: Config not found");
  process.exit(1);
}
console.log("PASS: Config exists");
```

**More patterns:** See [templates/](templates/) for API checks, database schema verification, dependency checks, and more.

## Script Conventions

All scripts should:
1. Output `PASS:` or `FAIL:` clearly
2. Exit 0 on success, exit 1 on failure
3. Run from project root
4. Be self-contained (no external config)

## When NOT to Verify

Skip verification when:
- About to read the file anyway
- Cost of being wrong is low
- Assumption is trivial
- Rapid prototyping

## Accumulated Value

Verification scripts become project artifacts:
- **Re-runnable** in future sessions
- **Documentation** of how things work
- **Onboarding** for new team members
- **CI/CD** sanity checks

Commit scripts to git.
