# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the docs-astro application.

## Application Overview

**docs-astro** is a documentation website built with Astro, providing comprehensive documentation for the monorepo projects. It features static site generation with modern web technologies and Markdown content management.

## Essential Commands

### Development
- `bun run dev` - Start Astro development server
- `bun run build` - Build static site for production
- `bun run start` - Preview production build
- `bun run check` - Run Astro and Biome checks
- `bun run check:fix` - Auto-fix linting issues
- `bun run check:types` - Run TypeScript type checking

## Technology Stack

### Core Framework
- **Astro 4.16.19** - Modern static site generator
- **TypeScript** - Type-safe development
- **Markdown** - Content management with marked parser

### Styling & UI
- **Tailwind CSS 4.1.12** - Utility-first CSS framework
- **@tailwindcss/typography** - Beautiful typography plugin
- **Lucide Astro** - Icon library for Astro

### Development Tools
- **@astrojs/tailwind** - Tailwind CSS integration
- **@astrojs/check** - Astro type checking
- **@repo/typescript-config** - Shared TypeScript configuration

## Architecture

### Project Structure
```
apps/docs-astro/
├── src/
│   ├── pages/              # Route pages (.astro, .md files)
│   │   ├── index.astro    # Home page
│   │   ├── guides/        # Documentation guides
│   │   ├── api/           # API documentation
│   │   └── [...slug].astro # Dynamic routes
│   ├── layouts/           # Page layouts
│   │   ├── Layout.astro   # Base layout
│   │   ├── DocsLayout.astro # Documentation layout
│   │   └── BlogLayout.astro # Blog post layout
│   ├── components/        # Reusable components
│   │   ├── Header.astro   # Site header
│   │   ├── Sidebar.astro  # Documentation sidebar
│   │   ├── TableOfContents.astro
│   │   └── CodeBlock.astro
│   ├── content/           # Content collections
│   │   ├── docs/          # Documentation markdown files
│   │   ├── guides/        # Guide markdown files
│   │   └── config.ts      # Content configuration
│   ├── styles/            # Global styles
│   └── utils/             # Utility functions
├── public/                # Static assets
├── astro.config.mjs       # Astro configuration
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

### Development Patterns

#### Astro Component Pattern
```astro
---
// src/components/DocumentationCard.astro
import { Icon } from 'lucide-astro';

interface Props {
  title: string;
  description: string;
  href: string;
  icon?: string;
  category?: string;
}

const { title, description, href, icon = 'FileText', category } = Astro.props;
---

<div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
  <div class="flex items-start gap-4">
    <div class="flex-shrink-0">
      <Icon name={icon} size={24} class="text-blue-600" />
    </div>
    <div class="flex-1">
      {category && (
        <span class="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full mb-2">
          {category}
        </span>
      )}
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        <a href={href} class="hover:text-blue-600 transition-colors">
          {title}
        </a>
      </h3>
      <p class="text-gray-600 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  </div>
</div>
```

#### Page Layout Pattern
```astro
---
// src/layouts/DocsLayout.astro
import Layout from './Layout.astro';
import Sidebar from '../components/Sidebar.astro';
import TableOfContents from '../components/TableOfContents.astro';

export interface Props {
  title: string;
  description?: string;
  frontmatter?: {
    title: string;
    description?: string;
    category?: string;
    order?: number;
  };
}

const { title, description, frontmatter } = Astro.props;
const pageTitle = frontmatter?.title || title;
const pageDescription = frontmatter?.description || description;
---

<Layout title={pageTitle} description={pageDescription}>
  <div class="flex max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Sidebar Navigation -->
    <aside class="hidden lg:block w-64 flex-shrink-0 py-8">
      <Sidebar />
    </aside>
    
    <!-- Main Content -->
    <main class="flex-1 min-w-0 py-8 px-4 lg:px-8">
      <article class="prose prose-lg max-w-none">
        <header class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            {pageTitle}
          </h1>
          {pageDescription && (
            <p class="text-xl text-gray-600">
              {pageDescription}
            </p>
          )}
        </header>
        <slot />
      </article>
    </main>
    
    <!-- Table of Contents -->
    <aside class="hidden xl:block w-64 flex-shrink-0 py-8">
      <TableOfContents />
    </aside>
  </div>
</Layout>
```

#### Markdown Content Pattern
```markdown
---
title: "Getting Started with the Monorepo"
description: "Learn how to set up and start developing in the monorepo"
category: "Guide"
order: 1
---

# Getting Started

This guide will help you get started with development in our monorepo.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Bun](https://bun.sh/) - JavaScript runtime and package manager
- [Node.js](https://nodejs.org/) - Version 18 or higher
- [Git](https://git-scm.com/) - Version control

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/monorepo.git
   cd monorepo
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the development environment:
   ```bash
   bun run dev:setup
   bun run dev:up
   ```

## Project Structure

The monorepo is organized as follows:

- `apps/` - Applications (admin, storefront, api, docs)
- `packages/` - Shared packages (ui, utils, config)
- `scripts/` - Development and automation scripts
- `docs/` - Additional documentation files

## Next Steps

- Read the [Architecture Guide](/guides/architecture)
- Learn about [Development Workflows](/guides/development)
- Explore the [Component Library](/packages/ui)
```

#### Content Collections Configuration
```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const docsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    order: z.number().optional(),
    draft: z.boolean().optional(),
    lastUpdated: z.date().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const guidesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    estimatedTime: z.string(),
    prerequisites: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  'docs': docsCollection,
  'guides': guidesCollection,
};
```

#### Dynamic Page Generation
```astro
---
// src/pages/docs/[...slug].astro
import { getCollection } from 'astro:content';
import DocsLayout from '../../layouts/DocsLayout.astro';

export async function getStaticPaths() {
  const docsEntries = await getCollection('docs');
  
  return docsEntries.map(entry => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
---

<DocsLayout
  title={entry.data.title}
  description={entry.data.description}
  frontmatter={entry.data}
>
  <Content />
</DocsLayout>
```

## Development Guidelines

### Content Organization
- **Use content collections** for structured content management
- **Organize by category** for better navigation
- **Include frontmatter** with metadata for all content
- **Use consistent naming** for files and folders

### Styling Approach
- **Tailwind CSS** for component styling
- **Typography plugin** for Markdown content styling
- **Responsive design** for all screen sizes
- **Dark mode support** where appropriate

### Performance Optimization
- Leverage Astro's static generation
- Optimize images with Astro's Image component
- Use proper caching strategies
- Minimize JavaScript bundle size

### SEO Best Practices
```astro
---
// Include proper meta tags
import Layout from '../layouts/Layout.astro';

const title = 'Documentation | Monorepo';
const description = 'Comprehensive documentation for our monorepo';
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<Layout 
  title={title}
  description={description}
  canonical={canonicalURL}
>
  <!-- Page content -->
</Layout>
```

## Content Management

### Documentation Structure
```
src/content/docs/
├── getting-started/
│   ├── installation.md
│   ├── quick-start.md
│   └── troubleshooting.md
├── packages/
│   ├── ui-components.md
│   ├── utilities.md
│   └── configuration.md
├── apps/
│   ├── admin-dashboard.md
│   ├── storefront.md
│   └── api-server.md
└── deployment/
    ├── docker.md
    ├── ci-cd.md
    └── production.md
```

### Writing Guidelines
- Use clear, concise language
- Include code examples where relevant
- Add cross-references to related content
- Keep content up-to-date with codebase changes
- Use consistent formatting and style

## Integration with Monorepo

### Shared Configuration
- **@repo/typescript-config**: Shared TypeScript settings
- **Tailwind CSS**: Consistent with other apps
- **Documentation syncing**: Pull content from package READMEs

### Automated Documentation
- Generate API documentation from code comments
- Update package documentation automatically
- Sync version information from package.json files

## Testing Guidelines

```typescript
import { describe, it, expect } from 'bun:test';
import { getCollection } from 'astro:content';

describe('Content Collections', () => {
  it('should load docs collection correctly', async () => {
    const docs = await getCollection('docs');
    expect(docs.length).toBeGreaterThan(0);
    
    // Verify required frontmatter fields
    docs.forEach(doc => {
      expect(doc.data.title).toBeDefined();
      expect(typeof doc.data.title).toBe('string');
    });
  });

  it('should have valid guide metadata', async () => {
    const guides = await getCollection('guides');
    
    guides.forEach(guide => {
      expect(['beginner', 'intermediate', 'advanced'])
        .toContain(guide.data.difficulty);
      expect(guide.data.estimatedTime).toBeDefined();
    });
  });
});
```

When working with this documentation site, focus on creating clear, comprehensive content that helps users understand and work with the monorepo effectively. Leverage Astro's static generation capabilities for optimal performance and SEO.