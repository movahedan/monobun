# AGENTS.md

This file provides guidance to Agents when working with code in this repository.

## 🎯 Development Rules & Standards

**IMPORTANT: Use the standards and guides below (`.cursor/rules/`, human docs, and skills) when working in this repository:**

- **[.cursor/rules/coding.mdc](.cursor/rules/coding.mdc)** - TypeScript, React, naming, imports, error handling
- **[.cursor/rules/testing.mdc](.cursor/rules/testing.mdc)** - Bun test runner, patterns, isolation
- **[.cursor/rules/clean-dom.mdc](.cursor/rules/clean-dom.mdc)** - Semantic HTML, accessibility, Tailwind
- **[.cursor/rules/security.mdc](.cursor/rules/security.mdc)** - Security best practices, regex safety, input validation
- **[.cursor/rules/advisor.mdc](.cursor/rules/advisor.mdc)** - Engineering review, trade-offs, risk
- **[docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)** - Turborepo filters, workspace commands, Docker Compose on the host (`bun run container …`)
- **[.cursor/skills/documentation-sync/SKILL.md](.cursor/skills/documentation-sync/SKILL.md)** — Documentation tiers, discovery commands, sync checklist

These references contain detailed guidance on coding standards, security practices, and development patterns that should be followed throughout the codebase.

## Cursor skills

- **[.cursor/skills/initiative-workflow/SKILL.md](.cursor/skills/initiative-workflow/SKILL.md)** — Order: plan → build → docs → PR (per phase).
- **[.cursor/skills/planning-workflow/SKILL.md](.cursor/skills/planning-workflow/SKILL.md)** — Phased `.cursor/plans/*.plan.md` specs (todos, gates, doc list before PR).
- **[.cursor/skills/builder-workflow/SKILL.md](.cursor/skills/builder-workflow/SKILL.md)** — Code/config execution via subagents; ends before doc sync and commit.
- **[.cursor/skills/documentation-sync/SKILL.md](.cursor/skills/documentation-sync/SKILL.md)** — Update docs after build, before PR (not during builder).
- **[.cursor/skills/monorepo-script-commands/SKILL.md](.cursor/skills/monorepo-script-commands/SKILL.md)** — Bun subcommand CLIs with `parseArgs`, Ink step progress; reference `scripts/local/`, `scripts/container/`, and `scripts/render-and-exit.tsx` / `scripts/step-progress.tsx`.

## Essential Commands

Human-oriented cheat sheet: **[docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)**.

### Development
- `bun run turbo run dev --filter=<pkg>` - Start one workspace’s `dev` task from the repo root (there is no root `bun run dev` script)
- `bun run build` - Build all packages and applications (`turbo run build`)

### Code Quality
- `bun run overall` - Run comprehensive quality check (lint --write, typecheck affected, test affected, build affected)

### Testing
- `bun test` - Run tests across all packages
- `bun test scripts/my-script.test.ts` - Run specific test
- `bun test --coverage` - Run tests with coverage report
- `bun test --coverage-reporter=lcov` - Run tests with coverage reporter lcov

### Commit Management
- `bun run precommit` - Validate staged files, branch name, or commit message (`--help` for flags)

### Version Management
- `bun run release prepare` - Prepare version bumps and changelog
- `bun run release apply` - Apply prepared version changes
- `bun run release ci` - Full CI version workflow

### Local development
- `bun run local setup` - Install deps, lint (write), typecheck, tests, build
- `bun run local vscode` - Regenerate `.vscode/settings.json` and `.vscode/extensions.json` from the workspace (package scopes and existing config)
- `bun run local cleanup` - Remove build artifacts and `node_modules`

### Docker Compose (host)
- `bun run container …` - Single entry for compose: `docker-compose.dev.yml` by default, or `docker-compose.yml` when you pass **`--prod` before the subcommand** (`setup`, `up`, `down`, `build`, `check`, `compose`, `health`, `logs`, `cleanup`, `rm`); run `bun run container` alone for help
- `bun run container --prod up` - Production-shaped stack (`COMPOSE_PROJECT_NAME=repo-prod`)
- In CI, call the same CLI, e.g. `bun run container --prod compose build …` / `bun run container --prod build …` (no separate `prod:*` package scripts)

### CI helpers
- `bun run ci attach-affected` / `bun run ci attach-service-ports` - GitHub Actions outputs (see `bun run ci` with no args for help)

### Storybook
- `bun run turbo run build:storybook --filter=@repo/ui` - Build Storybook for the UI package (see `packages/ui/package.json`)

### Single Package Development
Use Turbo from the repo root (`bun run turbo …`):

- `bun run build --filter=@repo/ui` - Build only the UI package
- `bun run test --filter=@repo/utils` - Test only the utils package
- `bun run turbo run dev --filter=vite-spa` - Run only the vite-spa (Vite admin) app dev script

## Architecture Overview

This is a **Turborepo monorepo** using **Bun** as the package manager and runtime, designed with entity-driven architecture and CLI tooling.

### Package Structure
- **`packages/`** - Shared packages and libraries
  - `ui` - Shared React component library with Storybook (port 3004)
  - `utils` - Shared utility functions
  - `config-typescript` - Shared TypeScript configurations
  - `config-tests` - Shared testing configurations and mocks

- **`apps/`** - Applications
  - `vite-spa` - React + Vite admin dashboard (port 3001)
  - `nextjs` - Next.js e-commerce storefront (port 3002)
  - `express` - Express + TypeScript backend API (port 3003)
  - `astro-ssg` - Astro documentation site

### Key Technologies
- **Build System**: Turborepo with Bun package manager
- **Frontend**: React 19, Next.js 15, Astro, Svelte
- **Backend**: Express.js with TypeScript
- **Styling**: Tailwind CSS, CSS modules
- **Testing**: Bun test runner with custom test presets
- **Code Quality**: Biome for linting/formatting
- **Containers**: Docker Compose for local dev and production-style stacks
- **Git Hooks**: Lefthook for pre-commit automation

### CLI & Automation
Repository scripts provide tooling for validation, automation, and versioning. Internal implementation details are not part of this repository; refer to script usage in package.json.

### Capabilities
- Affected package detection for CI/CD optimization
- Git branch operations and management
- Staged file checking, commit parsing, and conventional commit support
- Docker Compose parsing and service health monitoring
- Package management and operations
- Changelog auto-generation and version management

### Development Workflow
1. **Docker-First**: Use `bun run container …` when you want services in Compose; otherwise work on the host with Bun
2. **Entity-Driven**: Use provided scripts/utilities for managing packages, branches, commits, etc.
3. **Quality Gates**: All code goes through Biome linting, TypeScript checking, and testing
4. **Automation**: Git hooks handle commit formatting, version management, and changelog generation

### TypeScript Configuration
- Strict TypeScript with explicit return types required
- No `any` types allowed - use proper typing with type guards
- Interface definitions required for all data structures
- Import organization: React → Third-party → Local (absolute) → Relative

### Testing Conventions
- Use Bun test runner with custom test presets from `packages/config-tests`
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

For detailed information about working with specific packages and applications, refer to their individual AGENTS.md files:

### Package Management

- Keep dependencies up to date
- Use exact versions for stability
- Test package compatibility
- Document breaking changes

### Packages
- **[packages/ui/AGENTS.md](packages/ui/AGENTS.md)** - React component library with Storybook
- **[packages/utils/AGENTS.md](packages/utils/AGENTS.md)** - Shared utility functions (cn, logger)
- **[packages/config-typescript/AGENTS.md](packages/config-typescript/AGENTS.md)** - TypeScript configuration presets
- **[packages/config-tests/AGENTS.md](packages/config-tests/AGENTS.md)** - Testing configuration and utilities

### Applications  
- **[apps/vite-spa/AGENTS.md](apps/vite-spa/AGENTS.md)** - Vite + React admin dashboard (port 3001)
- **[apps/nextjs/AGENTS.md](apps/nextjs/AGENTS.md)** - Next.js e-commerce storefront (port 3002)
- **[apps/express/AGENTS.md](apps/express/AGENTS.md)** - Express.js backend API (port 3003)
- **[apps/astro-ssg/AGENTS.md](apps/astro-ssg/AGENTS.md)** - Astro documentation site

**When working on a specific package or application, always read its AGENTS.md file first for detailed guidance, architecture patterns, and development practices specific to that component.**

When working with this codebase, always run `bun run overall` before committing to ensure code quality and type safety.