---
name: verifying-assumptions
description: Verifies assumptions before acting by generating and running verification scripts. Triggers on every code task—at minimum one verification script per conversation. Activates when making assumptions about file structure, APIs, dependencies, patterns, runtime state, or any knowledge that could be stale.
---

# Executable Verification

**Default behavior: Verify first, act second.**

Every conversation involving code changes should include verification scripts. Do not assume—confirm. Write a script, run it, then proceed based on evidence.

## Start of Every Task

Before making any code changes, ask yourself:

1. **What am I assuming about this codebase?** (file locations, patterns, APIs)
2. **What am I assuming about the runtime?** (services running, ports, connections)
3. **Which assumptions could be wrong?**

Then write verification scripts for assumptions that matter. This is mandatory, not optional.

**Minimum per conversation:** At least one verification script. If you haven't written one, you're likely making unchecked assumptions.

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

## Verification Workflow

```
Verification:
- [ ] Listed assumptions I'm making
- [ ] Chose target: verification/ (persistent) or $VERIFY_SESSION (ephemeral)
- [ ] Wrote script(s)
- [ ] Ran script(s)
- [ ] Proceeded based on evidence (or pivoted if wrong)
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

Skip verification only when you're about to read/examine the thing anyway. When in doubt, verify.

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
