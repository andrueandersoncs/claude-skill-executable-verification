/**
 * Planning Phase - Precondition Checks Template
 *
 * This template provides a structure for verifying that integration points
 * are ready before implementing each step.
 *
 * Usage:
 * 1. Customize the plan array below
 * 2. Run: npx tsx planning/preconditions.ts
 */

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

/**
 * Define your implementation plan here.
 * Each step should have preconditions that verify readiness.
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
      {
        description: "Related services exist for reference",
        check: () => {
          return (
            fs.existsSync("src/services/ExampleService.ts") ||
            fs.readdirSync("src/services").some((f) => f.endsWith("Service.ts"))
          );
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
        description: "Router pattern is established",
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
  },

  // Example step 4: Add tests
  {
    name: "Write tests for new feature",
    description: "Ensure new feature works correctly",
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
      {
        description: "NewFeatureService exists to test",
        check: () => fs.existsSync("src/services/NewFeatureService.ts"),
      },
    ],
  },

  // Add your own plan steps here...
  // {
  //   name: "Your implementation step",
  //   description: "What this step accomplishes",
  //   preconditions: [
  //     {
  //       description: "Precondition that must be true",
  //       check: () => {
  //         // Your check logic
  //         return true;
  //       },
  //     },
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
 * Runner - executes all precondition checks and reports results
 */
function main() {
  console.log("📋 Validating Implementation Plan\n");

  let allReady = true;
  let readyCount = 0;
  let blockedCount = 0;

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
      blockedCount++;
      results
        .filter((r) => !r.passed)
        .forEach((r) => console.log(`    ❌ ${r.description}`));
    } else {
      readyCount++;
      // Optionally show passing preconditions
      // results.forEach((r) => console.log(`    ✅ ${r.description}`));
    }
    console.log();
  }

  console.log(`${"=".repeat(60)}`);
  console.log(`✅ Ready: ${readyCount}`);
  console.log(`❌ Blocked: ${blockedCount}`);
  console.log(`${"=".repeat(60)}\n`);

  if (allReady) {
    console.log("✅ All steps ready! You can proceed with implementation.");
  } else {
    console.log("❌ Some steps are blocked. Resolve issues before implementing.");
  }

  process.exit(allReady ? 0 : 1);
}

// Run if executed directly
if (require.main === module) {
  main();
}
