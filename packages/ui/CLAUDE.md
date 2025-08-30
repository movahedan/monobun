# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the UI component library package.

## Package Overview

**@repo/ui** is a React component library built with modern tools providing tree-shakable, type-safe components. It uses Radix UI primitives, Tailwind CSS, and includes comprehensive Storybook documentation.

## Essential Commands

### Development
- `bun run dev` - Start development server
- `bun run check:types` - Run TypeScript type checking
- `bun test` - Run component tests

### Storybook
- `bun run dev:storybook` - Start Storybook development server
- `bun run build:storybook` - Build Storybook static site to `dist-storybook/`
- `bun run start` - Serve built Storybook site

### Package Structure

```
packages/ui/
├── src/
│   ├── button/           # Button component with variants
│   ├── card/             # Card component family
│   ├── counter-button/   # Interactive counter component
│   ├── input/            # Form input component
│   ├── label/            # Form label component
│   ├── link/             # Navigation link component
│   ├── login-form/       # Complete login form
│   ├── index.ts          # Barrel exports
│   └── styles.css        # Global styles
├── .storybook/           # Storybook configuration
├── package.json
└── README.md
```

## Architecture & Design Patterns

### Component Organization
Each component follows a consistent structure:
- `component-name.tsx` - Main component implementation
- `component-name.stories.tsx` - Storybook stories
- `component-name.test.tsx` - Component tests

### Import Strategies

**Tree-Shakable Imports (Recommended)**:
```typescript
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
```

**Barrel Imports (Convenience)**:
```typescript
import { Button, Card, Input } from '@repo/ui';
```

### Technology Stack
- **React 19** with functional components and hooks
- **TypeScript** with strict typing
- **Tailwind CSS 4** for styling
- **Radix UI** for accessible primitives
- **Class Variance Authority** for component variants
- **Storybook** for component documentation and testing

## Component Guidelines

### Component Structure
```typescript
// Example component pattern
import { cn } from '@repo/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### Key Patterns
1. **Variant-based styling** using Class Variance Authority
2. **Forward refs** for proper component composition
3. **Accessible primitives** from Radix UI when needed
4. **Type-safe props** with proper TypeScript interfaces
5. **Utility-first styling** with Tailwind CSS

### Testing Patterns
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders button with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });
});
```

## Storybook Integration

### Story Structure
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Example/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: 'Button' },
};
```

### Available Addons
- **@storybook/addon-a11y** - Accessibility testing
- **@storybook/addon-links** - Navigation between stories
- **@storybook/addon-themes** - Theme switching
- **@storybook/testing-library** - User interaction testing

## Development Guidelines

### Adding New Components
1. Create component directory in `src/`
2. Implement component with TypeScript
3. Add Storybook stories
4. Write component tests  
5. Export from `src/index.ts`
6. Update package.json exports if needed

### Styling Guidelines
- Use Tailwind CSS utility classes
- Leverage CVA for component variants
- Follow design system patterns
- Ensure responsive design
- Maintain accessibility standards

### Dependencies
- **Radix UI**: Use for complex interactive components
- **Lucide React**: Use for consistent iconography
- **clsx/tailwind-merge**: Use via `@repo/utils` cn() helper
- **Class Variance Authority**: Use for variant management

## Type Safety

### Component Props
```typescript
// Always define explicit interfaces
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined';
  children: React.ReactNode;
}

// Use proper generic typing for forwarded refs
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props}>
        {children}
      </div>
    );
  }
);
```

### Export Types
Always export component prop types for external consumption:
```typescript
export type { ButtonProps, CardProps } from './component';
```

When working with this package, focus on building reusable, accessible components following the established patterns. Always include Storybook stories and tests for new components.