# @repo/ui

A React component library built with Vite, providing tree-shakable components with individual exports for optimal performance.

## Features

- ✅ **Tree-shakable** - Only import what you need
- ✅ **Individual exports** - Import specific components
- ✅ **Barrel exports** - Convenient bulk imports
- ✅ **TypeScript support** - Full type definitions
- ✅ **Vite-powered** - Fast builds and development
- ✅ **No package.json mutation** - Clean, maintainable setup

## Installation

```bash
bun add @repo/ui
```

## Usage

### Individual Component Imports (Recommended)

For optimal tree-shaking and bundle size:

```typescript
import { Button } from '@repo/ui/button/button';
import { Link } from '@repo/ui/link/link';
import { CounterButton } from '@repo/ui/counter-button/counter-button';
```

### Barrel Import (Convenience)

For easier imports when you need multiple components:

```typescript
import { Button, Link, CounterButton } from '@repo/ui';
```

## Development

### Build

```bash
bun run build
```

### Development Mode

```bash
bun run dev
```

### Type Checking

```bash
bun run typecheck
```

### Testing

```bash
bun run test
```

## Architecture

This library uses Vite's library mode with dynamic entry point discovery:

- **Automatic component discovery** - No manual configuration needed
- **Dynamic exports generation** - Exports are generated automatically from file system
- **Shared component discovery logic** - Single source of truth for component detection
- **Individual component builds** - Each component is built separately
- **Perfect tree-shaking** - Unused components are excluded from bundles
- **TypeScript declarations** - Full type support for all components
- **Zero manual exports management** - Just add components to `src/` and they're automatically exported

## Adding New Components

1. Create a new component directory in `src/`
2. Add an `index.ts` file that exports your component
3. Run `bun run build` - the component is automatically included and exported!

Example:
```
src/
├── button/
│   ├── button.tsx
│   └── index.ts
├── link/
│   ├── counter-button.tsx
│   └── index.ts
└── new-component/
    ├── new-component.tsx
    └── index.ts  ← Add this
```

The component will be automatically:
- ✅ Built by Vite
- ✅ Added to exports.json
- ✅ Available for import: `import { NewComponent } from '@repo/ui/new-component'`

## Build Output

The library generates both ESM and CommonJS formats:

```
dist/
├── index.mjs          # Main barrel export (ESM)
├── index.js           # Main barrel export (CommonJS)
├── button/
│   ├── button.mjs     # Individual component (ESM)
│   └── button.js      # Individual component (CommonJS)
├── link/
│   ├── link.mjs       # Individual component (ESM)
│   └── link.js        # Individual component (CommonJS)
└── counter-button/
    ├── counter-button.mjs  # Individual component (ESM)
    └── counter-button.js   # Individual component (CommonJS)
``` 