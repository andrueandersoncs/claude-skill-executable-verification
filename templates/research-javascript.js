/**
 * Research Phase - Executable Verification Template (JavaScript)
 *
 * This template uses file system operations and regex for JavaScript codebases.
 * For deeper analysis, consider using @babel/parser for AST parsing.
 *
 * Usage:
 * 1. Run: node research/assumptions.js
 */

const fs = require("fs");
const path = require("path");
const { glob } = require("glob");

/**
 * Recursively find all JavaScript files in a directory
 */
function findFiles(pattern) {
  return glob.sync(pattern, { ignore: ["**/node_modules/**", "**/dist/**"] });
}

/**
 * Read file content safely
 */
function readFile(filepath) {
  try {
    return fs.readFileSync(filepath, "utf-8");
  } catch (error) {
    console.error(`   Error reading ${filepath}: ${error.message}`);
    return null;
  }
}

/**
 * Define your research assumptions here.
 * Each assumption should prove something specific about your codebase.
 */
const assumptions = [
  // Example 1: Verify module pattern
  {
    claim: "All modules use ES6 import/export syntax",
    verify: () => {
      const files = findFiles("src/**/*.js");

      for (const file of files) {
        const content = readFile(file);
        if (!content) continue;

        // Skip if file is empty or only has comments
        const codeLines = content
          .split("\n")
          .filter((line) => !line.trim().startsWith("//") && line.trim() !== "");

        if (codeLines.length === 0) continue;

        // Check for CommonJS patterns
        if (content.includes("module.exports") || content.includes("require(")) {
          console.log(`   ❌ ${file} uses CommonJS instead of ES6 modules`);
          return false;
        }
      }
      return true;
    },
  },

  // Example 2: Verify error handling
  {
    claim: "Service functions return objects with success/error properties",
    verify: () => {
      const serviceFiles = findFiles("src/services/**/*.js");

      for (const file of serviceFiles) {
        const content = readFile(file);
        if (!content) continue;

        // Look for async function definitions
        const asyncFunctions = content.match(/async\s+function\s+\w+|async\s+\w+\s*\(/g);

        if (asyncFunctions) {
          // Check if there are return statements with success/error pattern
          const hasSuccessPattern = /return\s*{\s*success:\s*true/.test(content);
          const hasErrorPattern = /return\s*{\s*success:\s*false/.test(content);

          if (!hasSuccessPattern && !hasErrorPattern) {
            console.log(`   ❌ ${path.basename(file)} doesn't use success/error pattern`);
            return false;
          }
        }
      }
      return true;
    },
  },

  // Example 3: Verify naming conventions
  {
    claim: "Service files follow naming convention *Service.js",
    verify: () => {
      const serviceDir = "src/services";
      if (!fs.existsSync(serviceDir)) {
        console.log(`   ℹ️  No services directory found`);
        return true; // Skip if services don't exist
      }

      const files = fs.readdirSync(serviceDir).filter((f) => f.endsWith(".js"));

      for (const file of files) {
        if (file === "index.js") continue;

        if (!file.endsWith("Service.js")) {
          console.log(`   ❌ ${file} doesn't follow *Service.js convention`);
          return false;
        }
      }
      return true;
    },
  },

  // Example 4: Verify no direct database access
  {
    claim: "Only repository files import database libraries",
    verify: () => {
      const allFiles = findFiles("src/**/*.js");
      const repoFiles = findFiles("src/repositories/**/*.js");
      const repoFilePaths = new Set(repoFiles);

      for (const file of allFiles) {
        if (repoFilePaths.has(file)) continue;
        if (file.includes(".test.")) continue;

        const content = readFile(file);
        if (!content) continue;

        // Check for direct database imports
        const dbImports = [
          /import.*['"]pg['"]/,
          /import.*['"]mysql['"]/,
          /import.*['"]mongodb['"]/,
          /import.*['"]@prisma\/client['"]/,
        ];

        for (const pattern of dbImports) {
          if (pattern.test(content)) {
            console.log(`   ❌ ${path.basename(file)} has direct DB import`);
            return false;
          }
        }
      }
      return true;
    },
  },

  // Example 5: Verify configuration structure
  {
    claim: "Config file exports environment-specific settings",
    verify: () => {
      const configPaths = ["src/config/index.js", "src/config.js", "config/index.js"];

      let configFile = null;
      for (const configPath of configPaths) {
        if (fs.existsSync(configPath)) {
          configFile = configPath;
          break;
        }
      }

      if (!configFile) {
        console.log(`   ❌ No config file found in expected locations`);
        return false;
      }

      const content = readFile(configFile);
      if (!content) return false;

      // Check for environment-based config
      const hasEnvCheck =
        content.includes("process.env.NODE_ENV") || content.includes("NODE_ENV");

      if (!hasEnvCheck) {
        console.log(`   ❌ Config doesn't use NODE_ENV for environment-specific settings`);
        return false;
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

module.exports = { assumptions };
