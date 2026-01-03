/**
 * Research Phase - Executable Verification Template (TypeScript)
 *
 * This template uses ts-morph for deep AST analysis of TypeScript codebases.
 *
 * Usage:
 * 1. Install dependencies: npm install ts-morph
 * 2. Customize the assumptions array below
 * 3. Run: npx tsx research/assumptions.ts
 */

import { Project, SyntaxKind } from "ts-morph";
import * as fs from "fs";
import * as path from "path";

// Initialize the TypeScript project
const project = new Project({
  tsConfigFilePath: "./tsconfig.json",
  // If you don't have a tsconfig.json, you can add files manually:
  // skipAddingFilesFromTsConfig: true,
});

// If not using tsconfig, add source files manually:
// project.addSourceFilesAtPaths("src/**/*.ts");

interface Assumption {
  claim: string;
  verify: () => Promise<boolean> | boolean;
}

/**
 * Define your research assumptions here.
 * Each assumption should prove something specific about your codebase.
 */
export const assumptions: Assumption[] = [
  // Example 1: Verify architectural pattern
  {
    claim: "Services use dependency injection via constructor",
    verify: () => {
      const serviceFiles = project.getSourceFiles("**/services/**/*.ts");

      for (const file of serviceFiles) {
        for (const cls of file.getClasses()) {
          const constructor = cls.getConstructors()[0];
          if (!constructor) continue;

          const params = constructor.getParameters();
          const hasInjection = params.some((p) => {
            const type = p.getType().getText();
            return (
              type.includes("Repository") ||
              type.includes("Service") ||
              type.includes("Client")
            );
          });

          if (cls.getMethods().length > 0 && !hasInjection) {
            console.log(`   ❌ ${file.getFilePath()} - ${cls.getName()} has no DI`);
            return false;
          }
        }
      }
      return true;
    },
  },

  // Example 2: Verify error handling pattern
  {
    claim: "Service methods return Result type instead of throwing exceptions",
    verify: () => {
      const serviceFiles = project.getSourceFiles("**/services/**/*.ts");

      for (const file of serviceFiles) {
        for (const cls of file.getClasses()) {
          for (const method of cls.getMethods()) {
            if (method.getName().startsWith("_")) continue; // Skip private methods

            const returnType = method.getReturnType().getText();

            // Check if return type is a discriminated union (Result pattern)
            if (
              method.isAsync() &&
              !returnType.includes("Promise<void>") &&
              !returnType.includes("|") &&
              !returnType.includes("Result")
            ) {
              console.log(
                `   ❌ ${file.getBaseName()}:${method.getName()} returns ${returnType}`
              );
              return false;
            }
          }
        }
      }
      return true;
    },
  },

  // Example 3: Verify no direct database access outside repositories
  {
    claim: "All database queries go through Repository layer",
    verify: () => {
      const allFiles = project.getSourceFiles("src/**/*.ts");
      const repoFiles = project.getSourceFiles("**/repositories/**/*.ts");
      const repoFilePaths = new Set(repoFiles.map((f) => f.getFilePath()));

      for (const file of allFiles) {
        // Skip repository files themselves and test files
        if (repoFilePaths.has(file.getFilePath())) continue;
        if (file.getFilePath().includes(".test.")) continue;
        if (file.getFilePath().includes(".spec.")) continue;

        const imports = file.getImportDeclarations();
        for (const imp of imports) {
          const mod = imp.getModuleSpecifierValue();
          // Check for direct database library imports
          if (
            mod.includes("prisma") ||
            mod.includes("pg") ||
            mod.includes("mysql") ||
            mod.includes("mongodb")
          ) {
            console.log(`   ❌ Direct DB import in ${file.getBaseName()}`);
            return false;
          }
        }
      }
      return true;
    },
  },

  // Example 4: Verify file structure convention
  {
    claim: "Service files follow naming convention *Service.ts",
    verify: () => {
      const serviceFiles = project.getSourceFiles("**/services/**/*.ts");

      for (const file of serviceFiles) {
        const basename = path.basename(file.getFilePath());

        // Skip index files and test files
        if (basename === "index.ts") continue;
        if (basename.includes(".test.")) continue;
        if (basename.includes(".spec.")) continue;

        if (!basename.endsWith("Service.ts")) {
          console.log(`   ❌ ${basename} doesn't follow *Service.ts convention`);
          return false;
        }
      }
      return true;
    },
  },

  // Example 5: Verify interface/implementation pattern
  {
    claim: "All repositories implement an interface",
    verify: () => {
      const repoFiles = project.getSourceFiles("**/repositories/**/*.ts");

      for (const file of repoFiles) {
        if (file.getBaseName() === "index.ts") continue;

        for (const cls of file.getClasses()) {
          const implements = cls.getImplements();

          if (implements.length === 0) {
            console.log(
              `   ❌ ${file.getBaseName()}:${cls.getName()} doesn't implement an interface`
            );
            return false;
          }
        }
      }
      return true;
    },
  },

  // Add your own assumptions here...
  // {
  //   claim: "Your assumption about the codebase",
  //   verify: () => {
  //     // Your verification logic
  //     return true;
  //   },
  // },
];

/**
 * Runner - executes all assumptions and reports results
 */
async function main() {
  console.log("🔍 Verifying Research Assumptions\n");

  let allPassed = true;
  let passCount = 0;
  let failCount = 0;

  for (const assumption of assumptions) {
    try {
      const result = await assumption.verify();

      if (result) {
        console.log(`✅ ${assumption.claim}`);
        passCount++;
      } else {
        console.log(`❌ ${assumption.claim}`);
        failCount++;
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ ${assumption.claim}`);
      console.log(`   Error: ${error.message}`);
      if (error.stack) {
        console.log(`   ${error.stack.split("\n").slice(1, 3).join("\n   ")}`);
      }
      failCount++;
      allPassed = false;
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`${"=".repeat(60)}\n`);

  if (allPassed) {
    console.log("✅ All assumptions verified! Ready to proceed to planning.");
  } else {
    console.log("❌ Some assumptions failed. Fix them before proceeding.");
  }

  process.exit(allPassed ? 0 : 1);
}

// Run if executed directly
if (require.main === module) {
  main();
}
