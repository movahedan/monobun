# 📚 Storybook Setup

> A comprehensive guide to using Storybook for the UI package

## 🎯 Overview

This UI package includes Storybook for component development, documentation, and testing. Storybook provides an isolated environment to develop and showcase UI components with different states and configurations.

## 🚀 Getting Started

### Development Server

Start the Storybook development server:

```bash
cd packages/ui
bun run dev:storybook
```

This will start Storybook on `http://localhost:3006` with hot reloading enabled.

**With the dev Compose stack:**

When the repo’s dev stack is up (`bun run container up` from the repo root), Storybook is published on the same host port the compose file maps for the UI service (port **3004** — see `docker-compose.dev.yml` and [AGENTS.md](../../AGENTS.md)).

### Production Build

Build Storybook for production deployment:

```bash
cd packages/ui
bun run storybook:build
```

The built files will be in the `storybook-static` directory.

### Preview Production Build

Preview the production build locally:

```bash
cd packages/ui
bun run start
```

This serves the built Storybook on `http://localhost:3006`.

## 📁 Project Structure

```
packages/ui/
├── .storybook/
│   ├── main.ts          # Main Storybook configuration
│   ├── preview.tsx      # Preview configuration
│   └── vite.config.ts   # Vite configuration
├── src/
│   ├── button/
│   │   ├── button.tsx
│   │   └── button.stories.tsx
│   ├── card/
│   │   ├── card.tsx
│   │   └── card.stories.tsx
│   └── ... (other components)
└── STORYBOOK.md         # This file
```

## 🧩 Component Stories

Each component has its own story file that demonstrates:

- **Default state** - Basic component usage
- **Variants** - Different visual styles and configurations
- **Interactive states** - Loading, disabled, error states
- **Accessibility** - Proper labeling and keyboard navigation
- **Documentation** - Usage examples and best practices

### Available Stories

- **Button** - All variants (default, secondary, destructive, etc.)
- **Card** - Different layouts and content arrangements
- **Input** - Various input types and states
- **Label** - Form labeling and accessibility
- **Link** - Internal and external links
- **CounterButton** - Interactive state management
- **LoginForm** - Complex form with validation

## ⚙️ Configuration

### Main Configuration (`.storybook/main.js`)

```javascript
const config = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [], // Currently no addons for compatibility
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // Vite configuration for Bun compatibility
  async viteFinal(config) {
    config.cacheDir = path.join(__dirname, '../node_modules/.vite-storybook-ui');
    // ... other Vite settings
  },
};
```

### Preview Configuration (`.storybook/preview.js`)

```javascript
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { matchers: { color: /(background|color)$/i } },
    backgrounds: { default: 'light' },
  },
  decorators: [
    (Story) => <div style={{ padding: '1rem' }}><Story /></div>,
  ],
};
```

## 🔧 Development Workflow

### Adding New Components

1. Create your component in `src/component-name/`
2. Create a story file: `component-name.stories.tsx`
3. Add the component to `package.json` exports
4. Start Storybook to test: `bun run storybook:dev`

### Writing Stories

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './my-component';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Description of your component',
      },
    },
  },
  argTypes: {
    // Define controls for your props
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};
```

### Best Practices

1. **Use descriptive story names** - Make it clear what each story demonstrates
2. **Include all variants** - Show different states, sizes, and configurations
3. **Add proper documentation** - Use JSDoc comments and story descriptions
4. **Test interactions** - Use actions to test event handlers
5. **Consider accessibility** - Include proper labels and keyboard navigation
6. **Keep stories simple** - Each story should demonstrate one concept

## 🚀 Deployment

### GitHub Pages

1. Build Storybook: `bun run storybook:build`
2. Deploy the `storybook-static` folder to GitHub Pages
3. Configure your repository settings for GitHub Pages

### Netlify

1. Connect your repository to Netlify
2. Set build command: `cd packages/ui && bun run storybook:build`
3. Set publish directory: `packages/ui/storybook-static`

### Vercel

1. Connect your repository to Vercel
2. Configure the build settings for the UI package
3. Deploy the Storybook build

## 🔍 Troubleshooting

### Common Issues

**Storybook not starting:**
- Ensure you're in the `packages/ui` directory
- Check that all dependencies are installed: `bun install`
- Verify the `.storybook` configuration files exist

**Build errors:**
- Clear the cache: `rm -rf node_modules/.vite-storybook-ui`
- Check for version conflicts in `package.json`
- Ensure all Storybook packages are the same version

**Component not showing:**
- Check that the component is exported from `src/index.ts`
- Verify the story file is in the correct location
- Ensure the story file follows the naming convention

### Version Compatibility

This setup uses Storybook 9.0.18 with specific configurations for Bun compatibility. If you encounter issues:

1. Check that all Storybook packages are the same version
2. Verify Bun compatibility settings in `main.js`
3. Consider using `bunx` for Storybook commands if needed

## 📚 Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [React Storybook](https://storybook.js.org/docs/react/get-started/introduction)
- [Vite Builder](https://storybook.js.org/docs/react/builders/vite)
- [Addons](https://storybook.js.org/docs/react/addons/introduction)

## 🤝 Contributing

When adding new components or modifying existing ones:

1. Update the corresponding story file
2. Test all variants and states
3. Ensure accessibility standards are met
4. Update this documentation if needed
5. Run Storybook to verify changes

---

**Happy Storybooking! 🎉** 