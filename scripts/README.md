# 🛠️ Repository Scripts

> **Advanced automation system with interactive CLI, entity-based architecture, and sophisticated script management**

## 📋 Table of Contents

- [Overview](#-overview)
- [Script Architecture](#-script-architecture)
- [Entity System](#-entity-system)
- [Available Scripts](#-available-scripts)
- [Development](#-development)
- [Testing](#-testing)

## 🎯 Overview

This workspace contains all automation scripts and utilities for the repository, including:

- **🏗️ Entity Architecture**: Modular, reusable components for common operations
- **🔧 Enhanced Scripts**: Type-safe automation with comprehensive error handling
- **🧪 Automated Testing**: Comprehensive test coverage and quality checks
- **🚀 CI/CD Integration**: Seamless GitHub Actions integration

## 🏗️ Script Architecture

### Core Components

```
📁 scripts/
├── shell/                    # 🎮 CLI and interaction utilities
│   ├── create-scripts.ts     # Script creation framework
│   ├── interactive-cli.ts    # Interactive prompt system
│   ├── colorify.ts          # Terminal color utilities
│   └── cli-tools.ts         # CLI navigation and state management
├── entities/                 # 🏛️ Core business logic
│   ├── commit.ts            # Commit parsing, validation, and analysis
│   ├── changelog.ts         # Changelog generation and merging
│   ├── package-json.ts      # Package.json operations and version management
│   ├── workspace.ts         # Workspace package discovery and validation
│   ├── compose.ts           # Docker Compose parsing and service health
│   ├── affected.ts          # Affected package detection with dependencies
│   ├── tag.ts               # Git tag operations and management
│   └── changelog-manager.ts # Stateful changelog orchestration
└── *.ts                     # 🚀 Individual script implementations
```

### Design Principles

1. **Modularity**: Each script has a single responsibility
2. **Type Safety**: Full TypeScript support with strict types
3. **Testability**: Comprehensive test coverage with mocking
4. **Consistency**: Shared utilities and patterns across scripts
5. **Documentation**: Self-documenting code with JSDoc comments

## 🏛️ Entity System

The entity system provides reusable, type-safe components for common operations:

### Core Entities

#### `EntityCommit`
- Commit parsing, validation, and analysis
- Conventional commit format support
- PR categorization and metadata extraction

#### `EntityPackageChangelog`
- Changelog generation and merging
- Keep a Changelog format compliance
- Version-aware content management

#### `EntityPackageJson`
- Package.json operations and version management
- Automated version bumping
- Changelog file management

#### `EntityWorkspace`
- Workspace package discovery and validation
- Package path resolution
- Dependency graph analysis

#### `EntityCompose`
- Docker Compose parsing and service health
- Service port mapping
- Health check monitoring

#### `EntityAffected`
- Affected package detection with dependencies
- Change impact analysis
- CI/CD integration support

#### `EntityTag`
- Git tag operations and management
- Version tag creation and deletion
- Remote tag synchronization

#### `ChangelogManager`
- Stateful changelog orchestration
- Version bump determination
- Commit range analysis

## 🚀 Available Scripts

### Development Scripts

- **`dev-setup`**: Setup DevContainer environment
- **`dev-cleanup`**: Clean up development resources
- **`dev-check`**: Verify DevContainer health
- **`local-setup`**: Local environment setup
- **`local-cleanup`**: Local environment cleanup
- **`local-vscode`**: VS Code-specific setup

### CI/CD Scripts

- **`ci-act`**: Test GitHub Actions locally
- **`ci-attach-affected`**: Attach affected packages to GitHub output
- **`ci-attach-service-ports`**: Attach service ports to GitHub output

### Version Management

- **`version-prepare`**: Prepare version bumps and changelogs
- **`version-apply`**: Apply version changes and create tags
- **`version-ci`**: Complete CI version workflow

### Git Operations

- **`commit`**: Interactive commit creation with validation
- **`commit-check`**: Comprehensive commit validation
- **`update-package-json`**: Update package.json exports

## 🔧 Development

### Running Scripts
```bash
# From repository root
bun run scripts/<script-name>.ts [options]

# From scripts directory
bun run <script-name>.ts [options]
```

### Adding New Scripts
1. Create your script following the `example-script.ts` template
2. Use the `createScript` utility for consistent CLI handling
3. Add comprehensive JSDoc comments
4. Include examples in the script configuration

### Code Quality
```bash
# Run type checking
bun run check:types

# Run linting
bun run check:fix

# Run tests
bun test scripts/
```

## 🧪 Testing

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run with coverage
bun test --coverage

# Run specific test file
bun test shell/version-utils.test.ts
```

### Test Coverage
- **`shell/`**: CLI utilities and interaction systems
- **`entities/`**: Core business logic components
- **`*.test.ts`**: Individual script tests

### Testing Utilities

```typescript
// Create mock data
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  ...overrides
});

// Test script execution
describe('Script Name', () => {
  it('should execute successfully', async () => {
    const result = await scriptFunction();
    expect(result).toBeDefined();
  });
});
```

## 🏗️ Architecture

### Core Modules

#### `shell/create-scripts.ts`
- CLI argument parsing and validation
- Consistent error handling and help generation
- Type-safe argument inference

#### `shell/interactive-cli.ts`
- Interactive prompt system for user input
- Selection, confirmation, and text input handling

#### `shell/cli-tools.ts`
- CLI navigation and state management
- Page-aware step system
- Progress tracking and validation

#### `shell/colorify.ts`
- Terminal color utilities
- Cross-platform color support
- Consistent styling across scripts

### Dependencies

- **Runtime**: Bun for JavaScript execution and package management
- **Types**: TypeScript for type safety
- **Utilities**: Custom shell utilities for git, Docker, and file operations
- **Testing**: Bun's built-in test runner with mocking support

---

*This enhanced scripting system provides a robust foundation for automation, CI/CD, and development workflows. For more information, see the individual script files and the main project documentation.*