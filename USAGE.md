# Executable Verification - Usage Guide

This guide shows you how to use the Executable Verification skill in practice.

## Quick Setup (Recommended)

Run the initialization script to set up verification in your project:

```bash
.claude/skills/executable-verification/scripts/init-verification.sh
```

This will:
- ✅ Create `research/` and `planning/` directories
- ✅ Copy appropriate templates based on your project type
- ✅ Add verification scripts to `package.json`
- ✅ Install required dependencies (`ts-morph`, `tsx`)
- ✅ Update `.gitignore`

## Manual Setup

If you prefer manual setup:

### 1. Create Directories

```bash
mkdir -p research planning
```

### 2. Copy Templates

Copy templates and rename for your feature/bug:

For TypeScript projects:
```bash
cp .claude/skills/executable-verification/templates/research-typescript.ts research/my-feature.ts
cp .claude/skills/executable-verification/templates/planning-template.ts planning/my-feature.ts
```

For JavaScript projects:
```bash
cp .claude/skills/executable-verification/templates/research-javascript.js research/my-feature.js
cp .claude/skills/executable-verification/templates/planning-template.ts planning/my-feature.ts
```

Name files after the feature or bug you're working on (e.g., `oauth-authentication.ts`, `fix-session-bug.ts`).

### 3. Install Dependencies

```bash
npm install -D ts-morph tsx
```

### 4. Run Verification Scripts

Run feature-specific scripts directly:
```bash
npx tsx research/oauth-authentication.ts
npx tsx planning/oauth-authentication.ts
```

Optionally add convenience scripts to `package.json` for frequently-run verifications:
```json
{
  "scripts": {
    "verify:oauth": "tsx research/oauth-authentication.ts && tsx planning/oauth-authentication.ts"
  }
}
```

## Using the Skill

### Automatic Activation

Claude Code will automatically use this skill when you:
- Ask to implement a complex feature
- Request help with refactoring
- Work with unfamiliar code
- Start multi-file architectural changes

**Example prompts that trigger the skill:**
```
"Implement OAuth authentication for the app"
"Refactor the authentication system to support multiple providers"
"Add real-time notifications using WebSockets"
```

### Manual Activation

Explicitly request the skill:
```
"Use executable verification to implement user roles and permissions"
```

## Workflow Example

Let's walk through implementing a new feature using executable verification.

### Task: "Add OAuth Authentication"

#### Phase 1: Research

Claude will create `research/oauth-authentication.ts`:

```typescript
export const assumptions = [
  {
    claim: "Authentication uses JWT tokens",
    verify: async () => {
      const authFiles = project.getSourceFiles("**/auth/**/*.ts");
      return authFiles.some(f => f.getText().includes("jsonwebtoken"));
    }
  },
  {
    claim: "User model has email field",
    verify: async () => {
      const userModel = project.getSourceFile("**/models/User.ts");
      return userModel?.getText().includes("email") ?? false;
    }
  },
  // More assumptions...
];
```

**Run verification:**
```bash
npx tsx research/oauth-authentication.ts
```

**Output:**
```
🔍 Verifying Research Assumptions

✅ Authentication uses JWT tokens
✅ User model has email field
✅ Services use dependency injection
✅ OAuth not already implemented

✅ All assumptions verified!
```

#### Phase 2: Planning

Claude creates `planning/oauth-authentication.ts`:

```typescript
export const plan = [
  {
    name: "Create OAuthService",
    preconditions: [
      {
        description: "src/services directory exists",
        check: () => fs.existsSync("src/services")
      },
      {
        description: "OAuthService doesn't exist yet",
        check: () => !fs.existsSync("src/services/OAuthService.ts")
      }
    ]
  },
  // More steps...
];
```

**Run verification:**
```bash
npx tsx planning/oauth-authentication.ts
```

**Output:**
```
📋 Validating Implementation Plan

✅ READY  Create OAuthService
✅ READY  Add OAuth routes
✅ READY  Update User model
❌ BLOCKED Run database migration
    ❌ Prisma schema not updated yet

Some steps are blocked.
```

Fix the blocker (update schema), then re-run until all steps are READY.

#### Phase 3: Implementation

Claude writes the code and tests:

```typescript
// src/services/OAuthService.ts
export class OAuthService {
  async authenticate(provider: string, code: string) {
    // Implementation...
  }
}

// src/__tests__/OAuthService.test.ts
describe("OAuthService", () => {
  it("authenticates via Google", async () => {
    const result = await service.authenticate("google", "code");
    expect(result.success).toBe(true);
  });
});
```

**Run tests:**
```bash
npm test
```

**Output:**
```
✅ All tests passed!
```

## Customizing Verification

### Research Phase Customization

Edit your feature-specific research file (e.g., `research/oauth-authentication.ts`) to add assumptions:

```typescript
{
  claim: "Your specific claim about the codebase",
  verify: async () => {
    // Your verification logic
    const files = project.getSourceFiles("**/your-pattern/**/*.ts");
    // Analyze, check conditions, return true/false
    return someCondition;
  }
}
```

**Tips:**
- Focus on architectural patterns relevant to your task
- Use AST parsing for deep analysis
- Make claims specific and testable
- Add helpful console.log for failed checks

### Planning Phase Customization

Edit your feature-specific planning file (e.g., `planning/oauth-authentication.ts`) to match your implementation plan:

```typescript
{
  name: "Your implementation step",
  description: "What this step accomplishes",
  preconditions: [
    {
      description: "File or condition that must exist",
      check: () => {
        // Simple check (file exists, string contains, etc.)
        return fs.existsSync("path") && condition;
      }
    }
  ]
}
```

**Tips:**
- Use deep verification where needed for new discoveries
- Avoid duplicating what research already verified
- Check for conflicts (feature already exists)
- Order steps by dependencies

## Verification in CI/CD

Add verification to your CI pipeline:

```yaml
# .github/workflows/verify.yml
name: Verify Assumptions

on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run verify:all
```

This ensures assumptions remain valid as the codebase evolves.

## Keeping Verification Fresh

### Recommended: Commit Feature-Specific Verification

With feature-specific naming, verification artifacts become valuable project documentation:

```
research/
├── oauth-authentication.ts     # Committed 3 months ago
├── api-rate-limiting.ts        # Committed 2 months ago
├── fix-session-timeout.ts      # Committed last week
└── user-permissions.ts         # Current feature (WIP)
```

**Benefits:**
- **Historical context**: See what was verified for past features
- **Onboarding**: New team members run scripts to understand architecture
- **Regression checking**: Re-run old verification when making related changes
- **Resumable sessions**: Pick up where you left off in a new conversation

**Maintenance:**
- Delete scripts for abandoned features
- Update scripts when significant architecture changes occur
- Run old scripts periodically to catch drift

## Troubleshooting

### "Module not found: ts-morph"

Install dependencies:
```bash
npm install -D ts-morph tsx
```

### "Cannot find tsconfig.json"

Either:
1. Create a `tsconfig.json` in your project root
2. Or modify the template to add files manually:
   ```typescript
   const project = new Project({
     skipAddingFilesFromTsConfig: true
   });
   project.addSourceFilesAtPaths("src/**/*.ts");
   ```

### "All assumptions failing"

Check that:
1. File paths match your project structure
2. Pattern matching is correct for your codebase
3. You're running from the project root directory

### "Planning shows all blocked"

This is normal if research hasn't been applied yet. The planning phase expects research to have informed some changes. Either:
1. Run research first and apply learnings
2. Update preconditions to match current state

## Best Practices

1. **Start with Research**
   - Always run research verification first
   - Don't proceed if assumptions fail
   - Use research to inform your approach

2. **Iterate on Planning**
   - Planning may reveal missing preconditions
   - Add steps as you discover dependencies
   - Re-run after each change until all ready

3. **Keep Verification Fast**
   - Research should take seconds, not minutes
   - Planning should be near-instant
   - Slow verification won't get used

4. **Make Failures Actionable**
   - Add hints for fixing failed checks
   - Log specific file paths and line numbers
   - Suggest next steps

5. **Commit When Valuable**
   - Large features: commit verification
   - Small changes: delete when done
   - Shared projects: commit for team benefit

## Advanced Usage

### Pre-commit Hook

Run verification before commits:

```bash
# .husky/pre-commit
npm run verify:all || exit 1
```

### Watch Mode

Re-run verification on file changes:

```json
{
  "scripts": {
    "verify:watch": "nodemon --exec 'npm run verify:all' --watch src"
  }
}
```

### Custom Reporters

Format output for different tools:

```typescript
// research/assumptions.ts
const jsonOutput = assumptions.map(a => ({
  claim: a.claim,
  passed: a.verify()
}));

console.log(JSON.stringify(jsonOutput, null, 2));
```

## Getting Help

- **Documentation**: See `.claude/skills/executable-verification/*.md` files
- **Templates**: Check `templates/` directory for examples
- **Issues**: File issues in your project or ask Claude Code for help

## Summary

```bash
# Setup directories (one time)
mkdir -p research planning
npm install -D ts-morph tsx

# Research phase (feature-specific)
npx tsx research/my-feature.ts

# Planning phase (feature-specific)
npx tsx planning/my-feature.ts

# Implementation phase
npm test
```

Name your verification scripts after the feature or bug (e.g., `oauth-authentication.ts`, `fix-cart-bug.ts`) to support multiple features and resumable sessions.

---

**Remember:** Executable verification is about delegating inference from the agent to deterministic sources. Instead of the agent inferring facts and hoping they're correct, scripts interact with reality - AST parsers, web requests, user prompts, system state. When verification passes, you **know** (not just think) the facts are correct.
