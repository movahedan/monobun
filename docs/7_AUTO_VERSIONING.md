# 🔄 Auto Versioning

> **Modern automated versioning system for the Monobun monorepo with enhanced CLI and entity-based architecture**

## 📋 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Interactive CLI](#-interactive-cli)
- [Individual Scripts](#-individual-scripts)
- [Complete Version Flow](#-complete-version-flow)
- [Conventional Commits](#-conventional-commits)
- [GitHub Actions Integration](#-github-actions-integration)
- [Manual Operations](#-manual-operations)
- [Best Practices](#-best-practices)

## 🎯 Overview

The Monobun monorepo uses a modern, automated versioning system that provides sophisticated automation and control:

### ✨ Key Features

- 🚧 **Interactive CLI** - Step-by-step wizard with navigation and validation (In Development)
- ✅ **Entity-Based Architecture** - Modular, reusable components for version management
- ✅ **Conventional Commits** - Automatically detects version bumps from commit messages
- ✅ **Automatic Changelog Generation** - Creates beautiful Keep a Changelog format
- ✅ **Monorepo Aware** - Handles multiple packages intelligently
- ✅ **Git Tag Automation** - Creates and manages version tags
- ✅ **CI/CD Integration** - Exports affected packages for deployment
- ✅ **Dry Run Support** - Preview changes before applying

### 🚀 Quick Start

```bash
# Prepare version and changelog
bun run scripts/version-prepare.ts --package root
# Apply changes without pushing
bun run scripts/version-apply.ts --no-push
# Preview complete workflow
bun run scripts/version-ci.ts --dry-run
```

## 🏗️ System Architecture

Our versioning system consists of 3 main scripts with an entity-based architecture:

```
📁 scripts/
├── version-ci.ts        # 🎯 Main orchestrator (complete CI flow)
├── version-prepare.ts   # 🔧 Version preparation and changelog generation
└── version-apply.ts     # 🚀 Version application and git operations

📁 packages/intershell/src/entities/
├── changelog/           # 🏛️ Changelog generation and formatting
├── commit/              # 📝 Commit parsing and validation
├── package-json/        # 📦 Package.json operations
├── tag/                 # 🏷️ Git tag management
└── workspace/           # 🗂️ Workspace package discovery
```

### Core Components

#### **ChangelogManager**
- Orchestrates the entire versioning process
- Determines version bump types automatically
- Manages commit range analysis
- Handles changelog generation and merging

#### **EntityCommit**
- Parses conventional commit messages
- Validates commit format and content
- Categorizes commits by type and scope
- Extracts PR information and metadata

#### **EntityChangelog**
- Generates Keep a Changelog format
- Merges new changes with existing changelog
- Formats commits with badges and links
- Maintains version history

## 🚀 Individual Scripts

### **version-prepare.ts**

Prepares version bumps and generates changelogs for packages.

```bash
# Prepare all packages
bun run scripts/version-prepare.ts

# Prepare specific package
bun run scripts/version-prepare.ts --package root

# Custom commit range
bun run scripts/version-prepare.ts --from v1.0.0 --to HEAD
```

**Features:**
- Automatic version bump detection
- Changelog generation with PR commit grouping 🆕
- Commit range analysis
- Package-specific processing
- Proper handling of squash merges 🆕

### **version-apply.ts**

Applies version changes and creates git tags.

```bash
# Apply with default message
bun run scripts/version-apply.ts

# Custom tag message
bun run scripts/version-apply.ts --message "Release version 1.2.3"

# Don't push tag
bun run scripts/version-apply.ts --no-push
```

**Features:**
- Git tag creation
- Version commit creation
- Remote tag pushing
- Dry run support

## 🔄 Complete Version Flow

### 1. **Preparation Phase**
```bash
bun run scripts/version-prepare.ts
```

**What happens:**
- Analyzes commit history with PR detection 🆕
- Groups individual commits with their PRs 🆕
- Determines version bump types
- Generates comprehensive changelogs 🆕
- Updates package.json versions

### **version-ci.ts**

Complete CI workflow for automated versioning.

```bash
# Preview CI workflow
bun run scripts/version-ci.ts --dry-run

# Execute full workflow
bun run scripts/version-ci.ts
```

**Features:**
- Automated git authentication
- Complete version workflow
- CI environment detection
- Error handling and rollback

## 🔄 Complete Version Flow

### 1. **Preparation Phase**
```bash
bun run scripts/version-prepare.ts
```

**What happens:**
- Analyzes commit history
- Determines version bump types
- Generates changelogs
- Updates package.json versions

### 2. **Application Phase**
```bash
bun run scripts/version-apply.ts
```

**What happens:**
- Commits version changes
- Creates version tags
- Pushes tags to remote
- Updates changelog files

### 3. **CI Integration**
```bash
bun run scripts/version-ci.ts
```

**What happens:**
- Automated git authentication
- Complete workflow execution
- Error handling and rollback
- CI environment optimization

## 📝 Conventional Commits

The system automatically detects version bumps from commit messages:

### **Commit Types**

- **`feat:`** → Minor version bump
- **`fix:`** → Patch version bump
- **`BREAKING CHANGE:`** → Major version bump
- **`docs:`, `style:`, `refactor:`** → No version bump
- **`chore:`, `ci:`, `test:`** → No version bump (unless breaking)

### **Examples**

```bash
# Minor version bump
git commit -m "feat: add user authentication system"

# Patch version bump
git commit -m "fix: resolve login validation issue"

# Major version bump
git commit -m "feat!: change API response format

BREAKING CHANGE: API now returns data in new format"

# No version bump
git commit -m "docs: update API documentation"
```

## 🚀 GitHub Actions Integration

### **Check Workflow**

The Check workflow automatically validates changes and determines affected packages:

```yaml
- name: 🔍 - Get affected packages
  id: affected-packages
  run: |
    bun run scripts/ci-attach-affected.ts --mode turbo --output-id affected-packages

- name: 🔍 - Get affected services
  id: affected-services
  run: |
    bun run scripts/ci-attach-affected.ts --mode docker --output-id affected-services
```

### **Version Workflow**

The Version workflow handles automated versioning:

```yaml
- name: 🔍 Generate changelog and bump versions
  id: packages-to-deploy
  run: bun run version:ci
```

### **Affected Package Detection**

The system automatically detects which packages are affected by changes:

```bash
# Get affected packages (Turbo mode)
bun run scripts/ci-attach-affected.ts --mode turbo --output-id affected-packages

# Get affected services (Docker mode)
bun run scripts/ci-attach-affected.ts --mode docker --output-id affected-services
```

## 🛠️ Manual Operations

### **Individual Package Versioning**

```bash
# Prepare specific package
bun run scripts/version-prepare.ts --package my-package

# Apply version changes
bun run scripts/version-apply.ts --message "Release version 1.2.3"
```

### **Custom Commit Ranges**

```bash
# Version from specific tag
bun run scripts/version-prepare.ts --from v1.0.0 --to HEAD

# Version between commits
bun run scripts/version-prepare.ts --from abc123 --to def456
```

### **Manual Version Control**

```bash
# Process specific package
bun run scripts/version-prepare.ts --package root

# Process all packages
bun run scripts/version-prepare.ts

# Custom commit range
bun run scripts/version-prepare.ts --from v1.0.0 --to HEAD
```

## 📋 Best Practices

### **1. Commit Message Standards**

- Use conventional commit format
- Include breaking change indicators when needed
- Provide clear, descriptive messages
- Use appropriate scopes for monorepo packages

### **2. Version Management**

- Let the system determine version bumps automatically
- Review changelogs before applying versions
- Use dry-run mode to preview changes
- Test version workflows in CI before production

### **3. Changelog Maintenance**

- Keep changelogs up to date
- Use meaningful commit descriptions
- Include PR numbers and links
- Categorize changes appropriately

### **4. CI/CD Integration**

- Test version workflows in CI
- Use affected package detection
- Automate version deployment
- Monitor version workflow success

## 🔧 Configuration

### **Package.json Scripts**

```json
{
  "scripts": {
    "version:prepare": "bun run scripts/version-prepare.ts",
    "version:apply": "bun run scripts/version-apply.ts",
    "version:ci": "bun run scripts/version-ci.ts",
  }
}
```

### **Environment Variables**

```bash
# Required for CI
GITHUB_TOKEN=your_github_token
TURBO_TOKEN=your_turbo_token
TURBO_TEAM=your_turbo_team
```

### **Git Configuration**

```bash
# Configure git user for CI
git config --global user.name "GitHub Actions"
git config --global user.email "actions@github.com"
```

## 🚨 Troubleshooting

### **Common Issues**

1. **Version conflicts**: Review commit messages and use appropriate conventional commit types
2. **Git authentication**: Ensure proper token configuration in CI
3. **Changelog conflicts**: Review and resolve merge conflicts manually
4. **Package detection**: Check workspace configuration and package.json files

### **Debug Mode**

```bash
# Process specific package for testing
bun run scripts/version-prepare.ts --package root --dry-run

# Process all packages to see full output
bun run scripts/version-prepare.ts --dry-run

# Custom commit range for testing
bun run scripts/version-prepare.ts --from HEAD~5 --to HEAD --dry-run
```

### **Rollback**

```bash
# Reset to previous version
git reset --hard HEAD~1
git tag -d v1.2.3
git push origin :refs/tags/v1.2.3
```

---

*This versioning system provides a robust, automated approach to version management with entity-based architecture and comprehensive CI/CD integration. The interactive CLI features are currently in development.*