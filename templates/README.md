# Example Verification Scripts

Example scripts demonstrating different verification patterns. Use these as reference when creating your own.

## Persistent vs Ephemeral

**Persistent** (`verification/`): For assumptions about code structure, APIs, patterns. Commit to git.

**Ephemeral** (`$VERIFY_SESSION/`): For runtime state—services running, ports free, connections alive. Disposable.

## Persistent Directory Structure

When using persistent verification in a project, create:

```
verification/
├── assumptions/      # "Is X true?" checks
├── preconditions/    # "Can I do X?" checks
└── postconditions/   # "Did X work?" checks
```

## Ephemeral Session Setup

For ephemeral checks, run `ephemeral-session-setup.sh` once per conversation to create a temp directory with a `run-all.sh` entry point.

## Examples in This Directory

**Persistent patterns:**
- `example-file-structure.sh` - Verify file/directory structure
- `example-dependency-check.sh` - Verify dependencies and versions
- `example-pattern-search.sh` - Search for patterns in codebase
- `example-api-check.ts` - Verify API behavior (TypeScript/Bun)
- `example-db-schema.py` - Verify database schema (Python)

**Ephemeral patterns:**
- `ephemeral-session-setup.sh` - Create temp verification directory
- `ephemeral-service-health.sh` - Check if service is responding

## Using Persistent Examples

Copy and adapt for your project:

```bash
# Copy an example
cp templates/example-file-structure.sh verification/assumptions/routes-exist.sh

# Make executable
chmod +x verification/assumptions/routes-exist.sh

# Run
./verification/assumptions/routes-exist.sh
```

## Using Ephemeral Examples

```bash
# Set up session (once per conversation)
source templates/ephemeral-session-setup.sh

# Add a check
cp templates/ephemeral-service-health.sh "$VERIFY_SESSION/api-health.sh"

# Or write inline
cat > "$VERIFY_SESSION/port-check.sh" << 'EOF'
#!/bin/bash
! nc -z localhost 8080 2>/dev/null && echo "PASS: Port free" || { echo "FAIL: Port in use"; exit 1; }
EOF

# Run all ephemeral checks
$VERIFY_SESSION/run-all.sh
```

## Script Conventions

All verification scripts should:

1. **Output PASS/FAIL** clearly
2. **Exit 0** on success, **exit 1** on failure
3. **Be self-contained** - no external config needed
4. **Run from project root**

Example output:
```
PASS: Routes directory exists with 5 route files
```
or
```
FAIL: Routes directory not found
Searching for alternatives...
```
