# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the typescript-config package.

## Package Overview

**@repo/typescript-config** provides shared TypeScript configuration files for all packages and applications in the monorepo, ensuring consistent TypeScript settings across the entire codebase.

## Available Configurations

The package exports four TypeScript configuration presets:

### `base.json` - Foundation Configuration
Basic TypeScript configuration with strict settings:
```json
{
  "extends": "@repo/typescript-config/base.json"
}
```
- Strict type checking enabled
- Modern ES target settings
- Common compiler options
- Path mapping support

### `vite.json` - Vite Projects
Optimized for Vite-based applications and libraries:
```json
{
  "extends": "@repo/typescript-config/vite.json"
}
```
- Module resolution for Vite
- JSX configuration for React
- Asset type declarations
- HMR support types

### `nextjs.json` - Next.js Applications
Tailored for Next.js applications:
```json
{
  "extends": "@repo/typescript-config/nextjs.json"
}
```
- Next.js specific compiler options
- App Router support
- API routes configuration
- Server Components types

### `react-library.json` - React Component Libraries
Designed for React library packages:
```json
{
  "extends": "@repo/typescript-config/react-library.json"
}
```
- Library-specific module resolution
- Declaration file generation
- Tree-shaking optimization
- Component export patterns

## Usage Examples

### Vite React Application (apps/admin)
```json
{
  "extends": "@repo/typescript-config/vite.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "vite.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### Next.js Application (apps/storefront)
```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", ".next"]
}
```

### React Library Package (packages/ui)
```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.stories.tsx", "**/*.test.tsx"]
}
```

### Utility Package (packages/utils)
```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

## Configuration Philosophy

### Strict Type Safety
All configurations enforce strict TypeScript settings:
- `strict: true` - Maximum type safety
- `noUncheckedIndexedAccess: true` - Prevent undefined array access
- `exactOptionalPropertyTypes: true` - Strict optional properties

### Modern JavaScript Support
- Target ES2022 for modern runtime features
- Module resolution for contemporary bundlers
- Import/export statement support

### Development Experience
- Source map generation for debugging
- Incremental compilation for faster builds
- Path mapping for clean imports

## Best Practices

### Extending Configurations
Always extend the most specific configuration for your project type:

```json
// ✅ Good - specific configuration
{
  "extends": "@repo/typescript-config/nextjs.json"
}

// ❌ Avoid - generic configuration for specific project
{
  "extends": "@repo/typescript-config/base.json"
}
```

### Project-Specific Overrides
Only override settings when necessary:

```json
{
  "extends": "@repo/typescript-config/vite.json",
  "compilerOptions": {
    // Only add project-specific settings
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Include/Exclude Patterns
Be explicit about what TypeScript should process:

```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "include": [
    "src/**/*"  // Source code
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.stories.tsx",  // Storybook files
    "**/*.test.tsx"      // Test files
  ]
}
```

## Dependencies

### Peer Dependencies
- **typescript** `5.8.3` - TypeScript compiler
- **bun-types** `1.3.1` - Bun runtime types

These are peer dependencies to avoid version conflicts and allow projects to control their TypeScript version.

## Maintenance Guidelines

### Updating Configurations
When updating shared configurations:

1. **Test across all projects** - Ensure changes don't break existing code
2. **Communicate breaking changes** - Update this documentation
3. **Consider gradual migration** - For major changes, consider versioning
4. **Validate with CI** - Ensure type checking passes in all packages

### Adding New Configurations
When adding new configuration presets:

1. **Identify common patterns** - Look for repeated tsconfig patterns
2. **Create focused configurations** - Each preset should serve a specific use case
3. **Document usage** - Update this file with examples
4. **Test thoroughly** - Validate with real projects

This package ensures TypeScript consistency across the entire monorepo while allowing flexibility for project-specific needs.