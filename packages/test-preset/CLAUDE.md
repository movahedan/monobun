# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the test-preset package.

## Package Overview

**@repo/test-preset** provides shared testing configurations, utilities, and mocks for consistent testing across all packages and applications in the monorepo.

## Essential Commands

This is a configuration package - tests are run from consuming packages:
```bash
# In consuming packages
bun test  # Uses this preset automatically
```

## Available Exports

### Main Test Setup
```typescript
import '@repo/test-preset'; // Main test setup and global configuration
```

### Specific Testing Utilities
```typescript
import '@repo/test-preset/mock-modules'; // Module mocking utilities
import '@repo/test-preset/mock-bun'; // Bun runtime mocking
import '@repo/test-preset/testing-library'; // React Testing Library setup
import '@repo/test-preset/happydom'; // HappyDOM browser environment
```

### Debugging Tools
```bash
# Test isolation debugging tool
bun run @repo/test-preset/test-by-folder [path]
bun run @repo/test-preset/test-by-folder src/entities/
```

## Testing Stack

### Core Testing Framework
- **Bun Test Runner** - Fast, native test runner
- **HappyDOM** - Lightweight DOM implementation
- **Testing Library** - React component testing utilities

### Available Tools
- **@testing-library/react** `16.3.0` - React component testing
- **@testing-library/dom** `10.4.1` - DOM testing utilities  
- **@testing-library/jest-dom** `6.6.4` - Additional DOM matchers
- **@happy-dom/global-registrator** `18.0.1` - Browser environment

## Usage Patterns

### Basic Component Testing
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'bun:test';
import { Button } from './button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick handler', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Entity/Utility Testing
```typescript
import { describe, it, expect } from 'bun:test';
import { cn } from '@repo/utils/cn';

describe('cn utility', () => {
  it('merges classes correctly', () => {
    const result = cn('px-4 py-2', 'bg-blue-500');
    expect(result).toBe('px-4 py-2 bg-blue-500');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', { 'active-class': isActive });
    expect(result).toBe('base-class active-class');
  });
});
```

### Async Testing
```typescript
import { describe, it, expect } from 'bun:test';
import { EntityCommit } from '@repo/intershell/entities';

describe('EntityCommit', () => {
  it('validates commit messages correctly', async () => {
    const validCommit = 'feat: add new feature';
    const result = await EntityCommit.validateCommit(validCommit);
    
    expect(result.isValid).toBe(true);
    expect(result.type).toBe('feat');
  });

  it('handles invalid commit formats', async () => {
    const invalidCommit = 'invalid commit message';
    const result = await EntityCommit.validateCommit(invalidCommit);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid commit format');
  });
});
```

### Mocking External Dependencies
```typescript
import { describe, it, expect, mock } from 'bun:test';
import '@repo/test-preset/mock-modules';

// Mock external modules
const mockFetch = mock(() => Promise.resolve({
  json: () => Promise.resolve({ data: 'test' })
}));

global.fetch = mockFetch;

describe('API Service', () => {
  it('fetches data correctly', async () => {
    const result = await apiService.fetchData();
    expect(mockFetch).toHaveBeenCalled();
    expect(result).toEqual({ data: 'test' });
  });
});
```

## Configuration Structure

### Test Setup Files
- **test-setup.ts** - Main test configuration and global setup
- **testing-library.ts** - React Testing Library configuration
- **happydom.ts** - Browser environment setup
- **mock-modules.ts** - Module mocking utilities
- **mock-bun.ts** - Bun-specific mocking utilities

### Global Test Configuration
The test preset automatically configures:
- DOM environment with HappyDOM
- Testing Library matchers
- Common mocks and utilities
- TypeScript support for tests

## Debugging Tools

### Test Isolation Debugging

The `test-by-folder.ts` script helps identify cross-test interference issues:

```bash
# Run tests by folder to check for isolation issues
bun run @repo/test-preset/test-by-folder

# Test specific path
bun run @repo/test-preset/test-by-folder src/entities/

# Test specific package
bun run @repo/test-preset/test-by-folder packages/intershell/src/entities/
```

**What it does:**
- Runs each test folder individually
- Identifies which folders pass in isolation but fail when run together
- Provides clear output showing the isolation pattern
- Helps pinpoint the source of cross-test interference

**When to use:**
- When tests pass individually but fail when run together
- When debugging mock state interference
- When investigating test isolation issues
- When adding new test files that might interfere with existing ones

**Example output:**
```
🔍 Running tests by folder to check for isolation issues in src/entities/...

📁 Testing src/entities/affected/...
✅ src/entities/affected/ - PASSED

📁 Testing src/entities/packages/...
❌ src/entities/packages/ - FAILED

📊 SUMMARY:
==================================================
✅ Passed: 7
❌ Failed: 1
📁 Total: 8

💡 If individual folders pass but 'bun test' fails,
   this indicates cross-test interference (global mock state issues).
```

## Best Practices

### Test Organization
```typescript
describe('ComponentName', () => {
  describe('when prop is provided', () => {
    it('should render correctly', () => {
      // Test implementation
    });
  });

  describe('when prop is not provided', () => {
    it('should use default behavior', () => {
      // Test implementation
    });
  });
});
```

### Test Naming
- Use descriptive test names that explain the expected behavior
- Follow the pattern: "should [expected behavior] when [condition]"
- Group related tests with `describe` blocks

### Mocking Guidelines
```typescript
// ✅ Good - Mock at the module level
mock.module('./api-service', () => ({
  fetchData: mock(() => Promise.resolve({ data: 'test' }))
}));

// ✅ Good - Reset mocks between tests
afterEach(() => {
  mock.clearAll();
});
```

### Async Testing
```typescript
// ✅ Good - Use proper async/await
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});

// ✅ Good - Test error handling
it('should handle errors gracefully', async () => {
  await expect(failingFunction()).rejects.toThrow('Expected error message');
});
```

## Package Integration

### Consuming in Packages
Add to your test configuration:

```json
// In package.json
{
  "devDependencies": {
    "@repo/test-preset": "workspace:*"
  }
}
```

### Bun Test Configuration
```json
// In bunfig.toml or package.json
{
  "test": {
    "preload": ["@repo/test-preset"]
  }
}
```

## Development Guidelines

When extending the test preset:

1. **Add utilities that benefit multiple packages** - Avoid package-specific helpers
2. **Maintain backwards compatibility** - Changes affect all packages
3. **Document new utilities** - Update this guide with examples
4. **Test the preset itself** - Ensure configurations work correctly
5. **Consider performance** - Test setup affects all test runs

This preset ensures consistent, reliable testing across the entire monorepo while providing the tools needed for comprehensive test coverage.