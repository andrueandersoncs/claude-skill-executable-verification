#!/usr/bin/env bun
// Example: Verify API behavior
// Copy and adapt for your project
// Run with: bun example-api-check.ts

const API_BASE = process.env.API_URL || "http://localhost:3000";
const ENDPOINT = "/api/users";

console.log(`Checking: ${API_BASE}${ENDPOINT}`);

try {
  const response = await fetch(`${API_BASE}${ENDPOINT}`);

  if (!response.ok) {
    console.log(`FAIL: API returned status ${response.status}`);
    process.exit(1);
  }

  const data = await response.json();

  // Check response shape
  if (!Array.isArray(data)) {
    console.log("FAIL: Expected array response");
    console.log("Got:", typeof data);
    process.exit(1);
  }

  // Check first item has expected fields (if not empty)
  if (data.length > 0) {
    const requiredFields = ["id", "email"];
    const firstItem = data[0];
    const missingFields = requiredFields.filter((f) => !(f in firstItem));

    if (missingFields.length > 0) {
      console.log("FAIL: Missing fields:", missingFields.join(", "));
      console.log("Got fields:", Object.keys(firstItem).join(", "));
      process.exit(1);
    }
  }

  console.log(`PASS: API returns array with ${data.length} items`);
  if (data.length > 0) {
    console.log("Sample item keys:", Object.keys(data[0]).join(", "));
  }
} catch (error) {
  console.log("FAIL: Could not reach API");
  console.log("Error:", error instanceof Error ? error.message : error);
  console.log("");
  console.log("Make sure the API is running at", API_BASE);
  process.exit(1);
}
