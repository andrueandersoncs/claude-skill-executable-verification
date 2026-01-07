# Example Verification Scripts

Example scripts demonstrating different verification patterns. Use these as reference when creating your own.

## Directory Structure

When using executable verification in a project, create:

```
verification/
├── assumptions/      # "Is X true?" checks
├── preconditions/    # "Can I do X?" checks
└── postconditions/   # "Did X work?" checks
```

## Examples in This Directory

- `example-file-structure.sh` - Verify file/directory structure
- `example-dependency-check.sh` - Verify dependencies and versions
- `example-pattern-search.sh` - Search for patterns in codebase
- `example-api-check.ts` - Verify API behavior (TypeScript/Bun)
- `example-db-schema.py` - Verify database schema (Python)

## Using Examples

Copy and adapt for your project:

```bash
# Copy an example
cp templates/example-file-structure.sh verification/assumptions/routes-exist.sh

# Make executable
chmod +x verification/assumptions/routes-exist.sh

# Run
./verification/assumptions/routes-exist.sh
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
