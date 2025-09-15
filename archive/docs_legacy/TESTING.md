<!-- ARCHIVED: moved from repo root on 2025-09-15 for cleanliness -->
# Testing Documentation

## Overview

This document describes the testing strategy, tools, and procedures for the Persian Legal AI system.

## Testing Strategy

### Testing Pyramid

```
        /\
       /E2E\      (5%) - Critical user journeys
      /------\
     /Integration\ (20%) - API & service integration
    /------------\
   / Unit Tests   \ (75%) - Business logic & utilities
  /________________\
```

### Coverage Requirements

- **Overall**: 70% minimum
- **Branches**: 70% minimum
- **Functions**: 70% minimum
- **Lines**: 70% minimum
- **Statements**: 70% minimum

## Test Types

### 1. Unit Tests

**Location**: `tests/unit/`, `server/tests/`

**Framework**: Vitest

**Run Command**: `npm test`

**Coverage**: 
- Controllers
- Services
- Utilities
- Validators
- Security modules

**Example**:
```typescript
import { describe, it, expect } from 'vitest';
import { validatePassword } from '../utils/validators';

describe('Password Validator', () => {
  it('should accept strong passwords', () => {
    const result = validatePassword('StrongP@ss123');
    expect(result).toBe(true);
  });
  
  it('should reject weak passwords', () => {
    const result = validatePassword('weak');
    expect(result).toBe(false);
  });
});
```

### 2. Integration Tests

**Location**: `tests/integration/`

**Framework**: Vitest + Supertest

**Run Command**: `npm run test:integration`

**Coverage**:
- API endpoints
- Database operations
- Authentication flow
- WebSocket connections

**Example**:
```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server';

describe('API Integration', () => {
  it('should authenticate user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test', password: 'test123' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

### 3. End-to-End Tests

**Location**: `tests/e2e/`

**Framework**: Playwright

**Run Command**: `npm run test:e2e`

**Coverage**:
- User authentication
- Dashboard navigation
- Model training workflow
- Dataset management

**Example**:
```typescript
import { test, expect } from '@playwright/test';

test('user can login and access dashboard', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator('.dashboard-header')).toBeVisible();
});
```

### 4. Performance Tests

**Location**: `tests/performance/`

**Framework**: K6 / Artillery

**Run Command**: `npm run test:performance`

**Scenarios**:
- Load testing (normal traffic)
- Stress testing (peak traffic)
- Spike testing (sudden bursts)
- Soak testing (extended duration)

**Example K6 Script**:
```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
  },
};

export default function() {
  let response = http.get('http://localhost:3001/api/models');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

### 5. Security Tests

**Location**: `tests/security/`

**Tools**: OWASP ZAP, npm audit

**Run Command**: `npm run test:security`

**Coverage**:
- SQL injection
- XSS attacks
- CSRF protection
- Authentication bypass
- Rate limiting

## Test Data Management

### Fixtures

**Location**: `tests/fixtures/`

```typescript
// tests/fixtures/users.ts
export const testUsers = {
  admin: {
    username: 'admin',
    password: 'Admin123!',
    role: 'admin'
  },
  trainer: {
    username: 'trainer',
    password: 'Trainer123!',
    role: 'trainer'
  },
  viewer: {
    username: 'viewer',
    password: 'Viewer123!',
    role: 'viewer'
  }
};
```

### Test Database

```bash
# Create test database
cp persian_legal_ai.db test.db

# Set test environment
export NODE_ENV=test
export DATABASE_PATH=./test.db

# Run tests
npm test

# Clean up
rm test.db
```

### Mock Data

```typescript
// tests/mocks/datasets.ts
export const mockDatasets = [
  {
    id: 'test-dataset-1',
    name: 'Test Legal Corpus',
    samples: 1000,
    status: 'available'
  },
  // ...
];
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

### Pre-commit Hooks

```json
// .husky/pre-commit
#!/bin/sh
npm run lint
npm run type-check
npm test -- --run --changed
```

## Test Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test auth.test.ts

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e -- --ui

# Run performance tests
npm run test:performance

# Run security tests
npm run test:security

# Generate coverage report
npm run test:coverage -- --reporter=html
```

## Test Reports

### Coverage Reports

**Location**: `coverage/`

**Formats**:
- HTML: `coverage/index.html`
- LCOV: `coverage/lcov.info`
- JSON: `coverage/coverage-final.json`

### E2E Reports

**Location**: `playwright-report/`

**View Report**: `npx playwright show-report`

### Performance Reports

**Location**: `performance-reports/`

**Formats**:
- HTML dashboard
- JSON metrics
- CSV data

## Debugging Tests

### VSCode Configuration

```json
// .vscode/launch.json
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["test", "--", "--inspect-brk"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Debug Commands

```bash
# Debug specific test
node --inspect-brk ./node_modules/.bin/vitest auth.test.ts

# Debug E2E test
PWDEBUG=1 npm run test:e2e

# Debug with verbose output
DEBUG=* npm test
```

## Best Practices

### Test Structure

```typescript
describe('Feature/Component', () => {
  // Setup
  beforeEach(() => {
    // Arrange
  });
  
  // Teardown
  afterEach(() => {
    // Cleanup
  });
  
  describe('Scenario', () => {
    it('should behave correctly', () => {
      // Arrange
      const input = prepareInput();
      
      // Act
      const result = performAction(input);
      
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### Naming Conventions

- Test files: `*.test.ts` or `*.spec.ts`
- Test suites: Descriptive feature/component name
- Test cases: Start with "should"
- Mock files: `*.mock.ts`
- Fixture files: `*.fixture.ts`

### Test Isolation

- Each test should be independent
- Use `beforeEach`/`afterEach` for setup/teardown
- Mock external dependencies
- Use test database for integration tests
- Clean up after tests

### Assertions

```typescript
// Be specific
expect(user.role).toBe('admin'); // ✓
expect(user).toBeDefined();      // ✗

// Use appropriate matchers
expect(array).toHaveLength(3);   // ✓
expect(array.length).toBe(3);    // ✗

// Test edge cases
expect(() => divide(1, 0)).toThrow(); // ✓
```

## Troubleshooting

### Common Issues

#### Tests Timing Out

```bash
# Increase timeout
vitest --test-timeout=10000

# Or in test
it('slow test', async () => {
  // test code
}, 10000);
```

#### Database Lock Issues

```bash
# Use in-memory database for tests
const db = new Database(':memory:');

# Or use separate test database
const db = new Database('test.db');
```

#### Flaky E2E Tests

```typescript
// Add proper waits
await page.waitForSelector('.element');
await page.waitForLoadState('networkidle');

// Retry flaky tests
test.describe('flaky feature', () => {
  test.use({ retries: 3 });
  // tests
});
```

## Test Checklist

### Before Commit
- [ ] All tests pass locally
- [ ] Coverage meets requirements
- [ ] No console.log in tests
- [ ] Tests are not skipped (.skip)
- [ ] Mock data is cleaned up

### Before Release
- [ ] Full test suite passes
- [ ] E2E tests on staging
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Cross-browser testing done

---

*Last Updated: [Current Date]*
*Version: 1.0.0*