# Executable Verification Templates

Quick-start templates for implementing executable verification in your project.

## Getting Started

1. **Copy templates to your project:**
   ```bash
   # Create directories
   mkdir -p research planning

   # Copy the appropriate template
   cp .claude/skills/executable-verification/templates/research-typescript.ts research/assumptions.ts
   cp .claude/skills/executable-verification/templates/planning-template.ts planning/preconditions.ts
   ```

2. **Install dependencies:**
   ```bash
   npm install -D ts-morph tsx
   ```

3. **Customize for your project:**
   - Edit `research/assumptions.ts` with your codebase-specific assumptions
   - Edit `planning/preconditions.ts` with your implementation plan

4. **Run verification:**
   ```bash
   # Run research verification
   npx tsx research/assumptions.ts

   # Run planning verification
   npx tsx planning/preconditions.ts
   ```

## Available Templates

### TypeScript Projects

- **research-typescript.ts** - Deep AST analysis using ts-morph
  - Best for: TypeScript codebases
  - Features: Full AST parsing, type checking, structural analysis

### JavaScript Projects

- **research-javascript.js** - File system and regex-based verification
  - Best for: JavaScript codebases
  - Features: Pattern matching, import analysis, file structure checks

### Any Project

- **planning-template.ts** - Precondition checks template
  - Best for: All projects (easily adaptable)
  - Features: File existence, content checks, dependency verification

## Adding to package.json

Add verification scripts to your `package.json`:

```json
{
  "scripts": {
    "verify:research": "tsx research/assumptions.ts",
    "verify:plan": "tsx planning/preconditions.ts",
    "verify:all": "npm run verify:research && npm run verify:plan"
  }
}
```

## Example Workflow

```bash
# 1. Research phase
npx tsx research/assumptions.ts
# ✅ All assumptions verified!

# 2. Planning phase
npx tsx planning/preconditions.ts
# ✅ All steps ready!

# 3. Implementation phase
npm test
# ✅ All tests passed!
```

## Template Structure

Each template includes:
- **Assumptions/Preconditions array** - Define what to verify
- **Verification logic** - Code that proves claims
- **Runner** - Executes checks and reports results
- **Exit codes** - 0 for success, 1 for failure (CI-friendly)

## Customization Tips

1. **Focus on relevant assumptions**
   - Don't verify everything, just what matters for your task
   - Each assumption should directly inform your implementation

2. **Keep verification fast**
   - Research can be thorough but shouldn't take minutes
   - Planning should be quick (< 1 second)

3. **Make failures informative**
   - Add helpful error messages
   - Suggest how to fix failing checks

4. **Commit verification code**
   - Useful for future work
   - Helpful for team onboarding
   - Can re-run when codebase changes

## Language-Specific Notes

### TypeScript

- Use `ts-morph` for AST analysis
- Can verify types, decorators, inheritance
- Full access to TypeScript compiler API

### JavaScript

- Use file system + regex for basic checks
- Consider `@babel/parser` for deeper AST analysis
- Works with any JavaScript runtime

### Python

- Use `ast` module for AST analysis
- Can verify decorators, imports, class structure
- Standard library, no extra dependencies

## Further Reading

See the main skill documentation for detailed methodology:
- `.claude/skills/executable-verification/research-phase.md`
- `.claude/skills/executable-verification/planning-phase.md`
- `.claude/skills/executable-verification/implementation-phase.md`
