# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the InterShell CLI framework package.

## Package Overview

**InterShell** is a modern CLI framework for building entity-driven automation and interactive command-line applications. It provides the core foundation for monorepo management in this Turborepo setup.

## Essential Commands

### Development
- `bun run build` - Build the TypeScript package to `dist/`
- `bun run check:types` - Run TypeScript type checking
- `bun test` - Run tests for the package

### Package Structure

```
packages/intershell/
├── src/
│   ├── core/                 # Core utilities and framework
│   │   ├── colorify.ts      # Enhanced terminal colors
│   │   ├── wrapshell.ts     # Script creation framework
│   │   ├── types.ts         # Core type definitions
│   │   └── index.ts         # Core exports
│   ├── entities/            # Entity-driven business logic (WORKING)
│   │   ├── commit/          # Commit parsing and validation
│   │   ├── changelog/       # Changelog generation
│   │   ├── package-json/    # Package.json operations
│   │   ├── workspace/       # Workspace management
│   │   ├── compose/         # Docker Compose parsing
│   │   ├── affected/        # Affected package detection
│   │   ├── tag/             # Git tag operations
│   │   ├── packages/        # Package management
│   │   └── index.ts         # Entity exports
│   └── interactive/         # Interactive CLI framework (IN DEVELOPMENT)
├── package.json
└── README.md
```

## Current Working Features

### Entity System (Production Ready)
The entity system provides robust, type-safe components for monorepo operations:

- **EntityCommit**: Commit parsing, validation, conventional commit support, staged file checking
- **EntityChangelog**: Changelog generation, version detection, Keep a Changelog format
- **EntityPackageJson**: Package.json operations, version management
- **EntityWorkspace**: Workspace package discovery and dependency analysis
- **EntityCompose**: Docker Compose parsing and service health monitoring
- **EntityAffected**: Affected package detection for CI/CD optimization
- **EntityTag**: Git tag operations and version management
- **EntityPackages**: Package management and operations
- **EntityVersion**: Version calculation, bump type determination, version history tracking
- **EntityTagPackage**: Tag-related operations with package-specific logic
- **EntityCommitPackage**: Commit analysis and dependency filtering
- **EntityDependencyAnalyzer**: Intelligent package dependency analysis with tsconfig support

### Core Utilities (Production Ready)
- **colorify**: Enhanced terminal colors with RGB, HSL, gradients
- **WrapShell**: Type-safe script creation with argument parsing
- **validators**: Input validation functions

## Architecture Notes

### Entity-Driven Design
Each entity encapsulates specific domain logic:
```typescript
// Example: Working with commits
import { EntityCommit } from '@repo/intershell/entities';

// Validate staged files
const { stagedFiles } = await EntityCommit.getStagedFiles();
const errors = await EntityCommit.validateStagedFiles(stagedFiles);

// Parse commit messages
const commit = EntityCommit.parseCommit('feat: add new feature');
const versionBump = EntityCommit.suggestVersionBump(['feat', 'fix']);
```

### Current Usage in Monorepo
The entities are actively used in:
- `scripts/commit-check.ts` - Staged file validation
- `scripts/version-prepare.ts` - Version bump detection with dependency analysis
- `scripts/version-apply.ts` - Changelog generation with smart filtering
- CI/CD workflows for affected package detection
- Dependency-aware version bumping and changelog generation
- Cross-package impact detection for version management

## Interactive Framework Status

**Note**: The interactive page-based navigation system described in the README is currently in development. The working system focuses on:
- Entity-based operations for monorepo management
- Script automation and validation
- CLI utilities and enhanced terminal output

## Development Guidelines

### Entity Development
When working with entities:
- Each entity should be self-contained with clear responsibilities
- Use TypeScript strict typing throughout
- Include comprehensive error handling
- Write tests for all entity methods
- Follow the established patterns in existing entities

### Testing
- Use Bun test runner with the custom test preset
- Test entity methods independently
- Mock external dependencies (file system, git operations)
- Include both unit and integration tests

### Type Safety
- All entity methods must have explicit return types
- Use proper TypeScript interfaces for all data structures
- Avoid `any` types - use proper typing with type guards
- Export types from entity modules for external use

## Key Dependencies

- **Peer Dependencies**: Biome, Lefthook, Turbo, TypeScript
- **Dev Dependencies**: Custom test preset and TypeScript config from workspace
- **Runtime**: Designed for Bun runtime with zero external dependencies

When working with this package, focus on the entity system for monorepo operations rather than the interactive framework which is still in development.