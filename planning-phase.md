# Planning Phase: Pre/Post Condition Checks

The planning phase translates research findings into an actionable implementation plan with **verification** that integration points are ready and **success criteria** that prove implementation worked.

## Core Principle

**Verify what's new - don't duplicate research verification.**

Research already proved how the codebase works. Planning verifies new things discovered while breaking down the plan:
- Preconditions for each implementation step
- Postconditions that define success
- Invariants that must hold throughout
- Integration points are available
- No blocking conflicts exist

Use deep verification where needed - the goal is avoiding redundancy, not reducing depth.

## The Three Check Types

| Check Type | When It Runs | Purpose | Example |
|------------|--------------|---------|---------|
| **Preconditions** | `--phase=pre` only | "Ready to start?" | "OAuthService doesn't exist yet" |
| **Postconditions** | `--phase=post` only | "Did it work?" | "OAuthService exists and exports provider" |
| **Invariants** | Both phases | "Did we break anything?" | "AuthService still exports authenticate" |

### Why This Matters

Without postconditions, you can't:
- **Re-verify after implementation**: Preconditions like "file doesn't exist" will fail after you create the file
- **Resume interrupted work**: No way to know if a step completed successfully
- **Regression check**: No defined success criteria to verify later
- **Validate completeness**: Tests verify behavior, but postconditions verify structure

## What to Verify

### Preconditions (Before Implementation)

Things that must be true before each implementation step can begin:

1. **File/Module Existence**
   - Does the file I need to modify exist?
   - Is the module I need to extend available?

2. **No Conflicts**
   - Is the feature already implemented?
   - Will my changes conflict with existing code?

3. **Dependencies Available**
   - Are required imports available?
   - Do helper functions exist?

### Postconditions (After Implementation)

Things that must be true after implementation completes:

1. **Created Artifacts**
   - Does the new file/class/function exist?
   - Does it export the expected interface?

2. **Integration Complete**
   - Is the new code wired into existing systems?
   - Are imports/exports properly connected?

3. **Configuration Updated**
   - Are new env vars documented?
   - Is the feature registered/enabled?

### Invariants (Always True)

Things that must remain true before AND after:

1. **Backward Compatibility**
   - Do existing exports still exist?
   - Are existing interfaces unchanged?

2. **Structural Integrity**
   - Do test files still exist?
   - Are critical files untouched?

3. **Pattern Consistency**
   - Does new code follow established patterns?
   - Are naming conventions maintained?

## Verification Depth

Planning verification can be as deep as needed - the key is verifying **new things**, not re-verifying what research already confirmed.

**Simple checks** when integration points are straightforward:
```typescript
check: () => {
  const content = fs.readFileSync("src/services/AuthService.ts", "utf-8");
  return content.includes("export") && content.includes("authenticate");
}
```

**Deep checks** when discovering new integration complexities:
```typescript
check: async () => {
  // AST analysis to verify a newly-discovered pattern
  const classes = project.getSourceFiles().flatMap(f => f.getClasses());
  for (const cls of classes) {
    const constructor = cls.getConstructors()[0];
    // Verify dependency injection pattern for new service integration
  }
  return result;
}
```

## Planning Template Structure

Create a feature-specific file like `planning/<feature-name>.ts` (or `.js`, `.py`):

```
planning/
├── oauth-authentication.ts    # Pre/post checks for OAuth implementation
├── fix-cart-calculation.ts    # Pre/post checks for cart bug fix
└── refactor-api-layer.ts      # Pre/post checks for API refactoring
```

Use this structure:

```typescript
import * as fs from "fs";
import * as path from "path";

type Check = {
  description: string;
  check: () => boolean;
};

interface PlanStep {
  name: string;
  description?: string;
  preconditions: Check[];   // Must pass BEFORE implementation
  postconditions: Check[];  // Must pass AFTER implementation
  invariants: Check[];      // Must pass BOTH before AND after
}

export const plan: PlanStep[] = [
  {
    name: "Step name (what you'll do)",
    description: "Optional: why this step is needed",
    preconditions: [
      {
        description: "What must be true before this step",
        check: () => true,
      },
    ],
    postconditions: [
      {
        description: "What must be true after this step",
        check: () => true,
      },
    ],
    invariants: [
      {
        description: "What must remain true throughout",
        check: () => true,
      },
    ],
  },
  // More steps...
];

// Runner with phase support
function main() {
  const phase = process.argv.includes("--phase=post") ? "post" : "pre";
  console.log(`📋 Validating Implementation Plan (${phase}-implementation)\n`);

  let allPassed = true;
  for (const step of plan) {
    // Select checks based on phase
    const checks = phase === "pre"
      ? [...step.preconditions, ...step.invariants]
      : [...step.postconditions, ...step.invariants];

    const results = checks.map((c) => ({ ...c, passed: c.check() }));
    const stepPassed = results.every((r) => r.passed);
    const status = stepPassed ? "✅ PASS" : "❌ FAIL";

    console.log(`${status} ${step.name}`);
    if (step.description) {
      console.log(`    ${step.description}`);
    }

    if (!stepPassed) {
      allPassed = false;
      results
        .filter((r) => !r.passed)
        .forEach((r) => console.log(`    ❌ ${r.description}`));
    }
    console.log();
  }

  const phaseLabel = phase === "pre" ? "ready to implement" : "implementation complete";
  console.log(allPassed ? `✅ All steps ${phaseLabel}!` : `❌ Some checks failed`);
  process.exit(allPassed ? 0 : 1);
}

main();
```

## Running Verification

```bash
# Before implementation - check preconditions + invariants
npx tsx planning/oauth-authentication.ts --phase=pre

# After implementation - check postconditions + invariants
npx tsx planning/oauth-authentication.ts --phase=post
```

## Example: OAuth Implementation Plan

```typescript
import * as fs from "fs";
import * as path from "path";

type Check = { description: string; check: () => boolean };

interface PlanStep {
  name: string;
  description?: string;
  preconditions: Check[];
  postconditions: Check[];
  invariants: Check[];
}

export const plan: PlanStep[] = [
  {
    name: "Create OAuthService class",
    description: "Handles OAuth flow for multiple providers",
    preconditions: [
      {
        description: "src/services directory exists",
        check: () => fs.existsSync("src/services"),
      },
      {
        description: "OAuthService doesn't already exist",
        check: () => !fs.existsSync("src/services/OAuthService.ts"),
      },
    ],
    postconditions: [
      {
        description: "OAuthService file exists",
        check: () => fs.existsSync("src/services/OAuthService.ts"),
      },
      {
        description: "OAuthService exports OAuthProvider type",
        check: () => {
          const content = fs.readFileSync("src/services/OAuthService.ts", "utf-8");
          return content.includes("export") && content.includes("OAuthProvider");
        },
      },
      {
        description: "OAuthService exports authenticate method",
        check: () => {
          const content = fs.readFileSync("src/services/OAuthService.ts", "utf-8");
          return content.includes("authenticate");
        },
      },
    ],
    invariants: [
      {
        description: "AuthService still exists",
        check: () => fs.existsSync("src/services/AuthService.ts"),
      },
    ],
  },

  {
    name: "Add OAuth callback routes",
    description: "Add routes for handling OAuth provider callbacks",
    preconditions: [
      {
        description: "Auth routes file exists",
        check: () => fs.existsSync("src/routes/auth.ts"),
      },
      {
        description: "No OAuth routes already defined",
        check: () => {
          const content = fs.readFileSync("src/routes/auth.ts", "utf-8");
          return !content.toLowerCase().includes("/oauth");
        },
      },
    ],
    postconditions: [
      {
        description: "OAuth callback route exists",
        check: () => {
          const content = fs.readFileSync("src/routes/auth.ts", "utf-8");
          return content.includes("/oauth/callback") || content.includes("oauth/callback");
        },
      },
      {
        description: "Route imports OAuthService",
        check: () => {
          const content = fs.readFileSync("src/routes/auth.ts", "utf-8");
          return content.includes("OAuthService");
        },
      },
    ],
    invariants: [
      {
        description: "Router uses Express-style routing",
        check: () => {
          const content = fs.readFileSync("src/routes/auth.ts", "utf-8");
          return content.includes("router.") || content.includes("Router()");
        },
      },
      {
        description: "Existing login route still present",
        check: () => {
          const content = fs.readFileSync("src/routes/auth.ts", "utf-8");
          return content.includes("/login");
        },
      },
    ],
  },

  {
    name: "Extend User model with OAuth fields",
    description: "Add oauthProvider and oauthId fields to User",
    preconditions: [
      {
        description: "Using Prisma for data modeling",
        check: () => fs.existsSync("prisma/schema.prisma"),
      },
      {
        description: "OAuth fields not already present",
        check: () => {
          const schema = fs.readFileSync("prisma/schema.prisma", "utf-8");
          return !schema.includes("oauthProvider");
        },
      },
    ],
    postconditions: [
      {
        description: "oauthProvider field added to User model",
        check: () => {
          const schema = fs.readFileSync("prisma/schema.prisma", "utf-8");
          return schema.includes("oauthProvider");
        },
      },
      {
        description: "oauthId field added to User model",
        check: () => {
          const schema = fs.readFileSync("prisma/schema.prisma", "utf-8");
          return schema.includes("oauthId");
        },
      },
    ],
    invariants: [
      {
        description: "User model still has email field",
        check: () => {
          const schema = fs.readFileSync("prisma/schema.prisma", "utf-8");
          return schema.includes("email");
        },
      },
      {
        description: "User model still has password field",
        check: () => {
          const schema = fs.readFileSync("prisma/schema.prisma", "utf-8");
          return schema.includes("password");
        },
      },
    ],
  },

  {
    name: "Write tests for OAuth flow",
    description: "Integration tests for OAuth authentication",
    preconditions: [
      {
        description: "Test infrastructure exists",
        check: () => fs.existsSync("src/__tests__") || fs.existsSync("tests"),
      },
      {
        description: "OAuthService exists to test",
        check: () => fs.existsSync("src/services/OAuthService.ts"),
      },
    ],
    postconditions: [
      {
        description: "OAuth test file created",
        check: () => {
          return (
            fs.existsSync("src/__tests__/oauth.test.ts") ||
            fs.existsSync("tests/oauth.test.ts")
          );
        },
      },
      {
        description: "Test covers authenticate method",
        check: () => {
          const testPaths = ["src/__tests__/oauth.test.ts", "tests/oauth.test.ts"];
          const testFile = testPaths.find((p) => fs.existsSync(p));
          if (!testFile) return false;
          const content = fs.readFileSync(testFile, "utf-8");
          return content.includes("authenticate");
        },
      },
    ],
    invariants: [
      {
        description: "Existing auth tests still present",
        check: () => {
          return (
            fs.existsSync("src/__tests__/auth.test.ts") ||
            fs.existsSync("tests/auth.test.ts")
          );
        },
      },
    ],
  },
];
```

## Check Type Patterns

### Precondition Patterns

Use these for things that must be true **before** starting:

```typescript
// File doesn't exist yet (we're about to create it)
{ description: "OAuthService doesn't exist yet", check: () => !fs.existsSync("src/services/OAuthService.ts") }

// No conflicts with existing code
{ description: "No OAuth routes defined", check: () => !fs.readFileSync("src/routes/auth.ts", "utf-8").includes("/oauth") }

// Dependencies are in place
{ description: "Express is installed", check: () => JSON.parse(fs.readFileSync("package.json", "utf-8")).dependencies?.express }
```

### Postcondition Patterns

Use these for things that must be true **after** implementation:

```typescript
// File was created
{ description: "OAuthService exists", check: () => fs.existsSync("src/services/OAuthService.ts") }

// Expected exports are present
{ description: "OAuthService exports authenticate", check: () => fs.readFileSync("src/services/OAuthService.ts", "utf-8").includes("export") && fs.readFileSync("src/services/OAuthService.ts", "utf-8").includes("authenticate") }

// Integration was completed
{ description: "Routes import OAuthService", check: () => fs.readFileSync("src/routes/auth.ts", "utf-8").includes("OAuthService") }

// Configuration was added
{ description: "OAuth env vars documented", check: () => fs.readFileSync(".env.example", "utf-8").includes("OAUTH_CLIENT_ID") }
```

### Invariant Patterns

Use these for things that must remain true **throughout**:

```typescript
// Existing files untouched
{ description: "AuthService still exists", check: () => fs.existsSync("src/services/AuthService.ts") }

// Existing exports preserved
{ description: "AuthService still exports authenticate", check: () => fs.readFileSync("src/services/AuthService.ts", "utf-8").includes("authenticate") }

// Architectural patterns maintained
{ description: "Router pattern preserved", check: () => fs.readFileSync("src/routes/auth.ts", "utf-8").includes("Router()") }

// Tests still present
{ description: "Auth tests exist", check: () => fs.existsSync("src/__tests__/auth.test.ts") }
```

## Test Postconditions (Required)

**Tests are not optional.** Every plan step that creates functionality MUST include test postconditions.

### Why Tests Are Postconditions

- **Structural postconditions** verify files exist with expected exports
- **Test postconditions** verify the code actually works
- Without test postconditions, `--phase=post` only confirms structure, not behavior

### Test Postcondition Patterns

```typescript
import { execSync } from "child_process";

// 1. Test file exists
{
  description: "Unit tests exist for OAuthService",
  check: () => fs.existsSync("src/__tests__/OAuthService.test.ts"),
}

// 2. Tests pass (runs actual tests)
{
  description: "OAuthService tests pass",
  check: () => {
    try {
      execSync("npm test -- --run src/__tests__/OAuthService.test.ts", {
        stdio: "pipe",
        timeout: 60000,
      });
      return true;
    } catch {
      return false;
    }
  },
}

// 3. All tests pass (for final verification)
{
  description: "All tests pass",
  check: () => {
    try {
      execSync("npm test -- --run", { stdio: "pipe", timeout: 120000 });
      return true;
    } catch {
      return false;
    }
  },
}

// 4. Coverage threshold (optional but recommended)
{
  description: "Test coverage above 80%",
  check: () => {
    try {
      const result = execSync("npm test -- --coverage --run", {
        encoding: "utf-8",
        stdio: "pipe",
      });
      // Parse coverage output for threshold
      const coverageMatch = result.match(/All files\s+\|\s+([\d.]+)/);
      return coverageMatch && parseFloat(coverageMatch[1]) >= 80;
    } catch {
      return false;
    }
  },
}
```

### Required Test Postconditions by Component Type

| Component Type | Required Postconditions |
|----------------|------------------------|
| Pure functions (validators, utils) | Test file exists + tests pass |
| Services with side effects | Test file exists + tests pass + integration test exists |
| API routes/endpoints | Integration test exists + tests pass |
| Main entry point | Smoke test passes |

### Complete Example with Test Postconditions

```typescript
{
  name: "Create OAuthService",
  preconditions: [
    { description: "src/services exists", check: () => fs.existsSync("src/services") },
    { description: "OAuthService doesn't exist", check: () => !fs.existsSync("src/services/OAuthService.ts") },
  ],
  postconditions: [
    // Structural
    { description: "OAuthService file exists", check: () => fs.existsSync("src/services/OAuthService.ts") },
    { description: "OAuthService exports authenticate", check: () => {
      const content = fs.readFileSync("src/services/OAuthService.ts", "utf-8");
      return content.includes("export") && content.includes("authenticate");
    }},

    // TESTS - REQUIRED
    { description: "OAuthService test file exists", check: () => fs.existsSync("src/__tests__/OAuthService.test.ts") },
    { description: "OAuthService tests pass", check: () => {
      try {
        execSync("npm test -- --run src/__tests__/OAuthService.test.ts", { stdio: "pipe" });
        return true;
      } catch { return false; }
    }},
  ],
  invariants: [
    { description: "Existing auth tests still pass", check: () => {
      try {
        execSync("npm test -- --run src/__tests__/auth.test.ts", { stdio: "pipe" });
        return true;
      } catch { return false; }
    }},
  ],
}
```

## Running Planning Verification

Run feature-specific verification with phase flag:
```bash
# Before implementation
npx tsx planning/oauth-authentication.ts --phase=pre

# After implementation
npx tsx planning/oauth-authentication.ts --phase=post
```

Or add convenience scripts:
```json
{
  "scripts": {
    "plan:oauth:pre": "tsx planning/oauth-authentication.ts --phase=pre",
    "plan:oauth:post": "tsx planning/oauth-authentication.ts --phase=post"
  }
}
```

## Workflow

### Before Implementation

Only start implementing when:
1. ✅ All preconditions pass (`--phase=pre`)
2. ✅ All invariants pass
3. ✅ You understand what each step will do

If pre-checks fail:
- **File missing?** Create the file or adjust your plan
- **Conflict detected?** Resolve the conflict or revise strategy
- **Dependency missing?** Install it first

### After Implementation

Verify completion:
1. ✅ All postconditions pass (`--phase=post`)
2. ✅ All invariants still pass (nothing broken)

If post-checks fail:
- **Postcondition failed?** Implementation is incomplete
- **Invariant failed?** You broke something that should have been preserved
- **Some pass, some fail?** Partial implementation - continue or rollback

## Handling Blocked Steps

When a step is blocked:

```typescript
// Bad: Skip the check and hope for the best
if (checkMightFail()) return true; // ❌ Don't do this

// Good: Fail fast and fix the issue
if (!requiredFile.exists()) {
  console.log("   💡 Create the file first or adjust the plan");
  return false;
}
```

### Common Resolutions:

1. **Missing File**: Create it in a preliminary step
2. **Wrong Pattern**: Update the plan to match actual codebase
3. **Already Exists**: Either skip the step or plan to refactor
4. **Missing Dependency**: Add installation step to plan

## Example: Handling Dependencies Between Steps

```typescript
export const plan: PlanStep[] = [
  {
    name: "Update Prisma schema",
    preconditions: [
      { description: "Prisma schema exists", check: () => fs.existsSync("prisma/schema.prisma") },
      { description: "OAuth fields not present", check: () => !fs.readFileSync("prisma/schema.prisma", "utf-8").includes("oauthProvider") },
    ],
    postconditions: [
      { description: "OAuth fields added", check: () => fs.readFileSync("prisma/schema.prisma", "utf-8").includes("oauthProvider") },
    ],
    invariants: [
      { description: "User model exists", check: () => fs.readFileSync("prisma/schema.prisma", "utf-8").includes("model User") },
    ],
  },

  {
    name: "Generate Prisma client",
    preconditions: [
      { description: "Schema has OAuth fields", check: () => fs.readFileSync("prisma/schema.prisma", "utf-8").includes("oauthProvider") },
    ],
    postconditions: [
      { description: "Client types include OAuth fields", check: () => {
        const clientTypes = "node_modules/.prisma/client/index.d.ts";
        return fs.existsSync(clientTypes) && fs.readFileSync(clientTypes, "utf-8").includes("oauthProvider");
      }},
    ],
    invariants: [],
  },

  {
    name: "Use new fields in code",
    preconditions: [
      { description: "Client types ready", check: () => fs.existsSync("node_modules/.prisma/client/index.d.ts") },
    ],
    postconditions: [
      { description: "OAuthService uses oauthProvider field", check: () => fs.readFileSync("src/services/OAuthService.ts", "utf-8").includes("oauthProvider") },
    ],
    invariants: [],
  },
];
```

This shows **step dependencies** - each step's preconditions depend on the previous step's postconditions.

## Pro Tips

1. **Match depth to need**
   - Simple file checks for straightforward preconditions
   - Deep AST analysis when discovering new integration complexities
   - Don't artificially limit depth - just avoid duplicating research

2. **Make failures informative**
   ```typescript
   {
     description: "AuthService exports authenticate method",
     check: () => {
       if (!fs.existsSync("src/services/AuthService.ts")) {
         console.log("      💡 File doesn't exist - did research verify the wrong path?");
         return false;
       }
       const content = fs.readFileSync("src/services/AuthService.ts", "utf-8");
       return content.includes("authenticate");
     }
   }
   ```

3. **Order steps logically**
   - Dependencies first
   - Schema changes before code changes
   - Tests last

4. **Don't duplicate research**
   - If research verified an architectural pattern, don't re-verify it
   - But DO deeply verify new integration points discovered during planning

5. **Plan for rollback**
   - Each step should be reversible
   - Know what to undo if something fails
   - Consider adding "undo" scripts for major changes

## Integration with Todo Lists

Many agentic tools (Cursor, Claude Code) have todo list features. You can integrate preconditions:

```typescript
// Before starting a todo item, run its preconditions
const currentTodo = plan[todoIndex];
const ready = currentTodo.preconditions.every(p => p.check());

if (!ready) {
  console.log(`❌ Can't start "${currentTodo.name}" - preconditions not met`);
  process.exit(1);
}

console.log(`✅ Starting "${currentTodo.name}"`);
// Proceed with implementation...
```

This prevents the agent from starting work on a step that can't succeed.
