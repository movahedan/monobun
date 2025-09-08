# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 Development Rules & Standards

**IMPORTANT: Always refer to `.cursor/rules/` first for comprehensive development standards:**

- **[.cursor/rules/javascript.mdc](.cursor/rules/javascript.mdc)** - JavaScript, React, naming conventions, JSDoc
- **[.cursor/rules/typescript.mdc](.cursor/rules/typescript.mdc)** - TypeScript strict practices, type safety, interfaces
- **[.cursor/rules/security.mdc](.cursor/rules/security.mdc)** - Security best practices, regex safety, input validation
- **[.cursor/rules/packages.mdc](.cursor/rules/packages.mdc)** - Package management and library installation

These rules contain detailed guidance on coding standards, security practices, and development patterns that should be followed throughout the codebase.

## Essential Commands

### Development
- `bun run dev` - Start all applications in development mode
- `bun run build` - Build all packages and applications
- `bun run start` - Start all applications in production mode

### Code Quality
- `bun run check` - Run Biome linter/formatter check
- `bun run check:fix` - Auto-fix linting/formatting issues
- `bun run check:types` - Run TypeScript type checking across all packages
- `bun run check:quick` - Run comprehensive quick check (fix, types, test affected, build affected)

### Testing
- `bun test` - Run tests across all packages
- `bun test scripts/my-script.test.ts` - Run specific test
- `bun test --coverage` - Run tests with coverage report
- `bun test --coverage-reporter=lcov` - Run tests with coverage reporter lcov

### Commit Management
- `bun run commit` - Interactive commit creation wizard
- `bun run commit:check` - Validate staged files and commit format

### Version Management
- `bun run version:prepare` - Prepare version bumps and changelog
- `bun run version:apply` - Apply prepared version changes
- `bun run version:ci` - Full CI version workflow

### Local Development Setup
- `bun run local:setup` - Set up local development environment
- `bun run local:vscode` - Configure VS Code workspace settings
- `bun run local:cleanup` - Clean up local development files

### Docker Development
- `bun run dev:setup` - Set up Docker development environment
- `bun run dev:up` - Start all Docker services
- `bun run dev:down` - Stop all Docker services
- `bun run dev:logs` - View Docker service logs
- `bun run dev:check` - Check Docker service health
- `bun run dev:cleanup` - Clean up Docker development environment
- `bun run dev:restart` - Restart Docker services
- `bun run dev:build` - Build Docker images
- `bun run dev:health` - Check Docker service health status
- `bun run dev:rm` - Remove Docker development resources

### Production Container Management
- `bun run prod:up` - Start production services
- `bun run prod:down` - Stop production services
- `bun run prod:build` - Build production images
- `bun run prod:health` - Check production service health

### CI/CD Utilities
- `bun run ci:act` - Run GitHub Actions locally

### Storybook
- `bun run build:storybook` - Build Storybook for all UI packages

### Single Package Development
Use bun run with turbo filtering for working on specific packages:
- `bun run build --filter=@repo/ui` - Build only the UI package
- `bun run test --filter=packages/intershell` - Test only the intershell package
- `bun run dev --filter=apps/admin` - Run only the admin app

## Architecture Overview

This is a **Turborepo monorepo** using **Bun** as the package manager and runtime, designed with entity-driven architecture and CLI tooling.

### Package Structure
- **`packages/`** - Shared packages and libraries
  - `intershell` - Custom CLI framework with entity-driven architecture for monorepo control
  - `ui` - Shared React component library with Storybook (port 3004)
  - `utils` - Shared utility functions
  - `typescript-config` - Shared TypeScript configurations
  - `test-preset` - Shared testing configurations and mocks

- **`apps/`** - Applications
  - `admin` - React + Vite admin dashboard (port 3001)
  - `storefront` - Next.js e-commerce frontend (port 3002)
  - `api` - Express + TypeScript backend API (port 3003)
  - `docs-astro` - Astro documentation site

### Key Technologies
- **Build System**: Turborepo with Bun package manager
- **Frontend**: React 19, Next.js 15, Astro, Svelte
- **Backend**: Express.js with TypeScript
- **Styling**: Tailwind CSS, CSS modules
- **Testing**: Bun test runner with custom test presets
- **Code Quality**: Biome for linting/formatting
- **Containers**: Docker with DevContainer support
- **Git Hooks**: Lefthook for pre-commit automation

### InterShell CLI Framework
The repository uses a custom CLI framework called **InterShell** located in `packages/intershell/`. This provides:
- Entity-driven architecture for managing monorepo components
- Advanced CLI tooling with validation and automation
- Automated scripting for complex development workflows
- Configuration through `i.config.ts` in the root

**Note**: The interactive page-based navigation system is currently in development - the framework currently focuses on entity-based operations and automated scripting.

### Current InterShell Features (Production Ready)
The InterShell system provides comprehensive entity-based functionality:
- **Staged File Checking**: Comprehensive validation of staged files with configurable rules
- **Branch Linting**: Advanced branch name validation and enforcement
- **Version Bump Automation**: Intelligent version management based on commit analysis
- **Changelog Auto-Generation**: Comprehensive changelog creation with PR integration
- **Dependency Analyzer**: Smart commit filtering based on package dependencies
- **Cross-Package Impact Detection**: Changes to dependencies trigger appropriate version bumps
- **Enhanced Changelog Quality**: Only relevant commits appear in changelogs

### Development Workflow
1. **Docker-First**: Recommended to use DevContainer for consistent environment
2. **Entity-Driven**: Use InterShell entities for managing packages, branches, commits, etc.
3. **Quality Gates**: All code goes through Biome linting, TypeScript checking, and testing
4. **Automation**: Git hooks handle commit formatting, version management, and changelog generation

### TypeScript Configuration
- Strict TypeScript with explicit return types required
- No `any` types allowed - use proper typing with type guards
- Interface definitions required for all data structures
- Import organization: React → Third-party → Local (absolute) → Relative

### Testing Conventions
- Use Bun test runner with custom test presets from `packages/test-preset`
- Follow AAA pattern (Arrange, Act, Assert)
- Create reusable test utilities and mock factories
- Group tests logically with descriptive `describe` blocks

### Security Guidelines
- All user input must be validated and sanitized
- Environment variables for sensitive configuration
- Parameterized queries to prevent SQL injection
- JWT tokens for authentication with refresh mechanisms
- CORS properly configured for allowed origins

### Component Development
- Functional components with TypeScript interfaces
- Custom hooks for reusable logic
- Consistent import/export organization
- Props interfaces with explicit typing

## Package-Specific Documentation

For detailed information about working with specific packages and applications, refer to their individual CLAUDE.md files:

### Package Management

- Keep dependencies up to date
- Use exact versions for stability
- Test package compatibility
- Document breaking changes

### Packages
- **[packages/intershell/CLAUDE.md](packages/intershell/CLAUDE.md)** - InterShell CLI framework and entity system
- **[packages/ui/CLAUDE.md](packages/ui/CLAUDE.md)** - React component library with Storybook
- **[packages/utils/CLAUDE.md](packages/utils/CLAUDE.md)** - Shared utility functions (cn, logger)
- **[packages/typescript-config/CLAUDE.md](packages/typescript-config/CLAUDE.md)** - TypeScript configuration presets
- **[packages/test-preset/CLAUDE.md](packages/test-preset/CLAUDE.md)** - Testing configuration and utilities

### Applications  
- **[apps/admin/CLAUDE.md](apps/admin/CLAUDE.md)** - React admin dashboard (port 3001)
- **[apps/storefront/CLAUDE.md](apps/storefront/CLAUDE.md)** - Next.js e-commerce frontend (port 3002)
- **[apps/api/CLAUDE.md](apps/api/CLAUDE.md)** - Express.js backend API (port 3003)
- **[apps/docs-astro/CLAUDE.md](apps/docs-astro/CLAUDE.md)** - Astro documentation site

**When working on a specific package or application, always read its CLAUDE.md file first for detailed guidance, architecture patterns, and development practices specific to that component.**

When working with this codebase, always run `bun run check:quick` before committing to ensure code quality and type safety.