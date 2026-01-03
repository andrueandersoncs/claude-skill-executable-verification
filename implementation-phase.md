# Implementation Phase: Standard Testing

By the implementation phase, the deep verification work is done. Now it's just normal software development with tests.

## Core Principle

**Write code, write tests, verify it works.**

Research proved how the codebase works. Planning verified integration points are ready. Now just implement and test.

## What to Verify

Standard software testing:

1. **Unit Tests**
   - Individual functions work correctly
   - Edge cases are handled
   - Error conditions are caught

2. **Integration Tests**
   - Components work together
   - External services integrate properly
   - Database operations succeed

3. **End-to-End Tests** (if appropriate)
   - Full user workflows work
   - UI interactions succeed
   - Data flows through the system

## Verification Depth: Standard

Implementation verification is **normal testing**:

```typescript
import { describe, it, expect } from "vitest";
import { OAuthService } from "../src/services/OAuthService";

describe("OAuthService", () => {
  it("exchanges authorization code for access token", async () => {
    const service = new OAuthService();
    const result = await service.authenticate("google", "auth-code-123");

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.token).toBeDefined();
  });

  it("rejects invalid provider", async () => {
    const service = new OAuthService();
    const result = await service.authenticate("invalid-provider", "code");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid provider");
  });
});
```

## Testing Strategy

Follow the project's existing testing conventions (discovered during research):

### Test Organization

Structure tests to match your codebase:

```
src/
  services/
    OAuthService.ts
  __tests__/
    OAuthService.test.ts

# or

test/
  unit/
    services/
      OAuthService.test.ts
  integration/
    auth/
      oauth-flow.test.ts
```

### Test Coverage

Aim for meaningful coverage:

- ✅ **Do test**: Core logic, error handling, edge cases
- ❌ **Don't test**: Simple getters/setters, trivial code, framework internals

```typescript
// ✅ Good - tests business logic
it("refreshes expired OAuth token automatically", async () => {
  const service = new OAuthService();
  const expiredToken = createExpiredToken();

  const result = await service.getUserData(expiredToken);

  expect(result.success).toBe(true);
  expect(mockTokenRefresh).toHaveBeenCalled();
});

// ❌ Not useful - testing trivial code
it("getter returns private field", () => {
  const service = new OAuthService();
  expect(service.getProvider()).toBe(service.provider);
});
```

## Common Test Patterns

### 1. Unit Tests

Test individual functions in isolation:

```typescript
import { describe, it, expect } from "vitest";
import { validateOAuthCallback } from "../src/utils/oauth";

describe("validateOAuthCallback", () => {
  it("accepts valid callback with code", () => {
    const result = validateOAuthCallback({
      code: "auth-code-123",
      state: "state-token",
    });

    expect(result.valid).toBe(true);
  });

  it("rejects callback without code", () => {
    const result = validateOAuthCallback({
      state: "state-token",
    });

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Missing authorization code");
  });

  it("rejects callback with error parameter", () => {
    const result = validateOAuthCallback({
      error: "access_denied",
      error_description: "User denied access",
    });

    expect(result.valid).toBe(false);
    expect(result.error).toBe("User denied access");
  });
});
```

### 2. Integration Tests

Test components working together:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { database } from "../src/database";

describe("OAuth Flow Integration", () => {
  beforeEach(async () => {
    await database.migrate.latest();
  });

  afterEach(async () => {
    await database.migrate.rollback();
  });

  it("completes full OAuth flow and creates user", async () => {
    // 1. Initiate OAuth
    const initResponse = await request(app).get("/auth/oauth/google");

    expect(initResponse.status).toBe(302);
    const redirectUrl = new URL(initResponse.headers.location);
    expect(redirectUrl.hostname).toBe("accounts.google.com");

    // 2. Simulate callback
    const callbackResponse = await request(app)
      .get("/auth/oauth/google/callback")
      .query({
        code: "mock-auth-code",
        state: redirectUrl.searchParams.get("state"),
      });

    expect(callbackResponse.status).toBe(302);
    expect(callbackResponse.headers.location).toBe("/dashboard");

    // 3. Verify user was created
    const users = await database("users").where({ oauthProvider: "google" });
    expect(users).toHaveLength(1);
    expect(users[0].email).toBeDefined();
  });

  it("links OAuth account to existing user by email", async () => {
    // Create existing user
    await database("users").insert({
      email: "user@example.com",
      password: "hashed-password",
    });

    // OAuth login with same email
    const response = await request(app)
      .get("/auth/oauth/google/callback")
      .query({ code: "mock-code" });

    expect(response.status).toBe(302);

    // Verify account was linked, not duplicated
    const users = await database("users").where({ email: "user@example.com" });
    expect(users).toHaveLength(1);
    expect(users[0].oauthProvider).toBe("google");
  });
});
```

### 3. Mocking External Services

Don't call real OAuth providers in tests:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OAuthService } from "../src/services/OAuthService";
import * as oauthClient from "../src/clients/oauth-client";

// Mock the OAuth client
vi.mock("../src/clients/oauth-client");

describe("OAuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exchanges code for token via OAuth provider", async () => {
    // Setup mock
    vi.spyOn(oauthClient, "exchangeCode").mockResolvedValue({
      access_token: "mock-token",
      refresh_token: "mock-refresh",
      expires_in: 3600,
    });

    vi.spyOn(oauthClient, "getUserInfo").mockResolvedValue({
      id: "google-user-123",
      email: "user@example.com",
      name: "Test User",
    });

    // Test
    const service = new OAuthService();
    const result = await service.authenticate("google", "auth-code");

    // Verify
    expect(result.success).toBe(true);
    expect(result.user.email).toBe("user@example.com");
    expect(oauthClient.exchangeCode).toHaveBeenCalledWith("google", "auth-code");
  });
});
```

### 4. Error Handling Tests

Verify errors are handled gracefully:

```typescript
describe("Error Handling", () => {
  it("handles network errors during token exchange", async () => {
    vi.spyOn(oauthClient, "exchangeCode").mockRejectedValue(
      new Error("Network error")
    );

    const service = new OAuthService();
    const result = await service.authenticate("google", "code");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Failed to connect to OAuth provider");
  });

  it("handles invalid OAuth response", async () => {
    vi.spyOn(oauthClient, "exchangeCode").mockResolvedValue({
      // Missing required fields
      access_token: "token",
    });

    const service = new OAuthService();
    const result = await service.authenticate("google", "code");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid OAuth response");
  });
});
```

## Test Configuration

### TypeScript/JavaScript (Vitest)

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    },
  },
});
```

### TypeScript/JavaScript (Jest)

```javascript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/**/*.test.ts"],
};
```

### Python (pytest)

```python
# pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

## Running Tests

Add test scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

Or for Python:

```bash
pytest
pytest --cov=src
pytest --cov=src --cov-report=html
```

## Test-Driven Implementation

Consider writing tests before implementation:

1. **Write failing test** (defines expected behavior)
2. **Implement minimal code** to make it pass
3. **Refactor** if needed
4. **Repeat** for next piece of functionality

```typescript
// 1. Write test first
describe("OAuthService.authenticate", () => {
  it("returns user data on success", async () => {
    const service = new OAuthService();
    const result = await service.authenticate("google", "code");

    expect(result.success).toBe(true);
    expect(result.user).toHaveProperty("email");
  });
});

// 2. Run test (it fails - authenticate doesn't exist)

// 3. Implement minimal code
class OAuthService {
  async authenticate(provider: string, code: string) {
    return {
      success: true,
      user: { email: "test@example.com" },
    };
  }
}

// 4. Run test (it passes)

// 5. Add more tests for edge cases, refactor implementation
```

## When Tests Should Fail

Tests should fail when:

1. **Code has bugs** - Fix the code
2. **Requirements changed** - Update the test
3. **Test is wrong** - Fix the test

Tests should NOT be skipped or removed just because they fail.

## Continuous Integration

Ensure tests run in CI:

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - run: npm install
      - run: npm test
      - run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Definition of Done

A feature is complete when:

1. ✅ All planned functionality is implemented
2. ✅ All tests pass
3. ✅ Code follows project conventions (from research)
4. ✅ No regressions (existing tests still pass)
5. ✅ Edge cases are tested
6. ✅ Error handling is tested

## Pro Tips

1. **Test behavior, not implementation**
   ```typescript
   // ❌ Bad - tests internal implementation
   it("calls helper function three times", () => {
     expect(helperSpy).toHaveBeenCalledTimes(3);
   });

   // ✅ Good - tests observable behavior
   it("processes all items in batch", () => {
     const result = processBatch([1, 2, 3]);
     expect(result).toHaveLength(3);
     expect(result.every(r => r.processed)).toBe(true);
   });
   ```

2. **Use descriptive test names**
   ```typescript
   // ❌ Bad
   it("test1", () => { ... });
   it("works", () => { ... });

   // ✅ Good
   it("rejects expired OAuth tokens", () => { ... });
   it("links OAuth account to existing user by email", () => { ... });
   ```

3. **Avoid test interdependence**
   - Each test should be independent
   - Tests should work in any order
   - Use `beforeEach` for common setup

4. **Keep tests readable**
   ```typescript
   // Use helper functions for common patterns
   function createMockUser(overrides = {}) {
     return {
       id: "123",
       email: "test@example.com",
       ...overrides,
     };
   }

   it("updates user profile", () => {
     const user = createMockUser({ name: "Old Name" });
     const updated = updateProfile(user, { name: "New Name" });
     expect(updated.name).toBe("New Name");
   });
   ```

5. **Test edge cases**
   - Empty inputs
   - Null/undefined values
   - Very large inputs
   - Concurrent access
   - Network failures
   - Invalid data

## Relationship to Research and Planning

Implementation tests verify that:
- Research assumptions held true (architecture works as verified)
- Planning preconditions were correct (integration points worked)
- New code fits the existing patterns (conventions from research)

If tests are failing in unexpected ways, it might mean:
- Research missed something (re-verify assumptions)
- Planning was incorrect (re-check preconditions)
- Implementation has bugs (fix the code)

---

With research and planning verification complete, implementation testing is straightforward - just confirm the code does what it's supposed to do.
