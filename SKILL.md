---
name: verifying-assumptions
description: Verifies assumptions continuously—before and after every action—by generating and running verification scripts. Every action is based on assumptions; verify preconditions before acting and postconditions after. Triggers on every code task at every decision point. Activates when making assumptions about file structure, APIs, dependencies, patterns, runtime state, or any knowledge that could be stale.
---

# Executable Verification

**Default behavior: Verify continuously—before acting, after acting, and at every decision point.**

Every action you take is based on assumptions. Most failures stem from incorrect assumptions, not lack of capability. The solution: make verification a continuous habit, not a one-time step.

Do not assume—confirm. Write a script, run it, then proceed based on evidence. Then verify again after acting.

## Start of Every Task

Before making any code changes, ask yourself:

1. **What am I assuming about this codebase?** (file locations, patterns, APIs)
2. **What am I assuming about the runtime?** (services running, ports, connections)
3. **Which assumptions could be wrong?**
4. **What should be true after I act?** (postconditions to verify)

Then write verification scripts for assumptions that matter. This is mandatory, not optional.

**Minimum per task:** At least one precondition verification (before acting) AND one postcondition verification (after acting). If you haven't written both, you're likely making unchecked assumptions or not confirming your changes worked.

## What to Verify

Verify by default. The question is not "should I verify?" but "what should I verify?"

| Category | Example |
|----------|---------|
| File/directory structure | "Config is in `src/config/`" |
| API signatures | "Takes a callback as second arg" |
| Dependencies | "This library handles X" |
| Patterns | "Codebase uses this style" |
| External services | "API returns this shape" |
| Runtime state | "Server is running on port 3000" |

**Red flags requiring immediate verification:**
- "I think..." / "probably..." / "usually..." / "should be..."
- First time working in this codebase
- Modifying code you haven't read yet
- Calling an API you haven't tested
- Any knowledge that could be stale

## When to Verify

Verification is not a one-time step—it's a continuous loop. Every action you take is based on assumptions that could be wrong.

### Before Every Action (Preconditions)

Before taking any action, verify the assumptions it depends on:

| Action | Verify First |
|--------|--------------|
| Editing a file | File exists, has expected structure, patterns match what you expect |
| Running a command | Dependencies installed, correct versions, required services running |
| Calling an API | Endpoint exists, expected signature, authentication works |
| Creating a file | Directory exists, no naming conflicts, follows project conventions |
| Installing a package | Compatible with existing deps, no security issues, correct registry |

### After Every Action (Postconditions)

After taking any action, verify it had the intended effect:

| Action | Verify After |
|--------|--------------|
| Edited a file | Syntax valid, tests pass, no regressions introduced |
| Ran a command | Expected output, exit code 0, side effects as expected |
| Created a file | File exists, contents correct, permissions right |
| Installed a package | Package in lockfile, imports work, no version conflicts |
| Started a service | Service responding, correct port, logs show success |

### During Multi-Step Operations

For complex tasks, verify at each transition point:

```
Step 1: Verify preconditions → Act → Verify postconditions
         ↓
Step 2: Verify preconditions → Act → Verify postconditions
         ↓
Step 3: Verify preconditions → Act → Verify postconditions
```

**Never chain multiple actions without intermediate verification.** Each step's postconditions become the next step's preconditions—verify them explicitly.

### Verification Frequency Guide

| Situation | Frequency |
|-----------|-----------|
| Unfamiliar codebase | Verify before AND after every action |
| Familiar codebase, risky change | Verify before AND after |
| Familiar codebase, routine change | Verify after (minimum) |
| External dependencies involved | Always verify before AND after |
| Production-affecting changes | Verify at every step |

**When in doubt, over-verify.** The cost of writing a quick verification script is far less than the cost of acting on a wrong assumption.

## Verification Workflow

For each action:

```
Before Acting:
- [ ] What assumptions am I making?
- [ ] Write precondition verification script(s)
- [ ] Run script(s) — all pass?
- [ ] If any fail: STOP, reassess, do not proceed

Take Action:
- [ ] Execute the planned action

After Acting:
- [ ] What should be true now?
- [ ] Write postcondition verification script(s)
- [ ] Run script(s) — all pass?
- [ ] If any fail: diagnose, fix, re-verify
```

Choose script location:
- **Persistent** (`verification/`): File structure, patterns, API signatures—things that should remain true
- **Ephemeral** (`$VERIFY_SESSION/`): Runtime state, services, ports—things that vary by session

## Script Organization

Store scripts in `verification/` at project root:

```
verification/
├── assumptions/      # "Is X true?" checks
├── preconditions/    # "Can I do X?" checks
└── postconditions/   # "Did X work?" checks
```

Name scripts after what they verify: `routes-exist.sh`, `auth-uses-jwt.ts`

## Script Pattern

```bash
#!/bin/bash
# verification/assumptions/routes-exist.sh
[[ -d "src/routes" ]] && echo "PASS: src/routes/ exists" || { echo "FAIL: src/routes/ not found"; exit 1; }
```

**More patterns:** See [templates/](templates/) for file checks, pattern searches, API probes, database verification, and TypeScript/Python variants.

## Script Conventions

All scripts should:
1. Output `PASS:` or `FAIL:` clearly
2. Exit 0 on success, exit 1 on failure
3. Run from project root
4. Be self-contained (no external config)

## Exceptions

Skip **precondition** verification only when you're about to read/examine the thing anyway.

**Never skip postcondition verification.** You must always confirm your actions had the intended effect.

When in doubt, verify both.

## Ephemeral Verification

For runtime state (services, ports, connections), use a temp directory per conversation.

### Setup

```bash
source templates/ephemeral-session-setup.sh
```

Or manually:
```bash
export VERIFY_SESSION="/tmp/verify-$(date +%s)"
mkdir -p "$VERIFY_SESSION"
```

### Ephemeral vs Persistent

| Ephemeral (`$VERIFY_SESSION/`) | Persistent (`verification/`) |
|-------------------------------|------------------------------|
| Service running, port free, connection alive | File structure, API signatures, patterns |

### Usage

```bash
# Add checks
echo '#!/bin/bash
curl -sf localhost:3000/health && echo "PASS" || exit 1' > "$VERIFY_SESSION/api-up.sh"

# Run all
$VERIFY_SESSION/run-all.sh
```

**More patterns:** See [templates/ephemeral-service-health.sh](templates/ephemeral-service-health.sh)

## Accumulated Value

Persistent verification scripts become project artifacts:
- **Re-runnable** in future sessions
- **Documentation** of how things work
- **Onboarding** for new team members
- **CI/CD** sanity checks

Commit persistent scripts to git. Ephemeral scripts are disposable by design.
