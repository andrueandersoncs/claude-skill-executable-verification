# Research Phase: Deep Verification

The research phase is where you establish **ground truth** about the codebase through executable proofs. This is the most critical phase - mistakes here propagate through planning and implementation.

## Core Principle

**Don't write prose summaries. Write code that proves your claims.**

Instead of:
> "The auth system uses JWT tokens"

Write:
```typescript
{
  claim: "Authentication uses JWT with RS256 signing",
  verify: async () => {
    // Code that returns true only if this is actually true
  }
}
```

## What to Verify

Focus on assumptions that are **directly relevant to the user's goal**. Don't verify random facts about the codebase.

### Common Research Areas:

1. **Architectural Patterns**
   - How is the code organized? (MVC, layered, hexagonal, etc.)
   - What dependencies exist between layers?
   - Are there architectural invariants to preserve?

2. **Error Handling**
   - Exceptions vs Result types?
   - How are errors propagated?
   - Is there centralized error handling?

3. **State Management**
   - Where is state stored?
   - How is state updated?
   - Are there state management libraries in use?

4. **Integration Points**
   - What external services are used?
   - How is the database accessed?
   - What APIs are exposed/consumed?

5. **Testing Strategy**
   - What test framework is used?
   - What's the current test coverage?
   - Are there testing conventions to follow?

## Tools for Deep Verification

Use whatever tools extract ground truth. The goal is delegating inference to deterministic sources.

### TypeScript/JavaScript: ts-morph

```typescript
import { Project, SyntaxKind } from "ts-morph";

const project = new Project({ tsConfigFilePath: "./tsconfig.json" });

// Find all classes that extend a base class
const findInheritance = (baseClass: string) => {
  const classes = [];
  for (const sourceFile of project.getSourceFiles()) {
    for (const classDecl of sourceFile.getClasses()) {
      const heritage = classDecl.getExtends();
      if (heritage?.getText().includes(baseClass)) {
        classes.push({
          name: classDecl.getName(),
          file: sourceFile.getFilePath(),
        });
      }
    }
  }
  return classes;
};

// Check if a pattern exists
const usesPattern = (pattern: string) => {
  for (const file of project.getSourceFiles("src/**/*.ts")) {
    if (file.getFullText().includes(pattern)) {
      return true;
    }
  }
  return false;
};
```

### Python: ast module

```python
import ast
import os
from typing import List, Callable

class AssumptionVerifier(ast.NodeVisitor):
    def __init__(self):
        self.results = []

    def verify_decorator_usage(self, decorator_name: str) -> bool:
        """Verify a decorator is used in the codebase"""
        for root, dirs, files in os.walk('src'):
            for file in files:
                if file.endswith('.py'):
                    with open(os.path.join(root, file)) as f:
                        tree = ast.parse(f.read())
                        for node in ast.walk(tree):
                            if isinstance(node, ast.FunctionDef):
                                for dec in node.decorator_list:
                                    if isinstance(dec, ast.Name) and dec.id == decorator_name:
                                        return True
        return False

    def verify_import_pattern(self, module: str) -> bool:
        """Verify no direct imports of a module exist"""
        for root, dirs, files in os.walk('src'):
            for file in files:
                if file.endswith('.py'):
                    with open(os.path.join(root, file)) as f:
                        tree = ast.parse(f.read())
                        for node in ast.walk(tree):
                            if isinstance(node, ast.Import):
                                for name in node.names:
                                    if module in name.name:
                                        return False
                            elif isinstance(node, ast.ImportFrom):
                                if node.module and module in node.module:
                                    return False
        return True
```

### Any Language: File System + Regex

For lighter checks or non-AST analysis:

```typescript
import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";

// Verify file structure
const verifyStructure = () => {
  return (
    fs.existsSync("src/services") &&
    fs.existsSync("src/repositories") &&
    fs.existsSync("src/controllers")
  );
};

// Verify naming convention
const verifyNamingConvention = async () => {
  const serviceFiles = await glob("src/services/**/*.ts");
  return serviceFiles.every((file) => path.basename(file).endsWith("Service.ts"));
};

// Verify no direct database access outside repositories
const verifyRepositoryPattern = async () => {
  const allFiles = await glob("src/**/*.ts");
  const repoFiles = await glob("src/repositories/**/*.ts");
  const repoFilePaths = new Set(repoFiles);

  for (const file of allFiles) {
    if (repoFilePaths.has(file)) continue;
    if (file.includes(".test.")) continue;

    const content = fs.readFileSync(file, "utf-8");
    // Check for direct database imports
    if (content.match(/from ['"].*prisma['"]/) || content.match(/from ['"].*pg['"]/)) {
      console.log(`❌ Direct DB import in ${file}`);
      return false;
    }
  }
  return true;
};
```

### External Sources: Web Scraping & APIs

Verify assumptions about external systems, documentation, or API contracts:

```typescript
// Verify API contract matches documentation
const verifyApiContract = async () => {
  const response = await fetch("https://api.example.com/openapi.json");
  const spec = await response.json();

  // Check expected endpoint exists
  return spec.paths["/users"]?.post?.responses?.["201"] !== undefined;
};

// Scrape documentation for version compatibility
const verifyVersionRequirements = async () => {
  const response = await fetch("https://docs.example.com/requirements");
  const html = await response.text();

  // Check Node.js version requirement
  return html.includes("Node.js 18") || html.includes("Node.js 20");
};
```

### User Interaction: Clarifying Intent

When assumptions can't be verified programmatically, prompt the user:

```typescript
import * as readline from "readline";

const verifyWithUser = async (question: string): Promise<boolean> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
};

// Example usage
{
  claim: "New feature should follow existing modal pattern",
  verify: async () => {
    // Try programmatic verification first
    const hasModalPattern = fs.existsSync("src/components/Modal.tsx");
    if (!hasModalPattern) {
      // Fall back to user clarification
      return verifyWithUser("No existing modal found. Should we create a new modal pattern?");
    }
    return true;
  }
}
```

### CLI & System State

Verify system configuration and runtime state:

```typescript
import { execSync } from "child_process";

// Verify database is accessible
const verifyDatabaseConnection = () => {
  try {
    execSync("npx prisma db execute --stdin <<< 'SELECT 1'", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
};

// Verify correct Node version
const verifyNodeVersion = () => {
  const version = execSync("node --version").toString().trim();
  const major = parseInt(version.replace("v", "").split(".")[0]);
  return major >= 18;
};

// Verify git state
const verifyCleanGitState = () => {
  const status = execSync("git status --porcelain").toString();
  return status.trim() === "";
};
```

## Research Template Structure

Create a feature-specific file like `research/<feature-name>.ts` (or `.js`, `.py`):

```
research/
├── oauth-authentication.ts    # Verifies auth architecture for OAuth feature
├── fix-cart-calculation.ts    # Verifies cart logic for bug fix
└── refactor-api-layer.ts      # Verifies API patterns for refactoring
```

Use this structure:

```typescript
import { Project } from "ts-morph";
import * as fs from "fs";

const project = new Project({ tsConfigFilePath: "./tsconfig.json" });

interface Assumption {
  claim: string;
  verify: () => Promise<boolean> | boolean;
}

export const assumptions: Assumption[] = [
  {
    claim: "Clear architectural claim about the codebase",
    verify: async () => {
      // Deep verification code that proves this claim
      // Returns true only if claim is validated
      // Returns false if claim is incorrect
      return true; // or false
    },
  },
  // More assumptions...
];

// Runner
async function main() {
  console.log("🔍 Verifying Research Assumptions\n");

  let allPassed = true;
  for (const assumption of assumptions) {
    try {
      const result = await assumption.verify();
      console.log(`${result ? "✅" : "❌"} ${assumption.claim}`);
      if (!result) allPassed = false;
    } catch (error) {
      console.log(`❌ ${assumption.claim}`);
      console.log(`   Error: ${error.message}`);
      allPassed = false;
    }
  }

  console.log(`\n${allPassed ? "✅ All assumptions verified!" : "❌ Some assumptions failed"}`);
  process.exit(allPassed ? 0 : 1);
}

main();
```

## Example: Verifying Authentication Architecture

Let's say the user wants to add OAuth support. Here's what thorough research verification looks like:

```typescript
import { Project, SyntaxKind } from "ts-morph";
import * as fs from "fs";

const project = new Project({ tsConfigFilePath: "./tsconfig.json" });

export const assumptions = [
  {
    claim: "Authentication uses JWT tokens",
    verify: async () => {
      const authFiles = project.getSourceFiles("**/auth/**/*.ts");
      for (const file of authFiles) {
        if (file.getFullText().includes("jsonwebtoken") || file.getFullText().includes("jwt")) {
          return true;
        }
      }
      return false;
    },
  },

  {
    claim: "JWT signing uses RS256 (asymmetric) not HS256",
    verify: async () => {
      const authFiles = project.getSourceFiles("**/auth/**/*.ts");
      for (const file of authFiles) {
        const calls = file.getDescendantsOfKind(SyntaxKind.CallExpression);
        for (const call of calls) {
          const text = call.getText();
          if (text.includes("sign") || text.includes("verify")) {
            // Check for algorithm specification
            const args = call.getArguments();
            for (const arg of args) {
              const argText = arg.getText();
              if (argText.includes("algorithm") && argText.includes("RS256")) {
                return true;
              }
            }
          }
        }
      }
      return false;
    },
  },

  {
    claim: "User model has 'password' field for local auth",
    verify: async () => {
      const userModel = project.getSourceFile("**/models/User.ts") ||
                       project.getSourceFile("**/entities/User.ts");
      if (!userModel) return false;

      const interfaces = userModel.getInterfaces();
      const classes = userModel.getClasses();

      for (const item of [...interfaces, ...classes]) {
        const properties = item.getProperties();
        if (properties.some((p) => p.getName() === "password")) {
          return true;
        }
      }
      return false;
    },
  },

  {
    claim: "Password hashing uses bcrypt",
    verify: async () => {
      const authFiles = project.getSourceFiles("**/auth/**/*.ts");
      for (const file of authFiles) {
        const imports = file.getImportDeclarations();
        if (imports.some((imp) => imp.getModuleSpecifierValue().includes("bcrypt"))) {
          return true;
        }
      }
      return false;
    },
  },

  {
    claim: "AuthService.authenticate returns Result type, not throws",
    verify: async () => {
      const authService = project.getSourceFile("**/AuthService.ts");
      if (!authService) return false;

      const classes = authService.getClasses();
      for (const cls of classes) {
        const authMethod = cls.getMethod("authenticate");
        if (!authMethod) continue;

        const returnType = authMethod.getReturnType().getText();
        // Check if it returns a discriminated union or Result type
        return (
          returnType.includes("|") &&
          (returnType.includes("success") || returnType.includes("ok"))
        );
      }
      return false;
    },
  },

  {
    claim: "No existing OAuth implementation",
    verify: () => {
      return (
        !fs.existsSync("src/services/OAuthService.ts") &&
        !fs.existsSync("src/auth/oauth.ts") &&
        project.getSourceFiles("**/auth/**/*.ts").every((file) => {
          return !file.getFullText().toLowerCase().includes("oauth");
        })
      );
    },
  },
];
```

## How to Build Good Assumptions

### ✅ Good Assumptions

- Specific and testable
- Directly relevant to the task
- Prove architectural patterns
- Validate integration points
- Check for conflicts with new code

### ❌ Bad Assumptions

- Too vague to verify
- Random facts about the codebase
- Things you can see in one file read
- Obvious things that don't need proof

### Examples:

**Bad:**
```typescript
{
  claim: "The codebase uses TypeScript",
  verify: () => fs.existsSync("tsconfig.json")
}
```
This is too obvious and doesn't help planning.

**Good:**
```typescript
{
  claim: "Services use constructor dependency injection with interfaces",
  verify: async () => {
    const serviceFiles = project.getSourceFiles("**/services/**/*.ts");
    for (const file of serviceFiles) {
      for (const cls of file.getClasses()) {
        const constructor = cls.getConstructors()[0];
        if (!constructor) continue;

        const params = constructor.getParameters();
        const hasInterfaceInjection = params.some((p) => {
          const type = p.getType().getText();
          return type.startsWith("I") && type !== "I"; // Interface naming convention
        });

        if (cls.getMethods().length > 0 && !hasInterfaceInjection) {
          return false;
        }
      }
    }
    return true;
  }
}
```
This proves an architectural pattern that affects how you'll write new code.

## Running Research Verification

Run feature-specific verification directly:
```bash
npx tsx research/oauth-authentication.ts
npx tsx research/fix-cart-calculation.ts
# or
node research/oauth-authentication.js
python research/oauth_authentication.py
```

Or add convenience scripts to `package.json` for frequently-run verifications:
```json
{
  "scripts": {
    "verify:oauth": "tsx research/oauth-authentication.ts",
    "verify:cart-fix": "tsx research/fix-cart-calculation.ts"
  }
}
```

## When to Move to Planning

Only proceed to planning when:
1. ✅ All assumptions pass
2. ✅ You understand the architectural patterns
3. ✅ You know where to integrate new code
4. ✅ You've identified potential conflicts

If assumptions fail, either:
- Fix your assumptions (you misunderstood something)
- Update the plan (the codebase is different than expected)
- Raise concerns (there may be blockers)

## Pro Tips

1. **Make assumptions granular**
   - One claim per assumption
   - Easier to debug when one fails

2. **Add helpful error messages**
   ```typescript
   verify: async () => {
     const result = checkSomething();
     if (!result) {
       console.log("   💡 Hint: Check src/auth/config.ts for algorithm setting");
     }
     return result;
   }
   ```

3. **Keep verification code**
   - Commit it to the repository
   - Useful for onboarding
   - Can re-run when codebase changes
   - "Evergreen research"

4. **Don't over-verify**
   - Focus on what matters for the task
   - You're not auditing the entire codebase

5. **Use the right tool**
   - AST parsing for structural verification
   - File system for organization verification
   - Regex for simple pattern matching
