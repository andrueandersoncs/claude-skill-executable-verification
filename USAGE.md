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

For TypeScript projects:
```bash
cp .claude/skills/executable-verification/templates/research-typescript.ts research/assumptions.ts
cp .claude/skills/executable-verification/templates/planning-template.ts planning/preconditions.ts
```

For JavaScript projects:
```bash
cp .claude/skills/executable-verification/templates/research-javascript.js research/assumptions.js
cp .claude/skills/executable-verification/templates/planning-template.ts planning/preconditions.ts
```

### 3. Install Dependencies

```bash
npm install -D ts-morph tsx
```

### 4. Add Scripts to package.json

```json
{
  "scripts": {
    "verify:research": "tsx research/assumptions.ts",
    "verify:plan": "tsx planning/preconditions.ts",
    "verify:all": "npm run verify:research && npm run verify:plan"
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

Claude will create `research/assumptions.ts`:

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
npm run verify:research
```

**Output:**
```
🔍 Verifying Research Assumptions

✅ Authentication uses JWT tokens
✅ User model has email field
✅ Services use dependency injection
❌ OAuth not already implemented

✅ All assumptions verified!
```

#### Phase 2: Planning

Claude creates `planning/preconditions.ts`:

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
npm run verify:plan
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

Edit `research/assumptions.ts` to add your own assumptions:

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

Edit `planning/preconditions.ts` to match your implementation plan:

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
- Keep checks simple (no heavy AST parsing)
- Verify integration points are ready
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

### Option 1: Commit Verification Code

**Pros:**
- Team members can see what was verified
- Useful for onboarding
- Can re-run when codebase changes

**Cons:**
- Extra files in the repo
- May become outdated

### Option 2: Treat as Temporary

**Pros:**
- Clean repository
- No maintenance burden

**Cons:**
- Lose verification artifacts
- Can't re-run later

**Recommendation:** Commit for significant features, skip for small changes.

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
# Setup (one time)
.claude/skills/executable-verification/scripts/init-verification.sh

# Research phase
npm run verify:research

# Planning phase
npm run verify:plan

# Implementation phase
npm test

# All at once
npm run verify:all && npm test
```

---

**Remember:** Executable verification is about proving understanding through code, not just documenting assumptions. When verification passes, you **know** (not just think) you understand the codebase correctly.
