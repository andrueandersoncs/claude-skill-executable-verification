---
name: executable-verification
description: Implements the Executable Verification pattern - an evolution of RPI (Research, Plan, Implement) where each phase outputs runnable code that proves assumptions rather than just prose summaries. Use this for complex features, refactorings, or when working with unfamiliar codebases where verifiable understanding is critical.
allowed-tools: Read, Grep, Glob, Write, Edit, Bash, Task, TodoWrite
---

# Executable Verification Workflow

This skill implements the **Executable Verification** pattern, an improvement over standard RPI (Research, Plan, Implement) workflows. The key principle: **every phase outputs executable code that proves the agent's understanding** rather than just markdown summaries.

## Core Principle

**Verification depth decreases as you progress:**
- Research: Deep, precise verification (AST analysis, architectural invariants)
- Planning: Lighter verification (precondition checks, file existence)
- Implementation: Standard testing (unit tests, integration tests)

This mirrors the impact magnitude of errors at each phase - mistakes in research propagate through everything, so we verify deeply upfront.

## When to Use This Skill

Use executable verification for:
- Complex features requiring architectural changes
- Refactoring large codebases
- Working with unfamiliar code where assumptions are risky
- Multi-file changes with architectural implications
- Tasks where mistakes are expensive

Skip it for:
- Single-file, straightforward changes
- Trivial bug fixes
- Well-understood patterns you've used before

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
   - Use AST parsing (ts-morph, babel, python ast, etc.)
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

## Phase 2: Planning with Precondition Checks

**Goal:** Validate that integration points exist and are ready for implementation.

### Steps:

1. **Break Down the Plan**
   - Identify discrete implementation steps
   - For each step, identify what must be true to proceed

2. **Write Precondition Checks**
   - Create `planning/preconditions.ts`
   - Each plan step gets precondition checks
   - Checks are lighter: file existence, string matching, basic structure
   - Avoid re-analyzing everything (research already did that)

3. **Validate Before Implementation**
   - Run precondition checks
   - All preconditions must pass before starting implementation
   - If blocked, resolve issues first

**See [planning-phase.md](planning-phase.md) for templates and examples.**

### Example Planning Output:

```typescript
// planning/preconditions.ts
import * as fs from "fs";

interface PlanStep {
  name: string;
  preconditions: Array<{
    description: string;
    check: () => boolean;
  }>;
}

export const plan: PlanStep[] = [
  {
    name: "Add OAuth2 provider support",
    preconditions: [
      {
        description: "AuthService exports authenticate method",
        check: () => {
          const content = fs.readFileSync("src/services/AuthService.ts", "utf-8");
          return content.includes("export") && content.includes("authenticate");
        },
      },
      {
        description: "No existing OAuth implementation",
        check: () => {
          return (
            !fs.existsSync("src/services/OAuthService.ts") &&
            !fs.readFileSync("src/services/AuthService.ts", "utf-8").toLowerCase().includes("oauth")
          );
        },
      },
    ],
  },
  // More steps...
];

for (const step of plan) {
  const passed = step.preconditions.every((p) => p.check());
  console.log(`[${passed ? "READY" : "BLOCKED"}] ${step.name}`);

  if (!passed) {
    step.preconditions.filter((p) => !p.check()).forEach((p) => console.log(`    ✗ ${p.description}`));
  }
}
```

## Phase 3: Implementation with Standard Tests

**Goal:** Write code and verify it works through standard testing.

By this phase, the deep verification work is done. Now it's just normal software development with tests.

### Steps:

1. **Implement According to Plan**
   - Follow the validated plan from phase 2
   - Write clean, maintainable code

2. **Write Tests**
   - Unit tests for individual functions
   - Integration tests for workflows
   - Use existing test frameworks (vitest, jest, pytest, etc.)

3. **Run and Verify**
   - All tests must pass
   - Code must satisfy original requirements

**See [implementation-phase.md](implementation-phase.md) for best practices.**

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
   - Create `research/` directory
   - Write `assumptions.ts` with verification code
   - Run verification: `npm run verify:research` or `node research/assumptions.ts`
   - Iterate until all assumptions pass

2. **Move to Planning**
   - Create `planning/` directory
   - Write `preconditions.ts` with checks
   - Run checks: `npm run verify:plan` or `node planning/preconditions.ts`
   - Only proceed if all steps are "READY"

3. **Implement and Test**
   - Write implementation code
   - Write standard tests
   - Run tests: `npm test` or equivalent
   - Verify all tests pass

4. **Optional: Keep Verification Code**
   - Commit research and planning verification to git
   - Useful for onboarding new team members
   - Can re-run when codebase changes significantly

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
