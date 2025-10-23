# ⚡ Setup Flows

> **Comprehensive setup workflows for the Monobun monorepo with enhanced automation and interactive CLI**

## 📋 Table of Contents

- [Overview](#-overview)
- [Quick Setup](#-quick-setup)
- [Enhanced Setup System](#-enhanced-setup-system)
- [Local Development Setup](#-local-development-setup)
- [DevContainer Setup](#-devcontainer-setup)
- [VS Code Setup](#-vs-code-setup)
- [Environment Verification](#-environment-verification)
- [Troubleshooting](#-troubleshooting)

## 🎯 Overview

The Monobun monorepo provides sophisticated setup workflows built on:

- **🎮 Interactive CLI**: Step-by-step setup wizards with validation
- **🏗️ Entity Architecture**: Modular, reusable components for environment setup
- **🔧 Enhanced Scripts**: Type-safe automation with comprehensive error handling
- **🐳 Docker Integration**: Seamless containerized development environments
- **🚀 CI/CD Ready**: Production-ready development environments

## 🚀 Quick Setup

### **Option 1: DevContainer (Recommended)**

```bash
# Clone repository
git clone https://github.com/movahedan/monobun.git
cd monobun

# Open in VS Code DevContainer
# Ctrl+Shift+P → Dev Containers: Reopen in Container

# Setup DevContainer environment
bun run dev:setup

# Start services
bun run dev:up

# Verify setup
bun run dev:check
```

### **Option 2: Local Development**

```bash
# Clone repository
git clone https://github.com/movahedan/monobun.git
cd monobun

# Setup local environment
bun run local:setup

# Install dependencies
bun install

# Verify setup
bun run check:quick
```

## 🎮 Enhanced Setup System

### **Interactive Setup Features**

The new setup system provides sophisticated user experience:

#### **Step-by-Step Wizards**
- Guided environment setup with validation
- Progress tracking and completion status
- Smart dependency detection and resolution
- Conditional setup steps based on environment

#### **Automated Environment Detection**
- Automatic OS and architecture detection
- Dependency version compatibility checking
- Environment-specific configuration
- Error handling and recovery

#### **Setup Validation**
- Comprehensive environment verification
- Health checks for all services
- Dependency validation
- Performance benchmarking

### **Entity-Based Architecture**

The setup system uses modular, reusable components:

```
📁 packages/intershell/src/entities/
├── compose.ts           # 🐳 Docker Compose parsing and validation
├── workspace.ts         # 🗂️ Workspace package discovery
├── package-json.ts      # 📦 Package.json operations
└── affected.ts          # 🔍 Affected package detection
```

## 🔧 Local Development Setup

### **1. Prerequisites**

```bash
# Install Bun (if not already installed)
# macOS/Linux:
curl -fsSL https://bun.com/install | bash

# Windows (PowerShell):
# powershell -c "irm bun.sh/install.ps1|iex"

# Verify installation
bun --version
```

### **2. Repository Setup**

```bash
# Clone repository
git clone https://github.com/movahedan/monobun.git
cd monobun

# Setup local environment
bun run local:setup
```

### **3. Dependencies Installation**

```bash
# Install all dependencies
bun install

# Verify installation
bun run check:types
```

### **4. Environment Verification**

```bash
# Quick quality check
bun run check:quick

# Full quality check
bun run check

# Run tests
bun test
```

## 🐳 DevContainer Setup

### **1. Prerequisites**

```bash
# Install Docker Desktop
# https://www.docker.com/products/docker-desktop/

# Install VS Code
# https://code.visualstudio.com/

# Install Dev Containers extension
# Extensions → Dev Containers
```

### **2. Repository Setup**

```bash
# Clone repository
git clone https://github.com/movahedan/monobun.git
cd monobun

# Open in VS Code
code .
```

### **3. DevContainer Setup**

```bash
# Press Ctrl+Shift+P (or Cmd+Shift+P on macOS)
# Type: Dev Containers: Reopen in Container
# Select the command and wait for container to build
```

### **4. Environment Setup**

```bash
# Setup DevContainer environment
bun run dev:setup

# Start all services
bun run dev:up

# Verify setup
bun run dev:check
```

### **5. Service Management**

```bash
# View service status
bun run dev:health

# View service logs
bun run dev:logs

# Restart services
bun run dev:restart

# Clean up resources
bun run dev:cleanup
```

## 💻 VS Code Setup

### **1. Extensions Installation**

The setup automatically installs recommended extensions:

- **Dev Containers**: Containerized development environments
- **TypeScript**: TypeScript language support
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **GitLens**: Git integration
- **Thunder Client**: API testing

### **2. Workspace Configuration**

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### **3. Task Configuration**

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Setup DevContainer",
      "type": "shell",
      "command": "bun run dev:setup",
      "group": "build"
    },
    {
      "label": "Start Services",
      "type": "shell",
      "command": "bun run dev:up",
      "group": "build"
    }
  ]
}
```

## 🔍 Environment Verification

### **1. Health Checks**

```bash
# DevContainer health check
bun run dev:check

# Local environment check
bun run check:quick

# Full system check
bun run check
```

### **2. Service Verification**

```bash
# Check service status
bun run dev:health

# Verify ports
netstat -tulpn | grep :300

# Test connectivity
curl http://localhost:3001  # Admin
curl http://localhost:3002  # Storefront
curl http://localhost:3003  # API
curl http://localhost:3004  # UI Storybook
```

### **3. Dependency Verification**

```bash
# Check package versions
bun run check:types

# Verify workspace packages
bun run build --affected

# Test package functionality
bun test
```

## 🚀 Advanced Setup Options

### **1. Custom Environment Configuration**

```bash
# Skip specific steps
bun run local:setup --skip-vscode --skip-tests

# Skip health checks
bun run dev:setup --skip-health-check
```

### **2. Selective Service Setup**

```bash
# Skip health checks
bun run dev:setup --skip-health-check

# Skip specific steps
bun run local:setup --skip-vscode --skip-tests
```

### **3. Performance Optimization**

```bash
# Skip specific steps
bun run local:setup --skip-vscode --skip-tests

# Skip health checks
bun run dev:setup --skip-health-check
```

## 🔧 Troubleshooting

### **Common Issues**

#### **DevContainer Issues**
```bash
# Container won't start
bun run dev:cleanup
bun run dev:setup

# Port conflicts
bun run dev:health
# Check docker-compose.dev.yml for port mappings

# Build failures
bun run dev:build
docker system prune -f
```

#### **Local Setup Issues**
```bash
# Dependency issues
bun install --force
rm -rf node_modules bun.lockb
bun install

# Permission issues
sudo chown -R $USER:$USER .
# CLI commands are now available via package.json scripts

# Cache issues
bun run check:fix && bun run check:types --affected
```

#### **VS Code Issues**
```bash
# Extension problems
# Reload VS Code window
# Ctrl+Shift+P → Developer: Reload Window

# DevContainer issues
# Ctrl+Shift+P → Dev Containers: Rebuild Container
```

### **Debug Mode**

```bash
# Skip specific steps
bun run local:setup --skip-vscode --skip-tests
bun run dev:setup --skip-health-check

# Skip specific steps
bun run local:setup --skip-vscode --skip-tests
bun run dev:setup --skip-health-check
```

### **Reset & Recovery**

```bash
# Reset DevContainer
bun run dev:cleanup
bun run dev:setup

# Reset local environment
bun run local:cleanup
bun run local:setup

# Reset VS Code
# Ctrl+Shift+P → Dev Containers: Rebuild Container
```

## 📋 Best Practices

### **1. Environment Setup**

- Use DevContainer for consistent development environments
- Run setup verification after environment changes
- Keep dependencies up to date
- Use environment-specific configurations

### **2. Service Management**

- Start with minimal services and add as needed
- Monitor service health regularly
- Use cleanup commands to free resources
- Restart services when configuration changes

### **3. Troubleshooting**

- Check logs first for error details
- Use health check commands for diagnostics
- Reset environments when problems persist
- Document custom configurations

### **4. Performance**

- Use affected package detection for efficiency
- Optimize Docker resource allocation
- Cache dependencies appropriately
- Monitor resource usage

---

*This enhanced setup system provides a robust, automated approach to environment configuration with sophisticated CLI interaction and comprehensive validation.* 