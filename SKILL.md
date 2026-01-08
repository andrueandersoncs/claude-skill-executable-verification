---
name: verifying-assumptions
description: MANDATORY verification before/after code changes. Triggers on: modifying files, calling APIs, assuming file locations, checking dependencies, first time in codebase. ALWAYS write script to file, execute, then proceed. Never inline verification.
---

# Executable Verification

**Core rule: Every assumption must be verified by writing a script file and executing it.**

## The Pattern

```
1. Identify assumption → 2. Write script FILE → 3. Execute file → 4. Act on result
```

**Critical:** "Write a script" means creating an actual file on disk, then running that file. Never execute verification logic inline.

**Minimum per task:** Write and run at least one precondition script file (before acting) AND one postcondition script file (after acting).

## Script Examples

**Correct workflow:** Write file → Execute file

```bash
# 1. Write the script to a file
cat > verification/check-config.sh << 'EOF'
#!/bin/bash
[[ -f "src/config/database.ts" ]] && echo "PASS: config exists" || { echo "FAIL: config not found"; exit 1; }
EOF

# 2. Make executable and run
chmod +x verification/check-config.sh
./verification/check-config.sh
```

**More script content patterns:**

```bash
# Pattern in codebase
grep -rq "useAuth" src/hooks/ && echo "PASS: useAuth hook exists" || { echo "FAIL: useAuth not found"; exit 1; }

# Tests pass
npm test -- --testPathPattern="auth" && echo "PASS: auth tests pass" || { echo "FAIL: auth tests failed"; exit 1; }
```

See `templates/` for more patterns: API health checks, dependency verification, TypeScript AST analysis, Python DB schema checks, ephemeral session setup.

## Anti-Pattern: Inline Execution

**WRONG** - Running verification logic directly in bash:
```bash
# DON'T do this - no script file created
[[ -f "src/config.ts" ]] && echo "exists"
grep -q "pattern" file.ts
```

**RIGHT** - Always create a file first:
```bash
# DO this - write to file, then execute
Write verification/check-config.sh with script content
bash verification/check-config.sh
```

## Script Requirements

All verification scripts must:
1. **Be written to a file** before execution (never inline)
2. Output `PASS:` or `FAIL:` with a description
3. Exit 0 on success, exit 1 on failure
4. Run from project root
5. Be self-contained (no external config)

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
2. Write verification script to FILE (e.g., verification/pre-check.sh)
3. Execute the file
4. If FAIL: STOP, do not proceed

TAKE ACTION

AFTER ACTING:
1. What should now be true?
2. Write postcondition script to FILE (e.g., verification/post-check.sh)
3. Execute the file
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

For runtime/session-specific checks (ports, services), write scripts to a temp directory:

```bash
# Set up session directory
export VERIFY_SESSION="/tmp/verify-$(date +%s)"
mkdir -p "$VERIFY_SESSION"

# Write script to file, then execute
cat > "$VERIFY_SESSION/check-port.sh" << 'EOF'
#!/bin/bash
nc -z localhost 3000 && echo "PASS: port 3000 open" || { echo "FAIL: port 3000 closed"; exit 1; }
EOF
bash "$VERIFY_SESSION/check-port.sh"
```

## Multi-Step Tasks

Never chain actions without intermediate verification scripts:

```
Step 1: [write & run pre-script] → act → [write & run post-script]
                                                    ↓
Step 2: [write & run pre-script] → act → [write & run post-script]
```

Each step's postconditions become the next step's preconditions. Verify them with script files, not inline commands.
