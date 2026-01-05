/**
 * Planning Phase - Pre/Post Condition Checks Template
 *
 * This template provides a structure for verifying:
 * - Preconditions: What must be true BEFORE implementation
 * - Postconditions: What must be true AFTER implementation (INCLUDING TESTS)
 * - Invariants: What must remain true THROUGHOUT
 *
 * IMPORTANT: Tests are postconditions, not optional extras.
 * Every step that creates functionality MUST have test postconditions.
 *
 * Usage:
 * Before implementation: npx tsx planning/<feature>.ts --phase=pre
 * After implementation:  npx tsx planning/<feature>.ts --phase=post
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

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

/**
 * Define your implementation plan here.
 * Each step should have preconditions, postconditions, and invariants.
 */
export const plan: PlanStep[] = [
  // Example step 1: Create a new service
  {
    name: "Create NewFeatureService",
    description: "Service to handle new feature logic",
    preconditions: [
      {
        description: "src/services directory exists",
        check: () => fs.existsSync("src/services"),
      },
      {
        description: "NewFeatureService doesn't already exist",
        check: () => !fs.existsSync("src/services/NewFeatureService.ts"),
      },
    ],
    postconditions: [
      // Structural postconditions
      {
        description: "NewFeatureService file exists",
        check: () => fs.existsSync("src/services/NewFeatureService.ts"),
      },
      {
        description: "NewFeatureService exports main class",
        check: () => {
          const content = fs.readFileSync("src/services/NewFeatureService.ts", "utf-8");
          return content.includes("export") && content.includes("NewFeatureService");
        },
      },
      // TEST POSTCONDITIONS - REQUIRED
      {
        description: "Unit tests exist for NewFeatureService",
        check: () => {
          return (
            fs.existsSync("src/__tests__/NewFeatureService.test.ts") ||
            fs.existsSync("src/services/__tests__/NewFeatureService.test.ts")
          );
        },
      },
      {
        description: "NewFeatureService tests pass",
        check: () => {
          try {
            execSync("npm test -- --run NewFeatureService", { stdio: "pipe", timeout: 60000 });
            return true;
          } catch {
            return false;
          }
        },
      },
    ],
    invariants: [
      {
        description: "Related services still exist",
        check: () => {
          return fs.readdirSync("src/services").some((f) => f.endsWith("Service.ts"));
        },
      },
    ],
  },

  // Example step 2: Add new route
  {
    name: "Add route for new feature",
    description: "Expose new feature via REST API",
    preconditions: [
      {
        description: "Routes directory exists",
        check: () => fs.existsSync("src/routes") || fs.existsSync("src/api/routes"),
      },
      {
        description: "Route doesn't already exist",
        check: () => {
          const routeFiles = fs.readdirSync("src/routes");
          return !routeFiles.some((f) =>
            fs.readFileSync(path.join("src/routes", f), "utf-8").includes("/new-feature")
          );
        },
      },
    ],
    postconditions: [
      // Structural postconditions
      {
        description: "New feature route exists",
        check: () => {
          const routeFiles = fs.readdirSync("src/routes");
          return routeFiles.some((f) =>
            fs.readFileSync(path.join("src/routes", f), "utf-8").includes("/new-feature")
          );
        },
      },
      {
        description: "Route imports NewFeatureService",
        check: () => {
          const routeFiles = fs.readdirSync("src/routes");
          return routeFiles.some((f) =>
            fs.readFileSync(path.join("src/routes", f), "utf-8").includes("NewFeatureService")
          );
        },
      },
      // TEST POSTCONDITIONS - REQUIRED for routes
      {
        description: "Integration tests exist for new-feature route",
        check: () => {
          return (
            fs.existsSync("src/__tests__/routes/new-feature.test.ts") ||
            fs.existsSync("tests/integration/new-feature.test.ts")
          );
        },
      },
      {
        description: "Route integration tests pass",
        check: () => {
          try {
            execSync("npm test -- --run new-feature", { stdio: "pipe", timeout: 60000 });
            return true;
          } catch {
            return false;
          }
        },
      },
    ],
    invariants: [
      {
        description: "Router pattern is preserved",
        check: () => {
          const routeFiles = fs.readdirSync("src/routes").filter((f) => f.endsWith(".ts"));
          if (routeFiles.length === 0) return false;

          const sampleRoute = fs.readFileSync(
            path.join("src/routes", routeFiles[0]),
            "utf-8"
          );
          return sampleRoute.includes("router.") || sampleRoute.includes("Router()");
        },
      },
    ],
  },

  // Example step 3: Update database schema
  {
    name: "Add new table/fields to database",
    description: "Store new feature data",
    preconditions: [
      {
        description: "Database ORM is configured",
        check: () => {
          return (
            fs.existsSync("prisma/schema.prisma") ||
            fs.existsSync("src/db/schema.ts") ||
            fs.existsSync("migrations")
          );
        },
      },
      {
        description: "New fields don't already exist",
        check: () => {
          if (fs.existsSync("prisma/schema.prisma")) {
            const schema = fs.readFileSync("prisma/schema.prisma", "utf-8");
            return !schema.includes("newFeatureField");
          }
          return true;
        },
      },
    ],
    postconditions: [
      {
        description: "New fields added to schema",
        check: () => {
          if (fs.existsSync("prisma/schema.prisma")) {
            const schema = fs.readFileSync("prisma/schema.prisma", "utf-8");
            return schema.includes("newFeatureField");
          }
          return true;
        },
      },
    ],
    invariants: [
      {
        description: "Migration infrastructure exists",
        check: () => {
          const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
          return (
            pkg.devDependencies?.prisma ||
            pkg.dependencies?.["@prisma/client"] ||
            pkg.scripts?.migrate
          );
        },
      },
    ],
  },

  // Example step 4: Final verification - ALL tests pass
  {
    name: "Final verification",
    description: "Ensure all tests pass and feature is complete",
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
        description: "NewFeatureService exists",
        check: () => fs.existsSync("src/services/NewFeatureService.ts"),
      },
    ],
    postconditions: [
      // Verify all component tests exist
      {
        description: "All component tests exist",
        check: () => {
          return (
            (fs.existsSync("src/__tests__/NewFeatureService.test.ts") ||
              fs.existsSync("src/services/__tests__/NewFeatureService.test.ts")) &&
            (fs.existsSync("src/__tests__/routes/new-feature.test.ts") ||
              fs.existsSync("tests/integration/new-feature.test.ts"))
          );
        },
      },
      // CRITICAL: All tests must pass
      {
        description: "ALL tests pass (no regressions)",
        check: () => {
          try {
            execSync("npm test -- --run", { stdio: "pipe", timeout: 120000 });
            return true;
          } catch {
            return false;
          }
        },
      },
    ],
    invariants: [
      {
        description: "Test framework is configured",
        check: () => {
          const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
          return (
            pkg.devDependencies?.vitest ||
            pkg.devDependencies?.jest ||
            pkg.scripts?.test
          );
        },
      },
    ],
  },

  // Add your own plan steps here...
  // {
  //   name: "Your implementation step",
  //   description: "What this step accomplishes",
  //   preconditions: [
  //     { description: "What must be true before", check: () => true },
  //   ],
  //   postconditions: [
  //     { description: "What must be true after", check: () => true },
  //   ],
  //   invariants: [
  //     { description: "What must stay true throughout", check: () => true },
  //   ],
  // },
];

/**
 * Helper function to check file contains a pattern
 */
function fileContains(filepath: string, pattern: string | RegExp): boolean {
  if (!fs.existsSync(filepath)) return false;

  const content = fs.readFileSync(filepath, "utf-8");
  if (typeof pattern === "string") {
    return content.includes(pattern);
  }
  return pattern.test(content);
}

/**
 * Helper function to check if a package is installed
 */
function hasPackage(packageName: string): boolean {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
  return !!(
    pkg.dependencies?.[packageName] ||
    pkg.devDependencies?.[packageName] ||
    pkg.peerDependencies?.[packageName]
  );
}

/**
 * Runner - executes checks based on phase and reports results
 */
function main() {
  // Parse phase from command line
  const phase = process.argv.includes("--phase=post") ? "post" : "pre";
  const phaseLabel = phase === "pre" ? "pre-implementation" : "post-implementation";

  console.log(`📋 Validating Implementation Plan (${phaseLabel})\n`);

  let allPassed = true;
  let passCount = 0;
  let failCount = 0;

  for (const step of plan) {
    // Select checks based on phase
    const checks =
      phase === "pre"
        ? [...step.preconditions, ...step.invariants]
        : [...step.postconditions, ...step.invariants];

    const results = checks.map((c) => ({
      ...c,
      passed: c.check(),
    }));

    const stepPassed = results.every((r) => r.passed);
    const status = stepPassed ? "✅ PASS" : "❌ FAIL";

    console.log(`${status} ${step.name}`);
    if (step.description) {
      console.log(`    ${step.description}`);
    }

    if (!stepPassed) {
      allPassed = false;
      failCount++;
      results
        .filter((r) => !r.passed)
        .forEach((r) => console.log(`    ❌ ${r.description}`));
    } else {
      passCount++;
      // Optionally show passing checks
      // results.forEach((r) => console.log(`    ✅ ${r.description}`));
    }
    console.log();
  }

  console.log(`${"=".repeat(60)}`);
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`${"=".repeat(60)}\n`);

  if (allPassed) {
    const message =
      phase === "pre"
        ? "All steps ready! You can proceed with implementation."
        : "Implementation complete! All postconditions satisfied.";
    console.log(`✅ ${message}`);
  } else {
    const message =
      phase === "pre"
        ? "Some preconditions failed. Resolve issues before implementing."
        : "Some postconditions failed. Implementation may be incomplete.";
    console.log(`❌ ${message}`);
  }

  process.exit(allPassed ? 0 : 1);
}

// Run if executed directly
if (require.main === module) {
  main();
}
