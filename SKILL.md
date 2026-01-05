---
name: executable-verification
description: Implements the Executable Verification pattern - an evolution of RPI (Research, Plan, Implement) where each phase outputs runnable code that proves assumptions rather than just prose summaries. Always use this skill - verifiable understanding is always critical.
allowed-tools: Read, Grep, Glob, Write, Edit, Bash, Task, TodoWrite
---

# Executable Verification Workflow

This skill implements the **Executable Verification** pattern, an improvement over standard RPI (Research, Plan, Implement) workflows. The key principle: **delegate inference from the agent to deterministic sources**.

Instead of the agent inferring facts and hoping they're correct, write scripts that interact with reality:
- AST parsers that extract actual structure
- File system checks that confirm what exists
- Pattern matchers that find real occurrences
- Runtime probes that observe actual behavior
- User prompts that clarify intent and validate assumptions
- Web requests that fetch live documentation, API schemas, or external state

This shifts from "the agent thinks X is true" to "the script confirmed X is true." Every phase outputs executable code that adds new sources of ground truth rather than just markdown summaries of the agent's mental model.

## Core Principle

**Each phase verifies what it needs - avoid duplicating previous verification:**
- Research: Verify assumptions about the codebase, architecture, external systems
- Planning: Verify preconditions for each implementation step (can be deep if needed)
- Implementation: Verify behavior through standard testing

The goal is cumulative ground truth, not redundant checks. If research verified an architectural pattern, planning doesn't re-verify it - but planning may deeply verify new integration points discovered while breaking down the plan.

## When to Use This Skill

**Always.** Verifiable understanding is always critical. Every task benefits from executable proof of assumptions rather than implicit trust.

The depth of verification scales with task complexity:
- **Complex features/refactoring**: Full AST analysis, architectural invariants, comprehensive preconditions
- **Moderate changes**: Targeted verification of affected integration points
- **Simple fixes**: Lightweight verification confirming the fix location and expected behavior

Even for "trivial" changes, a quick verification script catches assumptions that humans miss. The cost of writing verification code is always less than the cost of debugging wrong assumptions.

## Phase 1: Research with Deep Verification

**Goal:** Establish ground truth about the codebase through executable proofs.

### Steps:

1. **Identify Critical Assumptions**
   - What architectural patterns exist?
   - What error handling approach is used?
   - How is state managed?
   - What are the key integration points?

2. **Write Verification Code**
   - Create `research/assumptions.ts` (or `.js`, `.py` depending on project)
   - Each assumption gets a `claim` and a `verify()` function
   - Use whatever tools extract ground truth:
     - AST parsing (ts-morph, babel, python ast) for code structure
     - Web scraping/fetch for external documentation and API specs
     - CLI tools and shell commands for system state
     - Database queries for schema and data shape
     - User prompts for intent clarification
   - Trace patterns across files
   - Validate architectural invariants

3. **Run and Validate**
   - Execute the verification script
   - All checks must pass before proceeding
   - If checks fail, update assumptions and reverify

**See [research-phase.md](research-phase.md) for detailed methodology and examples.**

### Example Research Output:

```typescript
// research/assumptions.ts
import { Project, SyntaxKind } from "ts-morph";

const project = new Project({ tsConfigFilePath: "./tsconfig.json" });

interface Assumption {
  claim: string;
  verify: () => Promise<boolean>;
}

export const assumptions: Assumption[] = [
  {
    claim: "Authentication uses JWT with RS256 signing",
    verify: async () => {
      // Deep AST analysis to prove this claim
      const authFiles = project.getSourceFiles("**/auth/**/*.ts");
      for (const file of authFiles) {
        const calls = file.getDescendantsOfKind(SyntaxKind.CallExpression);
        for (const call of calls) {
          const text = call.getText();
          if (text.includes("sign") || text.includes("verify")) {
            const args = call.getArguments();
            const optionsArg = args.find((a) => a.getText().includes("algorithm"));
            if (optionsArg?.getText().includes("RS256")) {
              return true;
            }
          }
        }
      }
      return false;
    },
  },
  // More assumptions...
];

async function main() {
  for (const a of assumptions) {
    const result = await a.verify();
    console.log(`${result ? "✓" : "✗"} ${a.claim}`);
  }
}

main();
```

## Phase 2: Planning with Pre/Post Condition Checks

**Goal:** Validate that integration points exist, are ready for implementation, and define success criteria.

### The Three Check Types

| Check Type | When It Must Pass | Purpose |
|------------|-------------------|---------|
| **Preconditions** | Before implementation | "Ready to start?" |
| **Postconditions** | After implementation | "Did it work?" |
| **Invariants** | Both before AND after | "Did we break anything?" |

### Steps:

1. **Break Down the Plan**
   - Identify discrete implementation steps
   - For each step, identify what must be true to proceed
   - For each step, define what success looks like

2. **Write Verification Checks**
   - Create `planning/<feature-name>.ts`
   - Each plan step gets:
     - **Preconditions**: What must be true before starting
     - **Postconditions**: What must be true after completing
     - **Invariants**: What must remain true throughout
   - Use deep verification where needed - don't artificially limit depth
   - Avoid duplicating verification already done in research phase

3. **Validate Before Implementation**
   - Run with `--phase=pre`: All preconditions and invariants must pass
   - If blocked, resolve issues first

4. **Validate After Implementation**
   - Run with `--phase=post`: All postconditions and invariants must pass
   - If failing, implementation is incomplete or broke something

**See [planning-phase.md](planning-phase.md) for templates and examples.**

### Example Planning Output:

```typescript
// planning/oauth-authentication.ts
import * as fs from "fs";

type Check = { description: string; check: () => boolean };

interface PlanStep {
  name: string;
  preconditions: Check[];   // Must pass BEFORE implementation
  postconditions: Check[];  // Must pass AFTER implementation
  invariants: Check[];      // Must pass BOTH before AND after
}

export const plan: PlanStep[] = [
  {
    name: "Add OAuth2 provider support",
    preconditions: [
      {
        description: "No existing OAuth implementation",
        check: () => !fs.existsSync("src/services/OAuthService.ts"),
      },
    ],
    postconditions: [
      {
        description: "OAuthService exists and exports provider",
        check: () => {
          if (!fs.existsSync("src/services/OAuthService.ts")) return false;
          const content = fs.readFileSync("src/services/OAuthService.ts", "utf-8");
          return content.includes("export") && content.includes("OAuthProvider");
        },
      },
      {
        description: "AuthService integrates with OAuthService",
        check: () => {
          const content = fs.readFileSync("src/services/AuthService.ts", "utf-8");
          return content.includes("OAuthService") || content.includes("oauth");
        },
      },
    ],
    invariants: [
      {
        description: "AuthService exports authenticate method",
        check: () => {
          const content = fs.readFileSync("src/services/AuthService.ts", "utf-8");
          return content.includes("export") && content.includes("authenticate");
        },
      },
      {
        description: "Existing auth tests still pass structure check",
        check: () => fs.existsSync("src/__tests__/auth.test.ts"),
      },
    ],
  },
  // More steps...
];

// Run with: npx tsx planning/oauth-authentication.ts --phase=pre
// Run with: npx tsx planning/oauth-authentication.ts --phase=post
const phase = process.argv.includes("--phase=post") ? "post" : "pre";

for (const step of plan) {
  const checks = phase === "pre"
    ? [...step.preconditions, ...step.invariants]
    : [...step.postconditions, ...step.invariants];

  const passed = checks.every((c) => c.check());
  console.log(`[${passed ? "✓" : "✗"}] ${step.name}`);

  if (!passed) {
    checks.filter((c) => !c.check()).forEach((c) => console.log(`    ✗ ${c.description}`));
  }
}
```

## Phase 3: Implementation with Test Verification

**Goal:** Write code and verify it works through standard testing.

By this phase, the deep verification work is done. Now implement and verify through tests.

### Critical Requirement: Tests Are Postconditions

**Tests are not optional.** They are postconditions that must pass for implementation to be complete.

Your planning postconditions MUST include test verification:

```typescript
// planning/<feature>.ts - REQUIRED postconditions for every step
{
  name: "Create UserService",
  postconditions: [
    // Structural postconditions
    { description: "UserService file exists", check: () => fs.existsSync("src/services/UserService.ts") },

    // TEST POSTCONDITIONS - REQUIRED
    { description: "Unit tests exist", check: () => fs.existsSync("src/__tests__/UserService.test.ts") },
    { description: "Tests pass", check: () => {
      try {
        execSync("npm test -- --run src/__tests__/UserService.test.ts", { stdio: "pipe" });
        return true;
      } catch { return false; }
    }},
  ],
}
```

### Test Requirements by Component Type

| Component Type | Required Tests | Example |
|----------------|----------------|---------|
| Pure functions | Unit tests | Validators, formatters, utilities |
| Services with side effects | Unit + Integration tests | Database, API, auth services |
| API routes/endpoints | Integration tests | HTTP handlers, middleware |
| Main entry point | Smoke test | App starts without error |

### Steps:

1. **Implement According to Plan**
   - Follow the validated plan from phase 2
   - Write clean, maintainable code

2. **Write Tests (Not Optional)**
   - Unit tests for individual functions
   - Integration tests for workflows
   - Use existing test frameworks (vitest, jest, pytest, etc.)

3. **Run Post-Implementation Verification**
   - Run `npx tsx planning/<feature>.ts --phase=post`
   - All postconditions must pass, INCLUDING test postconditions
   - If tests fail, implementation is incomplete

**See [implementation-phase.md](implementation-phase.md) for testing patterns.**

## Benefits of This Approach

1. **Failures are Localized**
   - You know exactly which assumption broke and where
   - Clear, actionable error messages

2. **Agents Can Self-Correct**
   - "Assumption failed: queries bypass repository layer" is actionable
   - Can regenerate plan with corrected understanding

3. **Fewer Human Touchpoints**
   - Machine validates research and planning automatically
   - You only review at the end
   - Path to fully autonomous agents

4. **Reproducible Context**
   - Start new conversations by running research verification
   - Run after merging to ensure nothing changed
   - Evergreen research artifacts

5. **Auditable**
   - Every decision has a trail
   - Can see exactly what was verified and when

## The Tradeoff

You'll use more tokens writing and running verification code. For complex codebases where mistakes are expensive, this beats markdown summaries and hoping for the best.

## Execution Flow

When using this skill, follow this pattern:

1. **Start with Research**
   - Create `research/` directory (if it doesn't exist)
   - Write feature-specific verification: `research/<feature-name>.ts`
   - Run verification: `npx tsx research/<feature-name>.ts`
   - Iterate until all assumptions pass

2. **Move to Planning**
   - Create `planning/` directory (if it doesn't exist)
   - Write feature-specific checks: `planning/<feature-name>.ts`
   - Include preconditions, postconditions, and invariants
   - Run pre-checks: `npx tsx planning/<feature-name>.ts --phase=pre`
   - Only proceed if all preconditions and invariants pass

3. **Implement and Test**
   - Write implementation code
   - Write standard tests
   - Run tests: `npm test` or equivalent
   - Verify all tests pass

4. **Validate Completion**
   - Run post-checks: `npx tsx planning/<feature-name>.ts --phase=post`
   - All postconditions and invariants must pass
   - If failing, implementation is incomplete

5. **Keep Verification Code**
   - Commit research and planning verification to git
   - Artifacts accumulate over time as project documentation
   - Re-run postconditions + invariants when revisiting features
   - New team members can run scripts to understand architecture

## Naming Convention

Name verification scripts after the feature or bug being worked on:

```
research/
├── oauth-authentication.ts      # Feature: OAuth support
├── fix-session-timeout.ts       # Bug fix: session handling
├── api-rate-limiting.ts         # Feature: rate limits
└── refactor-user-service.ts     # Refactoring work

planning/
├── oauth-authentication.ts
├── fix-session-timeout.ts
├── api-rate-limiting.ts
└── refactor-user-service.ts
```

This allows:
- **Multiple features in parallel**: Different team members working on different features
- **Historical context**: See what was verified for past features
- **Resumable sessions**: Pick up where you left off in a new conversation
- **Regression checking**: Re-run old verification when making related changes

## Quick Start Templates

Use the templates in `templates/` to get started quickly:
- `templates/research-typescript.ts` - TypeScript research template using ts-morph
- `templates/research-javascript.js` - JavaScript research template using babel
- `templates/planning-template.ts` - Planning preconditions template
- `templates/package.json` - Verification script commands

---

For detailed methodology and examples for each phase, see:
- [research-phase.md](research-phase.md)
- [planning-phase.md](planning-phase.md)
- [implementation-phase.md](implementation-phase.md)
