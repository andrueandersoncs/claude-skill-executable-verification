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

## Phase 2: Planning with Precondition Checks

**Goal:** Validate that integration points exist and are ready for implementation.

### Steps:

1. **Break Down the Plan**
   - Identify discrete implementation steps
   - For each step, identify what must be true to proceed

2. **Write Precondition Checks**
   - Create `planning/preconditions.ts`
   - Each plan step gets precondition checks
   - Use deep verification where needed - don't artificially limit depth
   - Avoid duplicating verification already done in research phase

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
   - Create `research/` directory (if it doesn't exist)
   - Write feature-specific verification: `research/<feature-name>.ts`
   - Run verification: `npx tsx research/<feature-name>.ts`
   - Iterate until all assumptions pass

2. **Move to Planning**
   - Create `planning/` directory (if it doesn't exist)
   - Write feature-specific preconditions: `planning/<feature-name>.ts`
   - Run checks: `npx tsx planning/<feature-name>.ts`
   - Only proceed if all steps are "READY"

3. **Implement and Test**
   - Write implementation code
   - Write standard tests
   - Run tests: `npm test` or equivalent
   - Verify all tests pass

4. **Keep Verification Code**
   - Commit research and planning verification to git
   - Artifacts accumulate over time as project documentation
   - Re-run relevant scripts when revisiting features
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
