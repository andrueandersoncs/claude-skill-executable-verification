# Usage Guide

## How It Works

Executable Verification teaches Claude to recognize when it's making assumptions and to verify them before acting.

The skill activates automatically. You don't need to do anything special - just use Claude Code normally. When Claude catches itself making a risky assumption, it will pause and verify.

## The Verification Loop

1. **Recognize** - Claude notices it's about to act on an assumption
2. **Assess** - Is this assumption high-risk? Could it be wrong?
3. **Write** - Create a verification script
4. **Run** - Execute the script
5. **Proceed or Pivot** - If verified, continue. If not, update understanding.

## What Gets Verified

Claude verifies assumptions that are likely to be wrong:

| Category | Example Assumption | Why Verify |
|----------|-------------------|------------|
| File structure | "Routes are in `src/routes/`" | Every project is different |
| API signatures | "This function takes options as second arg" | APIs change between versions |
| Dependencies | "Prisma auto-generates types" | Behavior varies by config |
| Patterns | "Errors are handled in middleware" | Codebases are inconsistent |
| Config formats | "Env vars use `NEXT_PUBLIC_` prefix" | Conventions differ |
| External APIs | "The endpoint returns `{ data: [...] }`" | APIs evolve |

## Example Session

**User:** "Add a user preferences endpoint"

**Claude's internal process:**

> I'll add this to `src/routes/`...
>
> Wait - I'm assuming:
> 1. Routes live in `src/routes/`
> 2. There's a consistent pattern to follow
>
> Let me verify.

**Claude creates:**

```bash
#!/bin/bash
# verification/assumptions/route-structure.sh

if [[ ! -d "src/routes" ]]; then
    echo "FAIL: src/routes/ does not exist"
    echo "Searching for route files..."
    find . -type f -name "*route*" | grep -v node_modules
    exit 1
fi

echo "PASS: src/routes/ exists"
echo "Files:"
ls src/routes/
```

**Output:**
```
PASS: src/routes/ exists
Files:
auth.ts
users.ts
products.ts
```

Now Claude knows where to put the route and can look at existing files to match the pattern.

## Verification Script Types

### Bash Scripts (Universal)

Best for: file checks, pattern searches, command output, version checks

```bash
#!/bin/bash
# verification/assumptions/uses-typescript.sh

if [[ -f "tsconfig.json" ]]; then
    echo "PASS: TypeScript project (tsconfig.json exists)"
else
    echo "FAIL: No tsconfig.json found"
    exit 1
fi
```

```bash
#!/bin/bash
# verification/assumptions/prisma-schema-has-user.sh

if grep -q "model User" prisma/schema.prisma 2>/dev/null; then
    echo "PASS: User model exists in Prisma schema"
    grep -A 10 "model User" prisma/schema.prisma
else
    echo "FAIL: No User model in Prisma schema"
    exit 1
fi
```

### TypeScript/Bun Scripts

Best for: AST analysis, type checking, complex logic, API probing

```typescript
#!/usr/bin/env bun
// verification/assumptions/auth-middleware-exists.ts

import { existsSync, readFileSync } from "fs";

const middlewarePath = "src/middleware/auth.ts";

if (!existsSync(middlewarePath)) {
  console.log("FAIL: Auth middleware not found at", middlewarePath);
  process.exit(1);
}

const content = readFileSync(middlewarePath, "utf-8");
if (!content.includes("export")) {
  console.log("FAIL: Auth middleware exists but has no exports");
  process.exit(1);
}

console.log("PASS: Auth middleware exists and exports");
```

```typescript
#!/usr/bin/env bun
// verification/assumptions/api-health-check.ts

const API = process.env.API_URL || "http://localhost:3000";

try {
  const res = await fetch(`${API}/health`);
  if (!res.ok) {
    console.log("FAIL: Health check returned", res.status);
    process.exit(1);
  }
  console.log("PASS: API is healthy");
} catch (e) {
  console.log("FAIL: Could not reach API at", API);
  process.exit(1);
}
```

### Python Scripts

Best for: data analysis, database checks, ML/data projects

```python
#!/usr/bin/env python3
# verification/assumptions/db-has-users-table.py

import sqlite3
import sys

try:
    conn = sqlite3.connect("data/app.db")
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")

    if cursor.fetchone():
        print("PASS: users table exists")
    else:
        print("FAIL: users table does not exist")
        sys.exit(1)
except Exception as e:
    print(f"FAIL: Could not check database: {e}")
    sys.exit(1)
```

## Script Organization

Scripts go in `verification/` with subdirectories by purpose:

```
verification/
├── assumptions/       # Verify facts about the codebase
│   ├── route-structure.sh
│   ├── auth-uses-jwt.ts
│   └── db-schema.py
├── preconditions/     # Check if ready to do something
│   ├── deps-installed.sh
│   └── env-vars-set.sh
└── postconditions/    # Check if something worked
    ├── tests-pass.sh
    └── build-succeeds.sh
```

### Naming Convention

Name scripts after **what they verify**, not when they run:

- `route-structure.sh` - verifies route file organization
- `auth-uses-jwt.ts` - verifies JWT is the auth mechanism
- `prisma-schema-valid.sh` - verifies Prisma schema is valid

## Ephemeral Verification

Some assumptions are only valid for the current moment—services running, ports available, connections alive. These use a temporary session directory.

### Session Setup

Claude creates this once per conversation:

```bash
export VERIFY_SESSION="/tmp/verify-$(date +%s)"
mkdir -p "$VERIFY_SESSION"
# Creates run-all.sh entry point automatically
```

### Example: Deploying a Feature

**User:** "Deploy the new user service"

**Claude's internal process:**

> Before deploying, I need to verify:
> 1. Database is accessible
> 2. Port 8080 is available
> 3. Required services are running
>
> These are ephemeral—they could change any moment.

**Claude creates ephemeral checks:**

```bash
#!/bin/bash
# $VERIFY_SESSION/db-alive.sh
pg_isready -h localhost -q && echo "PASS: DB ready" || { echo "FAIL: DB down"; exit 1; }
```

```bash
#!/bin/bash
# $VERIFY_SESSION/port-free.sh
! nc -z localhost 8080 2>/dev/null && echo "PASS: Port 8080 free" || { echo "FAIL: Port in use"; exit 1; }
```

```bash
#!/bin/bash
# $VERIFY_SESSION/auth-service.sh
curl -sf http://localhost:3001/health > /dev/null && echo "PASS: Auth service up" || { echo "FAIL: Auth down"; exit 1; }
```

**Run all before proceeding:**

```bash
$VERIFY_SESSION/run-all.sh
```

**Output:**
```
=== db-alive.sh ===
PASS: DB ready

=== port-free.sh ===
PASS: Port 8080 free

=== auth-service.sh ===
PASS: Auth service up

=== Summary: 3 scripts ===
All checks passed
```

### When to Use Ephemeral vs Persistent

| Ephemeral | Persistent |
|-----------|------------|
| Is the server running? | Where are routes located? |
| Is this port free? | What auth mechanism is used? |
| Is the connection alive? | Does this API support streaming? |
| Is the lock released? | What's the schema structure? |
| Is the token still valid? | What patterns does the codebase use? |

**Rule of thumb:** If re-running the check tomorrow would give a different answer, it's ephemeral.

## Accumulated Value

Verification scripts become project artifacts:

### Re-run in Future Sessions

```bash
# New Claude session, same project
./verification/assumptions/route-structure.sh
# Confirms nothing changed
```

### Onboarding

New team members can run verification scripts to understand the codebase:

```bash
# "How does auth work in this project?"
./verification/assumptions/auth-uses-jwt.ts
# Output explains the auth mechanism
```

### CI/CD Integration

Add to your pipeline:

```yaml
# .github/workflows/verify.yml
- name: Run verification checks
  run: |
    for script in verification/assumptions/*.sh; do
      bash "$script" || exit 1
    done
```

## When NOT to Verify

Not everything needs a script. Skip verification when:

- The assumption is trivial (e.g., "JavaScript files end in .js")
- You're about to look at the thing anyway (e.g., about to read a file)
- The cost of being wrong is low (quick to fix)
- You're in rapid prototyping mode

The skill is about **reducing costly mistakes**, not about verifying everything.

## Customizing Behavior

The skill is designed to work automatically, but you can guide it:

**Request verification:**
```
"Verify your assumptions before making changes to the auth system"
```

**Skip verification:**
```
"Just make the change quickly, don't worry about verification"
```

**Run existing scripts:**
```
"Run the verification scripts to make sure nothing broke"
```

## Troubleshooting

### Scripts Not Running

Make sure scripts are executable:
```bash
chmod +x verification/**/*.sh
```

### Wrong Working Directory

Scripts assume they run from project root:
```bash
cd /path/to/project
./verification/assumptions/check.sh
```

### Missing Dependencies

For TypeScript scripts, ensure bun is installed:
```bash
curl -fsSL https://bun.sh/install | bash
```

For Python scripts, use the project's Python:
```bash
python3 verification/assumptions/check.py
```

## Summary

1. Claude automatically recognizes risky assumptions
2. Creates verification scripts to prove/disprove them
3. Runs scripts and incorporates findings
4. **Persistent** scripts go in `verification/` for reuse
5. **Ephemeral** scripts go in `$VERIFY_SESSION/` for runtime checks

The goal: **"I confirmed X"** instead of **"I think X"**
