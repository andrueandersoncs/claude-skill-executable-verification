---
name: verifying-assumptions
description: Write and run verification scripts before and after every code change. Triggers on all code tasks. When you think "I assume X is true" or "this should work," stop and write a script to prove it. Verification = executable script, not mental checking.
---

# Executable Verification

**Core rule: Every assumption must be verified by writing and running a script.**

## The Pattern

```
1. Identify assumption → 2. Write script → 3. Run script → 4. Act on result
```

**Minimum per task:** Write and run at least one precondition script (before acting) AND one postcondition script (after acting).

## Script Examples

```bash
# File exists?
[[ -f "src/config/database.ts" ]] && echo "PASS: config exists" || { echo "FAIL: config not found"; exit 1; }

# Pattern in codebase?
grep -rq "useAuth" src/hooks/ && echo "PASS: useAuth hook exists" || { echo "FAIL: useAuth not found"; exit 1; }

# Tests pass?
npm test -- --testPathPattern="auth" && echo "PASS: auth tests pass" || { echo "FAIL: auth tests failed"; exit 1; }
```

See `templates/` for more patterns: API health checks, dependency verification, TypeScript AST analysis, Python DB schema checks, ephemeral session setup.

## Script Requirements

All verification scripts must:
1. Output `PASS:` or `FAIL:` with a description
2. Exit 0 on success, exit 1 on failure
3. Run from project root
4. Be self-contained (no external config)

## When to Write Scripts

Write a verification script when you catch yourself thinking:
- "I think..." / "probably..." / "should be..."
- "This file is at..."
- "The API returns..."
- "This function takes..."
- "The service is running..."

**Red flags requiring immediate script:**
- First time in this codebase
- Modifying code you haven't verified exists
- Calling an API you haven't tested
- Any knowledge that could be stale

## Workflow

For each action:

```
BEFORE ACTING:
1. What am I assuming?
2. Write verification script(s)
3. Run script(s)
4. If FAIL: STOP, do not proceed

TAKE ACTION

AFTER ACTING:
1. What should now be true?
2. Write postcondition script(s)
3. Run script(s)
4. If FAIL: diagnose and fix
```

## Script Organization

Store persistent scripts in `verification/` at project root:

```
verification/
├── assumptions/      # "Is X true?"
├── preconditions/    # "Can I do X?"
└── postconditions/   # "Did X work?"
```

For runtime/session-specific checks (ports, services), use ephemeral scripts:

```bash
export VERIFY_SESSION="/tmp/verify-$(date +%s)"
mkdir -p "$VERIFY_SESSION"
```

## Multi-Step Tasks

Never chain actions without intermediate verification:

```
Step 1: [verify preconditions] → act → [verify postconditions]
                                              ↓
Step 2: [verify preconditions] → act → [verify postconditions]
```

Each step's postconditions become the next step's preconditions. Verify them with scripts.
