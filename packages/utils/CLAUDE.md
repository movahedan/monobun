# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the utils package.

## Package Overview

**@repo/utils** provides essential utility functions used across the monorepo, specifically for CSS class manipulation and logging functionality.

## Essential Commands

### Development
- `bun run check:types` - Run TypeScript type checking
- `bun test` - Run utility function tests

### Exports

The package provides two main utilities:

```typescript
// CSS class utility for Tailwind CSS
import { cn } from '@repo/utils/cn';

// Logging utility
import { logger } from '@repo/utils/logger';
```

## Available Utilities

### `cn` - CSS Class Utility

A utility function that combines `clsx` and `tailwind-merge` for optimal Tailwind CSS class handling:

```typescript
import { cn } from '@repo/utils/cn';

// Combines classes and resolves Tailwind conflicts
const className = cn(
  'px-4 py-2 bg-blue-500', // base classes
  'bg-red-500', // this will override bg-blue-500
  condition && 'hover:bg-red-600', // conditional classes
  { 'opacity-50': disabled } // object syntax
);
```

**Key Features:**
- Merges classes intelligently using `clsx`
- Resolves Tailwind CSS conflicts using `tailwind-merge`
- Handles conditional classes
- TypeScript support with proper typing

### `logger` - Logging Utility

A structured logging utility for consistent logging across the monorepo:

```typescript
import { logger } from '@repo/utils/logger';

// Usage examples
logger.info('Application started');
logger.error('An error occurred', error);
logger.warn('Warning message');
logger.debug('Debug information');
```

## Usage in Components

### React Components
```typescript
import { cn } from '@repo/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const Button = ({ className, variant = 'primary', size = 'md', ...props }) => {
  return (
    <button
      className={cn(
        'font-medium rounded-lg transition-colors', className
      )}
      {...props}
    />
  );
};
```

### Server-side Usage
```typescript
import { logger } from '@repo/utils/logger';

export async function apiHandler(req: Request) {
  try {
    logger.info('API request received', { path: req.url });
    
    const result = await processRequest(req);
    
    logger.info('API request completed', { 
      path: req.url, 
      status: 'success' 
    });
    
    return result;
  } catch (error) {
    logger.error('API request failed', {
      path: req.url,
      error: error.message
    });
    throw error;
  }
}
```

## Development Guidelines

### Adding New Utilities

1. **Create the utility function** in `src/[utility-name].ts`
2. **Write comprehensive tests** in `src/[utility-name].test.ts`
3. **Add export** to `package.json` exports field
4. **Update TypeScript types** if needed
5. **Document usage** in this file

### Testing Pattern
```typescript
import { describe, it, expect } from 'bun:test';
import { cn } from './cn';

describe('cn utility', () => {
  it('should merge classes correctly', () => {
    const result = cn('px-4 py-2', 'bg-blue-500');
    expect(result).toBe('px-4 py-2 bg-blue-500');
  });

  it('should handle Tailwind conflicts', () => {
    const result = cn('bg-blue-500', 'bg-red-500');
    expect(result).toBe('bg-red-500');
  });
});
```

## Dependencies

- **clsx** - Conditional class names utility
- **tailwind-merge** - Tailwind CSS class conflict resolution

## Package Architecture

```
packages/utils/
├── src/
│   ├── cn.ts          # CSS class utility
│   ├── cn.test.ts     # Tests for cn utility
│   ├── logger.ts      # Logging utility
│   └── logger.test.ts # Tests for logger utility
├── package.json       # Package configuration with exports
└── CLAUDE.md         # This documentation
```

## Best Practices

1. **Keep utilities pure** - Functions should be predictable with no side effects
2. **Write comprehensive tests** - Test edge cases and different input types  
3. **Maintain TypeScript types** - Ensure proper typing for all utilities
4. **Document usage** - Include examples for complex utilities
5. **Consider performance** - Utilities are used frequently, optimize for speed

When adding new utilities to this package, follow the established patterns and ensure they provide value across multiple packages in the monorepo.