# 🗂️ Archived: InterShell CLI Framework (moved to external package)

> InterShell is now maintained in its own repository and consumed here as a published package. This document described the former internal implementation and is retained only for historical context. For current usage, refer to the repository scripts in this monorepo and the published package’s documentation.

## 📋 Table of Contents

- [Overview](#-overview)
- [Package Structure](#package-structure)
- [Core Components](#core-components)
- [Interactive Framework](#interactive-framework)
- [Entity System](#entity-system)
- [Quick Start](#quick-start)
- [Advanced Usage](#advanced-usage)
- [Current Working System](#current-working-system)
- [Best Practices](#best-practices)

## 🎯 Overview

InterShell is a modern, type-safe CLI framework that provides a clean separation between I/O handling and application logic. It's built from the ground up for Bun with no external dependencies. While the interactive framework is in development, the current entity system provides a robust foundation that powers several key features in the Monobun monorepo including staged file checking, branch linting, version bump automation, and changelog generation.

### ✨ Key Features

- **🎮 Page-Based Navigation** - Structure your CLI as pages with clean transitions (🚧 In Progress)
- **📊 State Management** - Redux-like state management with reducers and actions (🚧 In Progress)
- **🎨 Enhanced Colors** - Rich color support with RGB, HSL, and gradient effects
- **🔧 Type Safety** - Full TypeScript support with strict type checking
- **⚡ Promise-Based** - Clean promise-based architecture for better testability and extensibility
- **🎯 Zero Dependencies** - Built from the ground up for Bun with no external deps
- **🧪 Testable** - Clean architecture makes testing individual components easy

## 📦 Package Structure

```
📁 packages/intershell/
├── src/
│   ├── core/                    # 🎮 Core utilities and framework
│   │   ├── colorify.ts         # Enhanced terminal color utilities
│   │   ├── wrapshell.ts        # Script creation framework
│   │   ├── types.ts            # Core type definitions
│   │   └── index.ts            # Main exports
│   ├── interactive/             # 🎯 Interactive CLI framework
│   │   ├── framework.ts        # Main framework orchestrator
│   │   ├── pages.ts            # Page system and builders
│   │   ├── cli.ts              # Interactive CLI implementation
│   │   └── plugin/             # Plugin system
│   └── entities/               # 🏛️ Core business logic
│       ├── affected/           # Affected package detection
│       ├── branch/             # Git branch operations
│       ├── commit/             # Commit parsing and validation
│       ├── compose/            # Docker Compose parsing
│       ├── intershell-config/  # Configuration management
│       ├── package/            # Package management and operations
│       ├── package-changelog/  # Changelog generation
│       ├── package-commits/    # Commit analysis and dependency filtering
│       ├── package-tags/       # Tag-related operations
│       ├── package-version/    # Version calculation and management
│       └── tag/                # Git tag operations
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Core Components

### **Core Package (`@intershell/core`)**

Foundation utilities and types for the InterShell framework:

```typescript
import { colorify, WrapShell, validators } from '@repo/intershell/core';

// Enhanced colorify system
console.log(colorify.rgb(255, 128, 0)('Custom RGB color'));
console.log(colorify.gradient(['#ff0000', '#00ff00'])('Gradient text'));

// WrapShell script creation
const script = WrapShell.createScript({
  name: 'My CLI Tool',
  description: 'A sample CLI application',
  options: [
    {
      short: '-n',
      long: '--name',
      description: 'Your name',
      required: true,
      validator: validators.nonEmpty,
    }
  ]
}, async (args, console) => {
  console.log(`Hello, ${args.name}!`);
});
```

### **Interactive Package (`@intershell/interactive`)**

Interactive CLI framework with page-based navigation:

```typescript
import { InterShellFramework, PageBuilder } from '@repo/intershell/interactive';

// Define application state
interface AppState {
  name: string;
  confirmed: boolean;
}

// Create pages with PageBuilder
const pages = [
  PageBuilder.create<AppState>('input', 'Enter Name')
    .render(async (cli, state) => {
      cli.clearScreen();
      console.log('👤 What is your name?');
      
      const name = await cli.prompt('Name:', {
        clearScreen: false,
        allowEmpty: false,
      });
      
      state.name = name;
    })
    .getNextAction(() => ({ type: 'NEXT_PAGE' }))
    .build(),
    
  PageBuilder.create<AppState>('confirm', 'Confirm')
    .render(async (cli, state) => {
      cli.clearScreen();
      console.log('✅ Confirmation');
      
      const confirmed = await cli.confirm(`Hello ${state.name}, continue?`);
      state.confirmed = confirmed;
    })
    .getNextAction((state) => 
      state.confirmed ? { type: 'EXIT' } : { type: 'PREV_PAGE' }
    )
    .build(),
];

// Create and run the framework
const framework = new InterShellFramework(
  { name: '', confirmed: false },
  pages,
  {}
);

const finalState = await framework.run();
```

## 🎮 Interactive Framework

> **🚧 Note: The interactive framework is currently in development. The examples below show the planned architecture.**

### **Page System**

Pages are the building blocks of your CLI application:

```typescript
const page = PageBuilder.create<State>('page-id', 'Page Title')
  .description('What this page does')
  .render(async (cli, state) => {
    // Render the page content
    // Use cli.prompt(), cli.select(), cli.confirm() for user input
  })
  .handleKey((key, state) => {
    // Handle raw key presses (optional)
    return null; // or return an action
  })
  .getNextAction((state) => {
    // Determine what happens next
    return { type: 'NEXT_PAGE' }; // or other actions
  })
  .build();
```

### **Navigation Actions**

Control page flow with navigation actions:

- `{ type: 'NEXT_PAGE' }` - Go to the next page
- `{ type: 'PREV_PAGE' }` - Go to the previous page  
- `{ type: 'CHANGE_PAGE'; payload: 'page-id' }` - Go to a specific page
- `{ type: 'RE_RENDER' }` - Re-render the current page
- `{ type: 'EXIT' }` - Exit the application
- `{ type: 'CUSTOM'; payload: action }` - Dispatch a custom action

### **State Management**

For complex applications, use actions and reducers:

```typescript
type Action = 
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_AGE'; payload: number };

const reducers = {
  SET_NAME: (state: State, action: Action): State => ({
    ...state,
    name: (action as any).payload,
  }),
  SET_AGE: (state: State, action: Action): State => ({
    ...state,
    age: (action as any).payload,
  }),
};

// In your page render function:
return { type: 'SET_NAME', payload: name };
```

## 🏛️ Entity System

The entity system provides reusable, type-safe components for common operations:

### **Core Entities**

#### `EntityAffected`
- Affected package detection with dependencies
- Change impact analysis
- CI/CD integration support

#### `EntityBranch`
- Git branch operations and management
- Branch validation and switching
- Branch information and metadata

#### `EntityCommit`
- Commit parsing, validation, and analysis
- Conventional commit format support
- PR categorization and metadata extraction
- Enhanced PR commit detection

#### `EntityCompose`
- Docker Compose parsing and service health
- Service port mapping
- Health check monitoring

#### `EntityIntershellConfig`
- Configuration management and validation
- Config loading and default values
- Settings validation and enforcement

#### `EntityPackage`
- Package management and operations
- Package discovery and validation
- Package information and metadata

#### `EntityPackageChangelog`
- Changelog generation and merging
- Keep a Changelog format compliance
- Version-aware content management
- PR commit grouping and organization

#### `EntityPackageCommits`
- Commit analysis and dependency filtering
- Smart commit filtering based on package dependencies
- Cross-package impact detection
- Intelligent dependency analysis

#### `EntityPackageTags`
- Tag-related operations with package-specific logic
- Package-specific tag management
- Tag validation and operations

#### `EntityPackageVersion`
- Version calculation and management
- Version bump detection and calculation
- Version history tracking
- Automated version bumping

#### `EntityTag`
- Git tag operations and management
- Version tag creation and deletion
- Remote tag synchronization

## 🚀 Quick Start

> **🚧 Note: The interactive framework is currently in development. This section shows the planned usage.**

### **Installation**

```bash
# Install the packages you need
bun add @repo/intershell

# Or with npm
npm install @repo/intershell
```

### **Basic Example**

```typescript
import { InterShellFramework, PageBuilder } from '@repo/intershell/interactive';
import { colorify } from '@repo/intershell/core';

// Define your application state
interface AppState {
  name: string;
  confirmed: boolean;
}

// Create pages with the PageBuilder
const pages = [
  PageBuilder.create<AppState>('input', 'Enter Name')
    .render(async (cli, state) => {
      cli.clearScreen();
      console.log(colorify.bold('👤 What is your name?'));
      
      const name = await cli.prompt('Name:', {
        clearScreen: false,
        allowEmpty: false,
      });
      
      state.name = name;
    })
    .getNextAction(() => ({ type: 'NEXT_PAGE' }))
    .build(),
    
  PageBuilder.create<AppState>('confirm', 'Confirm')
    .render(async (cli, state) => {
      cli.clearScreen();
      console.log(colorify.bold('✅ Confirmation'));
      
      const confirmed = await cli.confirm(`Hello ${state.name}, continue?`);
      state.confirmed = confirmed;
    })
    .getNextAction((state) => 
      state.confirmed ? { type: 'EXIT' } : { type: 'PREV_PAGE' }
    )
    .build(),
];

// Create and run the framework
const framework = new InterShellFramework(
  { name: '', confirmed: false }, // Initial state
  pages,
  {} // Reducers (empty for simple state updates)
);

const finalState = await framework.run();
console.log('Final state:', finalState);
```

## 🔧 Advanced Usage

> **🚧 Note: The advanced features below are planned for future releases.**

### **Plugin System**

Extend functionality with plugins:

```typescript
import { Plugin, PluginManager } from '@repo/intershell/interactive';

class NavigationPlugin implements Plugin {
  id = 'navigation';
  name = 'Navigation Plugin';
  version = '1.0.0';
  
  onLoad() {
    // Register navigation commands
    this.registerCommands();
    // Add navigation pages
    this.registerPages();
  }
  
  private registerCommands() {
    // Add navigation commands
  }
  
  private registerPages() {
    // Add navigation pages
  }
}

const pluginManager = new PluginManager();
await pluginManager.load(new NavigationPlugin());
```

### **Custom Renderers**

Create custom output renderers:

```typescript
import { Renderer } from '@repo/intershell/interactive';

class ConsoleRenderer implements Renderer {
  async render(page: Page, state: any): Promise<void> {
    console.clear();
    console.log(page.title);
    console.log('='.repeat(page.title.length));
    console.log(page.description || '');
    console.log();
    
    // Render page content
    await page.render(this, state);
  }
}

class HTMLRenderer implements Renderer {
  async render(page: Page, state: any): Promise<void> {
    const container = document.getElementById('cli-container');
    if (!container) return;
    
    container.innerHTML = `
      <h1>${page.title}</h1>
      <p>${page.description || ''}</p>
      <div class="page-content">
        ${await this.renderContent(page, state)}
      </div>
    `;
  }
}
```

## 🔄 Current Working System

### **What's Already Working**

The InterShell package currently provides a robust foundation that powers several key features in the Monobun monorepo:

#### **1. Staged File Checking**
The entity system enables intelligent staged file validation:

```typescript
// Using EntityCommit for staged file analysis
import { EntityCommit } from '@repo/intershell/entities/commit';

// Check staged files for conventional commit compliance
const stagedFiles = await EntityCommit.getStagedFiles();
const validationResults = await EntityCommit.validateStagedFiles(stagedFiles);

// Automatically detect commit types and suggest version bumps
const commitTypes = validationResults.map(result => result.type);
const suggestedBump = EntityCommit.suggestVersionBump(commitTypes);
```

#### **2. Branch Linting**
Advanced branch name validation and enforcement:

```typescript
// Using EntityBranch for branch validation
import { EntityBranch } from '@repo/intershell/entities/branch';

// Validate branch names against patterns
const branchName = 'feature/user-authentication';
const isValid = EntityBranch.validateBranchName(branchName);

// Enforce branch naming conventions
const rules = EntityBranch.getBranchRules();
const violations = EntityBranch.checkBranchRules(branchName, rules);
```

#### **3. Version Bump Automation**
Intelligent version management based on commit analysis:

```typescript
// Using EntityPackageVersion for version bump detection
import { EntityPackageVersion } from '@repo/intershell/entities/package-version';

// Analyze commit history for version bumps
const commits = await EntityCommit.getCommitsSinceLastTag();
const versionBump = EntityPackageVersion.detectVersionBump(commits);

// Automatically determine next version
const currentVersion = '1.2.3';
const nextVersion = EntityPackageVersion.calculateNextVersion(currentVersion, versionBump);
```

#### **4. Changelog Auto-Generation**
Comprehensive changelog creation with PR integration:

```typescript
// Using EntityPackageChangelog for automated changelog generation
import { EntityPackageChangelog } from '@repo/intershell/entities/package-changelog';

// Generate changelog from commit range
const changelog = await EntityPackageChangelog.generateChangelog({
  from: 'v1.2.0',
  to: 'HEAD',
  includePrCommits: true,
  groupByType: true
});

// Merge with existing changelog
const mergedChangelog = await EntityPackageChangelog.mergeChangelogs(
  existingChangelog,
  newChangelog
);
```

### **Entity System Architecture**

The current entity system provides a modular, type-safe foundation:

```
📁 packages/intershell/src/entities/
├── commit/              # 📝 Commit parsing, validation, and analysis
│   ├── commit.ts        # Core commit functionality
│   ├── pr.ts            # PR detection and categorization
│   ├── rules.ts         # Conventional commit rules
│   └── types.ts         # Type definitions
├── changelog/           # 📋 Changelog generation and management
│   ├── changelog.ts     # Core changelog functionality
│   ├── template.ts      # Template system
│   └── types.ts         # Changelog types
├── package-json/        # 📦 Package.json operations
├── workspace/           # 🗂️ Workspace management
├── compose/             # 🐳 Docker Compose parsing
├── affected/            # 🔍 Affected package detection
├── tag/                 # 🏷️ Git tag operations
└── packages/            # 📦 Package management
```

### **Current Integration Points**

These entities are actively used in:

- **Commit Validation**: `scripts/commit-check.ts` uses `EntityCommit` for comprehensive staged file validation with configurable rules
- **Version Management**: `scripts/version-prepare.ts` uses `EntityPackageVersion` and `EntityPackageCommits` for version bump detection
- **Changelog Generation**: `scripts/version-apply.ts` uses `EntityPackageChangelog` for changelog updates
- **CI/CD Integration**: GitHub Actions workflows use entities for affected package detection
- **Development Scripts**: All development scripts use entities for common operations

## 📋 Best Practices

### **1. Page Design**

- **Single Responsibility**: Each page should handle one specific task
- **Clear Navigation**: Use descriptive page titles and clear next actions
- **State Validation**: Validate state before allowing page transitions
- **Error Handling**: Provide clear error messages and recovery options

### **2. State Management**

- **Immutable Updates**: Use reducers for state updates, avoid direct mutation
- **Predictable Actions**: Use clear action types with descriptive payloads
- **State Persistence**: Consider persisting state for complex workflows
- **Validation**: Validate state at each step to prevent invalid states

### **3. User Experience**

- **Clear Instructions**: Provide clear guidance for each step
- **Progress Indication**: Show progress and completion status
- **Keyboard Shortcuts**: Support common keyboard shortcuts for power users
- **Error Recovery**: Allow users to go back and fix mistakes

### **4. Testing**

- **Unit Tests**: Test individual pages and reducers
- **Integration Tests**: Test complete workflows
- **Mock CLI**: Use mock CLI implementations for testing
- **State Validation**: Test state transitions and validation

## 🧪 Testing

InterShell's architecture makes testing easy:

```typescript
// Testing the current entity system
import { EntityCommit } from '@repo/intershell/entities/commit';
import { describe, it, expect } from 'vitest';

describe('EntityCommit', () => {
  it('should validate conventional commits correctly', async () => {
    const validCommit = 'feat: add new feature';
    const result = await EntityCommit.validateCommit(validCommit);
    
    expect(result.isValid).toBe(true);
    expect(result.type).toBe('feat');
  });
  
  it('should detect version bumps from commit types', () => {
    const commits = ['feat: new feature', 'fix: bug fix'];
    const bump = EntityCommit.suggestVersionBump(commits);
    
    expect(bump).toBe('minor');
  });
});

// Testing the WrapShell framework
import { WrapShell } from '@repo/intershell/core';

describe('WrapShell', () => {
  it('should create scripts with proper validation', () => {
    const script = WrapShell.createScript({
      name: 'Test Script',
      description: 'A test script',
      options: []
    }, async (args, console) => {
      console.log('Test executed');
    });
    
    expect(script).toBeDefined();
    expect(script.config.name).toBe('Test Script');
  });
});
```

### **Test Isolation & Mocking**

> **Important**: This package uses function-level mocking to prevent cross-test interference. See [Bun Test Isolation Bug Solution](../planning/24_BUN_TEST_ISOLATION_BUG_SOLUTION.md) for detailed information about the test isolation patterns and the complex bug we solved.

**Key Testing Principles:**
- ✅ **Function-level mocking** instead of global mock setup
- ✅ **Proper cleanup** with `beforeEach`/`afterEach` hooks
- ✅ **Dynamic imports** for fresh module instances
- ✅ **Test isolation** to prevent cross-test interference

**Test Execution Commands:**
```bash
# Run all intershell tests
bun test packages/intershell/src/entities/

# Run tests by folder (debugging tool for isolation issues)
bun run @repo/test-preset/test-by-folder packages/intershell/src/entities/

# Run specific entity tests
bun test packages/intershell/src/entities/commit/

# Run individual test files for debugging
bun test packages/intershell/src/entities/packages/packages.test.ts
```

## 🚀 Current Usage Examples

The InterShell entities are currently being used in production scripts:

- **Commit Validation**: `bun run commit:check` - Uses `EntityCommit` for comprehensive staged file validation with configurable rules
- **Version Management**: `bun run version:prepare` - Uses `EntityPackageVersion`, `EntityPackageCommits`, and `EntityTag` for version bump detection
- **Changelog Generation**: `bun run version:apply` - Uses `EntityPackageChangelog` and `EntityTag` for changelog updates
- **Development Setup**: `bun run dev:setup` - Uses `EntityCompose` for Docker service management

## 🔍 Staged File Validation

The `EntityCommit` now provides advanced staged file validation capabilities:

### **Configurable Validation Rules**

```typescript
// Example staged file validation configuration
const stagedConfig = [
  {
    filePattern: [/\.vscode\/.*/, /coverage\/.*/, /dist\/.*/],
    description: "development files should not be manually committed"
  },
  {
    filePattern: [/CHANGELOG.md/],
    contentPattern: [/^# @repo\/[^/]+$/m],
    description: "CHANGELOG.md should be auto-generated"
  },
  {
    filePattern: [/package.json/],
    contentPattern: [/^[+-].*"version":\s*"[^"]+"/m],
    ignore: { mode: "create" },
    description: "package.json version should be auto-generated"
  }
];
```

### **Key Features**

- **File Pattern Matching**: Regex-based file path validation
- **Content Pattern Validation**: Check staged content against patterns
- **Ignore Rules**: Skip validation for specific scenarios (e.g., new file creation)
- **CI Environment Support**: Disable certain validations in CI environments
- **Comprehensive Error Reporting**: Detailed feedback on validation failures

### **Usage in Scripts**

```typescript
// Get staged files
const { stagedFiles } = await EntityCommit.getStagedFiles();

// Validate against rules
const errors = await EntityCommit.validateStagedFiles(stagedFiles);

if (errors.length > 0) {
  throw new Error(errors.join('\n'));
}
```

## 🏗️ Architecture

InterShell follows a clean architecture with clear separation of concerns:

```
┌─────────────────────┐
│   CLI Application   │
├─────────────────────┤
│  InterShell Framework │ (🚧 In Development)
├─────────────────────┤
│    Page System     │ (🚧 In Development)
├─────────────────────┤
│  Interactive CLI    │ (🚧 In Development)
├─────────────────────┤
│   Core Utilities    │ ✅ Complete
└─────────────────────┘
```

### **Current Architecture (Working)**

```
┌─────────────────────┐
│   Scripts Layer     │
├─────────────────────┤
│   Entity System     │ ✅ Complete
├─────────────────────┤
│   Core Utilities    │ ✅ Complete
└─────────────────────┘
```

### **Key Principles**

1. **Promise-Based** - Clean promise-based architecture for extensibility
2. **Modular Entities** - Reusable components for common operations
3. **Type Safety** - Full TypeScript support throughout
4. **Testability** - Easy to test individual components
5. **Zero Dependencies** - Built from the ground up for Bun

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

InterShell is inspired by modern web frameworks and CLI tools, bringing the best patterns to interactive command-line applications.

---

**Built with ❤️ by the Monobun team**
