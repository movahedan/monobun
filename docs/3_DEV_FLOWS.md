# 🔧 Development Flows

> **Daily development commands and processes for the Monobun monorepo**

## 📋 Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [Enhanced Script System](#-enhanced-script-system)
- [Development Workflows](#-development-workflows)
- [CI/CD Integration](#-cicd-integration)
- [Testing & Quality](#-testing--quality)
- [Documentation System](#-documentation-system)
- [Troubleshooting](#-troubleshooting)

## 🎯 Overview

The Monobun monorepo provides sophisticated development workflows built on:

- **🎮 Interactive CLI**: Step-by-step wizards with navigation and validation
- **🏗️ Entity Architecture**: Modular, reusable components for common operations
- **🔧 Enhanced Scripts**: Type-safe automation with comprehensive error handling
- **🧪 Automated Testing**: Comprehensive test coverage and quality checks
- **🚀 CI/CD Integration**: Seamless GitHub Actions integration
- **📚 Three-Tier Documentation**: Comprehensive documentation ecosystem

## 🚀 Quick Start

### **1. Setup Development Environment**

```bash
# Local development setup
bun run local:setup

# DevContainer setup (recommended)
bun run dev:setup
```

### **2. Start Development Services**

```bash
# Start all services
bun run dev:up

# Check service health
bun run dev:check

# View service logs
bun run dev:logs
```

### **3. Run Quality Checks**

```bash
# Quick quality check
bun run check:quick

# Full quality check
bun run check
```

## 🎮 Enhanced Script System

### **Interactive CLI Features**

The new interactive CLI system provides sophisticated user experience:

#### **Step-by-Step Wizards**
- Guided workflows with validation
- Progress tracking and completion status
- Smart navigation between steps
- Conditional step skipping

#### **Quick Actions**
- Keyboard shortcuts for common operations
- Context-aware help and preview
- Real-time validation feedback
- Error handling and recovery

#### **Usage Examples**

```bash
bun run dev:setup
bun run commit
bun run version:prepare
bun run version:apply
```

### **Entity-Based Architecture**

The script system uses modular, reusable components from the `@repo/intershell` package:

```
📁 packages/intershell/src/entities/
├── commit/              # 📝 Commit parsing and validation
├── changelog/           # 📋 Changelog generation
├── package-json/        # 📦 Package.json operations
├── workspace/           # 🗂️ Workspace management
├── compose/             # 🐳 Docker Compose parsing
├── affected/            # 🔍 Affected package detection
├── tag/                 # 🏷️ Git tag operations
└── packages/            # 📦 Package management
```

## 🔧 Development Workflows

### **1. Local Development Workflow**

```bash
# Setup local environment
bun run local:setup

# Install dependencies
bun install

# Run quality checks
bun run check:quick

# Start development
bun run dev
```

### **2. DevContainer Development Workflow**

```bash
# Setup DevContainer
bun run dev:setup

# Start services
bun run dev:up

# Verify health
bun run dev:check

# Development commands
bun run dev:logs      # View logs
bun run dev:restart   # Restart services
bun run dev:cleanup   # Clean up resources
```

### **3. Package Development Workflow**

```bash
# Work on specific package
cd packages/my-package

# Install dependencies
bun install

# Run tests
bun test

# Build package
bun run build

# Check types
bun run check:types
```

### **4. Version Management Workflow**

```bash
# Prepare changes
bun run scripts/version-prepare.ts
# Preview changes
bun run scripts/version-prepare.ts --dry-run
# Manual version preparation
bun run scripts/version-prepare.ts --package root
# Apply version changes
bun run scripts/version-apply.ts
```

## 🚀 CI/CD Integration

### **GitHub Actions Workflows**

#### **Check Workflow**
Automatically validates changes and determines affected packages:

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

#### **Version Workflow**
Handles automated versioning and deployment:

```yaml
- name: 📝 Generate changelog and bump versions
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

### **Service Port Management**

Automatically attaches service ports to GitHub Actions:

```bash
# Attach service ports
bun run scripts/ci-attach-service-ports.ts --output-id service-ports
```

### **Changelog Generation** 🆕

The changelog system now provides comprehensive commit tracking:

```bash
# Generate changelog for version range
bun run scripts/version-prepare.ts --package root --from v0.0.2 --to HEAD

# Generate changelog using version ranges (NEW!)
bun run scripts/version-prepare.ts --package root --from-version 0.0.2 --to-version 0.1.0

# Features:
# - PR commit detection and grouping
# - Individual commit inclusion in PR sections
# - Proper categorization by commit type
# - Support for both merge strategies
```

## 🧪 Testing & Quality

### **Quality Checks**

```bash
# Quick quality check (affected packages only)
bun run check:quick

# Full quality check
bun run check

# Fix linting issues
bun run check:fix

# Type checking
bun run check:types
```

### **Testing**

```bash
# Run all tests
bun test

# Run tests with coverage
bun test --coverage

# Run tests in watch mode
bun test --watch

# Test specific package
bun test packages/my-package
```

### **Build Verification**

```bash
# Build all packages
bun run build

# Build affected packages only
bun run build --affected

# Build specific package
bun run build --filter=my-package
```

## 🔍 Development Commands

### **Core Development Commands**

```bash
# Development setup
bun run dev:setup      # Setup DevContainer
bun run dev:up         # Start services
bun run dev:check      # Check service health
bun run dev:logs       # View service logs
bun run dev:restart    # Restart services
bun run dev:cleanup    # Clean up resources

# Local development
bun run local:setup    # Setup local environment
bun run local:cleanup  # Clean local resources
bun run local:vscode   # Setup VS Code

# Quality assurance
bun run check          # Full quality check
bun run check:quick    # Quick quality check
bun run check:fix      # Fix linting issues
bun run check:types    # Type checking
```

### **Advanced Scripts**

```bash
# Interactive commit creation
bun run commit

# Commit validation
bun run commit:check --staged
bun run commit:check --branch

# Version management
bun run version:prepare
bun run version:apply
bun run version:ci

# CI utilities
bun run ci:act
bun run scripts/ci-attach-affected.ts
bun run scripts/ci-attach-service-ports.ts
```

## 🐳 Docker & DevContainer

### **DevContainer Management**

```bash
# Setup DevContainer
bun run dev:setup

# Start services
bun run dev:up

# Check health
bun run dev:check

# View logs
bun run dev:logs

# Restart services
bun run dev:restart

# Cleanup
bun run dev:cleanup
```

### **Production Container Management**

```bash
# Start production services
bun run prod:up

# Check production health
bun run prod:health

# Build production images
bun run prod:build

# Stop production services
bun run prod:down
```

## 📚 Documentation System

The project now uses a comprehensive three-tier documentation structure:

### **1. CLAUDE.md Files** 📋
- **Location**: Root directory `CLAUDE.md` and each project/app `(packages|apps)/<package-name>/CLAUDE.md`
- **Purpose**: Project-level architecture and main description
- **Audience**: Developers, architects, project stakeholders
- **Content**: High-level architecture, project structure, key decisions

### **2. Cursor Rules (.cursor/rules/)** ⚙️
- **Location**: `.cursor/rules/` directory
- **Purpose**: Generic development best practices, documentation standards, commit workflow
- **Audience**: AI assistants, development tools, automated processes
- **Content**: Coding standards, workflow rules, automation guidelines

### **3. Developer Documentation (docs/)** 👨‍💻
- **Location**: `docs/` directory
- **Purpose**: Developer guides, setup instructions, technical details
- **Audience**: Human developers, team members
- **Content**: Brief, summarized, clear, friendly, and enjoyable to read

### **Documentation Standards**

All documentation follows comprehensive standards including:
- **File Naming**: Numbered prefixes for ordered developer documentation
- **Structure**: Consistent headers, table of contents, and cross-references
- **Content**: Technical accuracy, complete examples, and troubleshooting sections
- **Maintenance**: Regular updates with each major release

## 🔧 Troubleshooting

### **Common Issues**

#### **Service Health Problems**
```bash
# Check service status
bun run dev:health

# View detailed logs
bun run dev:logs

# Restart services
bun run dev:restart

# Clean up and restart
bun run dev:cleanup && bun run dev:setup
```

#### **Quality Check Failures**
```bash
# Fix linting issues
bun run check:fix

# Check specific issues
bun run check:types
bun run check

# Run tests to identify problems
bun test
```

#### **Build Failures**
```bash
# Clean build artifacts
bun run build --force

# Check specific package
bun run build --filter=problematic-package

# Verify dependencies
bun install
```

### **Debug Mode**

```bash
# Skip health checks
bun run dev:setup --skip-health-check

# Dry run to preview changes
bun run version:prepare --dry-run

# Check affected packages
bun run scripts/ci-attach-affected.ts --mode turbo
```

### **Reset & Recovery**

```bash
# Reset DevContainer
bun run dev:cleanup
bun run dev:setup

# Reset local environment
bun run local:cleanup
bun run local:setup

# Reset specific service
bun run dev:compose restart service-name
```

## 📋 Best Practices

### **1. Development Workflow**

- Use DevContainer for consistent environments
- Run quality checks before committing
- Test changes locally before pushing
- Use interactive CLI for complex operations

### **2. Version Management**

- Let the system determine version bumps automatically
- Review changelogs before applying versions
- Use dry-run mode to preview changes
- Test version workflows in CI

### **3. Quality Assurance**

- Run quality checks frequently
- Fix linting issues immediately
- Maintain good test coverage
- Use affected package detection for efficiency

### **4. CI/CD Integration**

- Test workflows locally with `ci:act`
- Use affected package detection
- Monitor workflow success
- Automate repetitive tasks

---

*This enhanced development system provides a robust, automated approach to development workflows with sophisticated CLI interaction and comprehensive CI/CD integration.* 

**Ready to start developing?** Follow this workflow for efficient, quality-focused development in the Monobun monorepo! 🚀 