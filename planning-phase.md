# Planning Phase: Precondition Checks

The planning phase translates research findings into an actionable implementation plan with **verification** that integration points are ready.

## Core Principle

**Verify what's new - don't duplicate research verification.**

Research already proved how the codebase works. Planning verifies new things discovered while breaking down the plan:
- Preconditions for each implementation step
- Integration points are available
- No blocking conflicts exist
- New dependencies or patterns not covered in research

Use deep verification where needed - the goal is avoiding redundancy, not reducing depth.

## What to Verify

Focus on **preconditions** - things that must be true before each implementation step can begin.

### Common Preconditions:

1. **File/Module Existence**
   - Does the file I need to modify exist?
   - Is the module I need to extend available?

2. **API Surface**
   - Does the class/function I need exist?
   - Does it have the expected signature?

3. **No Conflicts**
   - Is the feature already implemented?
   - Will my changes conflict with existing code?

4. **Dependencies Available**
   - Are required imports available?
   - Do helper functions exist?

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
├── oauth-authentication.ts    # Preconditions for OAuth implementation
├── fix-cart-calculation.ts    # Preconditions for cart bug fix
└── refactor-api-layer.ts      # Preconditions for API refactoring
```

Use this structure:

```typescript
import * as fs from "fs";
import * as path from "path";

interface PlanStep {
  name: string;
  description?: string;
  preconditions: Array<{
    description: string;
    check: () => boolean;
  }>;
}

export const plan: PlanStep[] = [
  {
    name: "Step name (what you'll do)",
    description: "Optional: why this step is needed",
    preconditions: [
      {
        description: "What must be true before this step",
        check: () => {
          // Simple check that returns true/false
          return true;
        },
      },
    ],
  },
  // More steps...
];

// Runner
function main() {
  console.log("📋 Validating Implementation Plan\n");

  let allReady = true;
  for (const step of plan) {
    const results = step.preconditions.map((p) => ({
      ...p,
      passed: p.check(),
    }));

    const stepReady = results.every((r) => r.passed);
    const status = stepReady ? "✅ READY" : "❌ BLOCKED";

    console.log(`${status} ${step.name}`);
    if (step.description) {
      console.log(`    ${step.description}`);
    }

    if (!stepReady) {
      allReady = false;
      results
        .filter((r) => !r.passed)
        .forEach((r) => console.log(`    ❌ ${r.description}`));
    }
    console.log();
  }

  console.log(allReady ? "✅ All steps ready to implement!" : "❌ Some steps are blocked");
  process.exit(allReady ? 0 : 1);
}

main();
```

## Example: OAuth Implementation Plan

```typescript
import * as fs from "fs";
import * as path from "path";

export const plan = [
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
      {
        description: "Can import AuthService for integration",
        check: () => {
          return fs.existsSync("src/services/AuthService.ts");
        },
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
        description: "Router uses Express-style routing",
        check: () => {
          const content = fs.readFileSync("src/routes/auth.ts", "utf-8");
          return content.includes("router.") || content.includes("Router()");
        },
      },
      {
        description: "No OAuth routes already defined",
        check: () => {
          const content = fs.readFileSync("src/routes/auth.ts", "utf-8");
          return !content.toLowerCase().includes("oauth");
        },
      },
    ],
  },

  {
    name: "Extend User model with OAuth fields",
    description: "Add oauthProvider and oauthId fields to User",
    preconditions: [
      {
        description: "User model exists",
        check: () => {
          return (
            fs.existsSync("src/models/User.ts") || fs.existsSync("src/entities/User.ts")
          );
        },
      },
      {
        description: "Using Prisma for data modeling",
        check: () => fs.existsSync("prisma/schema.prisma"),
      },
      {
        description: "OAuth fields not already present",
        check: () => {
          const schemaPath = "prisma/schema.prisma";
          if (!fs.existsSync(schemaPath)) return false;

          const schema = fs.readFileSync(schemaPath, "utf-8");
          return !schema.includes("oauthProvider") && !schema.includes("oauthId");
        },
      },
    ],
  },

  {
    name: "Create database migration",
    description: "Add OAuth columns to users table",
    preconditions: [
      {
        description: "Prisma schema updated with OAuth fields",
        check: () => {
          const schema = fs.readFileSync("prisma/schema.prisma", "utf-8");
          return schema.includes("oauthProvider") && schema.includes("oauthId");
        },
      },
      {
        description: "Prisma CLI available",
        check: () => {
          const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
          return (
            packageJson.devDependencies?.prisma ||
            packageJson.dependencies?.["@prisma/client"]
          );
        },
      },
    ],
  },

  {
    name: "Add OAuth configuration",
    description: "Add OAuth client IDs and secrets to config",
    preconditions: [
      {
        description: "Config file exists",
        check: () => {
          return (
            fs.existsSync("src/config/index.ts") ||
            fs.existsSync("src/config.ts") ||
            fs.existsSync(".env.example")
          );
        },
      },
      {
        description: "Auth config section exists",
        check: () => {
          const configFiles = ["src/config/index.ts", "src/config.ts"].filter((f) =>
            fs.existsSync(f)
          );

          return configFiles.some((file) => {
            const content = fs.readFileSync(file, "utf-8");
            return content.includes("auth") || content.includes("jwt");
          });
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
        check: () => {
          return (
            fs.existsSync("src/__tests__") ||
            fs.existsSync("test") ||
            fs.existsSync("tests")
          );
        },
      },
      {
        description: "Test framework configured",
        check: () => {
          const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));
          return (
            packageJson.devDependencies?.vitest ||
            packageJson.devDependencies?.jest ||
            packageJson.scripts?.test
          );
        },
      },
      {
        description: "Auth tests exist as template",
        check: () => {
          const testDirs = ["src/__tests__", "test", "tests"].filter((d) =>
            fs.existsSync(d)
          );

          return testDirs.some((dir) => {
            const authTestFile = path.join(dir, "auth.test.ts");
            return fs.existsSync(authTestFile) || fs.existsSync(authTestFile.replace(".ts", ".js"));
          });
        },
      },
    ],
  },
];
```

## Precondition Types

### 1. File Existence Checks

```typescript
{
  description: "Target file exists",
  check: () => fs.existsSync("path/to/file.ts")
}
```

### 2. Content Pattern Checks

```typescript
{
  description: "File exports expected function",
  check: () => {
    const content = fs.readFileSync("src/service.ts", "utf-8");
    return content.includes("export") && content.includes("functionName");
  }
}
```

### 3. No Conflict Checks

```typescript
{
  description: "Feature not already implemented",
  check: () => {
    const content = fs.readFileSync("src/features.ts", "utf-8");
    return !content.toLowerCase().includes("oauth");
  }
}
```

### 4. Dependency Checks

```typescript
{
  description: "Required package is installed",
  check: () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
    return pkg.dependencies?.["package-name"] || pkg.devDependencies?.["package-name"];
  }
}
```

### 5. Configuration Checks

```typescript
{
  description: "Environment variable template exists",
  check: () => {
    if (!fs.existsSync(".env.example")) return false;
    const env = fs.readFileSync(".env.example", "utf-8");
    return env.includes("JWT_SECRET");
  }
}
```

## Running Planning Verification

Run feature-specific verification directly:
```bash
npx tsx planning/oauth-authentication.ts
npx tsx planning/fix-cart-calculation.ts
# or
node planning/oauth-authentication.js
python planning/oauth_authentication.py
```

Or add convenience scripts for frequently-run verifications:
```json
{
  "scripts": {
    "plan:oauth": "tsx planning/oauth-authentication.ts",
    "plan:cart-fix": "tsx planning/fix-cart-calculation.ts"
  }
}
```

## When to Move to Implementation

Only start implementing when:
1. ✅ All plan steps show "READY"
2. ✅ No preconditions are failing
3. ✅ You understand what each step will do

If preconditions fail:
- **File missing?** Create the file or adjust your plan
- **Function doesn't exist?** Add it first or update approach
- **Conflict detected?** Resolve the conflict or revise strategy

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
export const plan = [
  {
    name: "Update Prisma schema",
    preconditions: [
      {
        description: "Prisma schema exists",
        check: () => fs.existsSync("prisma/schema.prisma"),
      },
    ],
  },

  {
    name: "Generate Prisma client",
    preconditions: [
      {
        description: "Schema was updated with new fields",
        check: () => {
          const schema = fs.readFileSync("prisma/schema.prisma", "utf-8");
          return schema.includes("oauthProvider") && schema.includes("oauthId");
        },
      },
    ],
  },

  {
    name: "Use new fields in code",
    preconditions: [
      {
        description: "Prisma client types include new fields",
        check: () => {
          // This will only pass after prisma generate runs
          const clientTypes = "node_modules/.prisma/client/index.d.ts";
          if (!fs.existsSync(clientTypes)) return false;

          const types = fs.readFileSync(clientTypes, "utf-8");
          return types.includes("oauthProvider");
        },
      },
    ],
  },
];
```

This shows **step dependencies** - each step's preconditions depend on the previous step completing.

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
