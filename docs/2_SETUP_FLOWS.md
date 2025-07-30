# 🔧 In-Depth Setup Flows

> **Advanced technical details and workflows for development environment setup**

This document provides detailed technical information about the setup flows, configuration options, and advanced usage patterns. For basic installation, see the [Installation Guide](./1_INSTALLATION_GUIDE.md).

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Environment Configuration Strategy](#-environment-configuration-strategy)
- [CI/CD Integration](#-cicd-integration)
- [Troubleshooting](#-troubleshooting)

## 🏗️ Architecture Overview

### **Setup Flow Architecture**

The project implements a layered setup architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Development Environment                  │
├─────────────────────────────────────────────────────────────┤
│  🔧 Local Development Layer (Required)                      │
│  ├── Dependencies (bun install)                             │
│  ├── Code Quality (biome, typescript)                       │
│  ├── Testing (jest, turbo)                                  │
│  └── Build System (turbo, vite)                             │
├─────────────────────────────────────────────────────────────┤
│  🐳 DevContainer Layer (Optional)                           │
│  ├── Docker Services (admin, storefront, api, ui)          │
│  ├── Development Tools (act, docker-compose)                │
│  └── Health Monitoring & Logging                            │
├─────────────────────────────────────────────────────────────┤
│  🎯 CI/CD Layer (Optional)                                  │
│  ├── GitHub Actions Testing (act)                           │
│  ├── Branch Validation (commitlint)                         │
│  └── Quality Gates (sonarqube)                              │
└─────────────────────────────────────────────────────────────┘
```

### **Command Hierarchy**

```bash
# Core Setup Commands
bun run local:setup      # Foundation layer (always required - from host)
# Go to the DevContainer and `bun run local:setup` again (;
bun run dev:setup        # Container layer (optional)

# Development Commands
bun run dev:up --build <app-name>
bun run dev:logs <app-name>
bun run dev:health <app-name>

# Verification Commands
bun run check:quick      # Quick verification
bun run dev:check        # Health verification
bun run ci:check         # CI layer (optional)

# Cleanup Commands
bun run dev:cleanup      # Container cleanup
bun run local:cleanup    # Complete cleanup
bun run dev:rm          # Container removal (from host)
```

#### **Performance Characteristics**
- **Dependency Installation**: ~5-10 seconds
- **Code Quality Checks**: ~10-20 seconds
- **Test Execution**: ~20-40 seconds
- **Build Process**: ~30-60 seconds
- **Total Runtime**: ~2-3 minutes (cold), ~1 minute (warm)

## 🔧 Environment Configuration Strategy

### **Docker Compose Environment Management**

**Root Environment Files**: Docker Compose uses root-level environment files with passed arguments:

```yaml
# docker-compose.yml (Production)
services:
  prod-admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    ports:
      - "5001:80"
    environment:
      - VITE_API_URL=http://api:5003
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]

# .devcontainer/docker-compose.dev.yml (Development)
services:
  admin:
    extends:
      service: apps
    ports:
      - "3001:3001"
    environment:
      PORT: "3001"
      HOST: "0.0.0.0"
      NODE_ENV: "development"
    command: bun run dev --filter=admin -- --host 0.0.0.0 --port 3001
```

**Key Configuration Points**:
- **Root `.env` file**: Used by Docker Compose for shared environment variables
- **Service-specific environment**: Each service defines its own PORT and HOST
- **HOST must be `0.0.0.0`**: Ensures container accessibility
- **PORT must be unique**: Prevents conflicts between services

### **Local Development Environment**

**Package-Level Environment Files**: Local development uses package-specific environment files:

```bash
# Local development structure
apps/admin/.env          # Admin app environment variables
apps/storefront/.env     # Storefront app environment variables  
apps/api/.env           # API app environment variables
packages/ui/.env        # UI package environment variables
```

**Local Development Configuration**:
- **HOST**: `0.0.0.0` (required for container accessibility)
- **PORT**: Unique per service (3001, 3002, 3003, 3004)
- **No hardcoded ports**: Docker Compose handles port mapping
- **Package-specific configs**: Each app manages its own environment

### **Port Configuration Strategy**

**Development Ports** (Docker Compose):
- **Admin**: 3001
- **Storefront**: 3002  
- **API**: 3003
- **UI (Storybook)**: 3004

**Production Ports** (Docker Compose):
- **Admin**: 5001
- **Storefront**: 5002
- **API**: 5003
- **UI**: 5006

**Conflict Prevention**:
- **Development**: 3001-3004 range
- **Production**: 5001-5006 range
- **No overlapping**: Clear separation between environments

## 🔄 CI/CD Integration

### **`bun run ci:check` - Local GitHub Actions Testing**

#### **Act Configuration**
```bash
# .act/actrc configuration
--image-size micro
--platform ubuntu-latest
--quiet
--secret-file .env
--reuse
--artifact-server-path /tmp/artifacts
```

#### **Workflow Testing Patterns**
```bash
# Test specific workflows
bun run ci:check -e pull_request -w .github/workflows/Check.yml
bun run ci:check -e push -w .github/workflows/Build.yml
bun run ci:check -e release -w .github/workflows/Deploy.yml

# Test with custom secrets
bun run ci:check -e pull_request -w .github/workflows/Check.yml --secret-file .env.local

# Test with verbose output
bun run ci:check -e pull_request -w .github/workflows/Check.yml --verbose
```

### **`bun run ci:branchname` - Branch Validation**

#### **Branch Naming Patterns**
```bash
# Supported patterns
feature/user-authentication               # ✅ Valid
bugfix/login-validation                  # ✅ Valid
hotfix/security-patch                    # ✅ Valid
release/v1.2.0                          # ✅ Valid

# Invalid patterns
feature/UserAuth                         # ❌ Invalid (uppercase)
bugfix/login validation                  # ❌ Invalid (space)
hotfix/security_patch                    # ❌ Invalid (underscore)
```

## 🛠️ Troubleshooting

### **Setup Debugging**
```bash
bun run local:setup --verbose --debug
bun run dev:setup --verbose --debug
```

### **Recovery Procedures**

#### **Complete Reset**
```bash
# Nuclear option - complete reset
bun run local:cleanup --force
bun run dev:rm --force
rm -rf node_modules package-lock.json
bun run local:setup --fresh
```

## 📚 Related Documentation

- [Installation Guide](./1_INSTALLATION_GUIDE.md) - Basic installation steps
- [Development Workflow](./3_DEV_FLOWS.md) - Daily development commands
- [Quality Checklist](./0_QUALITY_CHECKLIST.md) - Testing procedures
- [Docker Setup](./5_DOCKER.md) - Docker configuration

---

**💡 Pro Tip**: Use `bun run local:setup --help` and `bun run dev:setup --help` to see all available options for each command. 