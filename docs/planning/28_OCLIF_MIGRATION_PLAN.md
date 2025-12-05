# 🗂️ Archived: OCLIF Migration Plan (internal InterShell)

> This document covered migrating internal scripts into an internal InterShell package. InterShell now lives as an external published package and internal implementation details here are no longer applicable. Use the repository scripts as documented in the main docs.

## 📋 Table of Contents

- [Overview](#-overview)
- [Migration Strategy](#-migration-strategy)
- [Command Structure](#-command-structure)
- [Implementation Phases](#-implementation-phases)
- [Next Steps](#-next-steps)

## 🎯 Overview

Migrate all scripts from `scripts/` folder to OCLIF-based commands in the `packages/intershell` package. This enables:
- **3+ level nested commands** (e.g., `intershell dev:setup:docker`)
- **Type-safe command options** with full TypeScript support
- **Plugin system** for extensibility
- **Automatic help generation** for all commands
- **Better testing** with built-in utilities

## 🏗️ Migration Strategy

### **Current Scripts to Migrate**
- **Dev Scripts**: `dev-setup`, `dev-cleanup`, `dev-check`, `dev-rm`
- **Local Scripts**: `local-setup`, `local-cleanup`, `local-vscode`
- **CI Scripts**: `ci-act`, `ci-attach-affected`, `ci-attach-service-ports`
- **Version Scripts**: `version-prepare`, `version-apply`, `version-ci`
- **Git Scripts**: `commit`, `commit-check`, `update-package-json`

### **New Command Structure**
```
intershell/
├── src/commands/
│   ├── dev/
│   │   ├── setup.ts          # intershell dev:setup
│   │   ├── cleanup.ts        # intershell dev:cleanup
│   │   ├── check.ts          # intershell dev:check
│   │   └── rm.ts             # intershell dev:rm
│   ├── local/
│   │   ├── setup.ts          # intershell local:setup
│   │   ├── cleanup.ts        # intershell local:cleanup
│   │   └── vscode.ts         # intershell local:vscode
│   ├── ci/
│   │   ├── act.ts            # intershell ci:act
│   │   ├── attach-affected.ts # intershell ci:attach-affected
│   │   └── attach-service-ports.ts # intershell ci:attach-service-ports
│   ├── version/
│   │   ├── prepare.ts        # intershell version:prepare
│   │   ├── apply.ts          # intershell version:apply
│   │   └── ci.ts             # intershell version:ci
│   ├── commit.ts             # intershell commit
│   ├── commit-check.ts       # intershell commit-check
│   └── update-package-json.ts # intershell update-package-json
```

## 📊 Implementation Phases

### **Phase 1: OCLIF Setup** - ✅ COMPLETED
- [x] Install OCLIF dependencies (`@oclif/core`, `@oclif/plugin-help`, `@oclif/plugin-version`)
- [x] Create `oclif.manifest.json` configuration
- [x] Update `package.json` with OCLIF config
- [x] Create main entry point (`src/index.ts`)

### **Phase 2: Local Commands** - ✅ COMPLETED
- [x] Migrate `local-cleanup.ts` → `commands/local/cleanup.ts`
- [x] Migrate `local-setup.ts` → `commands/local/setup.ts`
- [x] Migrate `local-vscode.ts` → `commands/local/vscode.ts`
- [x] Test all local commands

### **Phase 3: Dev Commands** - ✅ COMPLETED
- [x] Migrate `dev-setup.ts` → `commands/dev/setup.ts`
- [x] Migrate `dev-cleanup.ts` → `commands/dev/cleanup.ts`
- [x] Migrate `dev-check.ts` → `commands/dev/check.ts`
- [x] Migrate `dev-rm.ts` → `commands/dev/rm.ts`

### **Phase 4: CI Commands** - ✅ COMPLETED
- [x] Migrate `ci-act.ts` → `commands/ci/act.ts`
- [x] Migrate `ci-attach-affected.ts` → `commands/ci/attach-affected.ts`
- [x] Migrate `ci-attach-service-ports.ts` → `commands/ci/attach-service-ports.ts`

### **Phase 5: Version Commands** - ✅ COMPLETED
- [x] Migrate `version-prepare.ts` → `commands/version/prepare.ts`
- [x] Migrate `version-apply.ts` → `commands/version/apply.ts`
- [x] Migrate `version-ci.ts` → `commands/version/ci.ts`

### **Phase 6: Git Commands** - ✅ COMPLETED
- [x] Migrate `commit.ts` → `commands/commit.ts`
- [x] Migrate `commit-check.ts` → `commands/commit-check.ts`
- [x] Migrate `update-package-json.ts` → `commands/update-package-json.ts`

### **Phase 7: Cleanup & Documentation** ✅ COMPLETED
- [x] Remove old `scripts/` folder
- [x] Update documentation
- [x] Update CI/CD workflows
- [x] Update package.json scripts

## 🎉 Migration Complete! All Phases Successfully Migrated!

**✅ ALL PHASES COMPLETED** - OCLIF migration fully successful! All 6 phases completed with 20+ commands migrated.

### **What's Working:**
- ✅ OCLIF CLI framework installed and configured
- ✅ All local commands migrated and tested:
  - `intershell local:cleanup` - Comprehensive cleanup
  - `intershell local:setup` - Local development setup  
  - `intershell local:vscode` - VS Code configuration sync
- ✅ All dev commands migrated and tested:
  - `intershell dev:setup` - DevContainer environment setup
  - `intershell dev:cleanup` - DevContainer cleanup
  - `intershell dev:check` - Health check with monitoring
  - `intershell dev:rm` - VS Code DevContainer removal
- ✅ All CI commands migrated and tested:
  - `intershell ci:act` - GitHub Actions local testing
  - `intershell ci:attach-affected` - Attach affected services to GitHub Actions
  - `intershell ci:attach-service-ports` - Attach service ports to GitHub Actions
- ✅ All version commands migrated and tested:
  - `intershell version:prepare` - Prepare version bumps and generate changelogs
  - `intershell version:apply` - Create git version tags and commit changes
  - `intershell version:ci` - Complete CI versioning workflow
- ✅ All git commands migrated and tested:
  - `intershell commit` - Execute git commit with provided message
  - `intershell commit-check` - Comprehensive commit validation
  - `intershell update-package-json` - Update package.json exports
- ✅ Type-safe command options with full TypeScript support
- ✅ Automatic help generation working
- ✅ 3+ level nested commands supported
- ✅ Complete CLI transformation achieved!

### **Migration Status:**
- **Phase 1**: OCLIF Setup ✅
- **Phase 2**: Local Commands ✅  
- **Phase 3**: Dev Commands ✅
- **Phase 4**: CI Commands ✅
- **Phase 5**: Version Commands ✅
- **Phase 6**: Git Commands ✅
- **Phase 7**: Cleanup & Documentation (next)

## 📝 Next Steps

1. **Phase 7: Cleanup & Documentation** - Remove old scripts folder and update documentation
2. **Update CI/CD workflows** - Update workflows to use new CLI commands
3. **Update package.json scripts** - Replace old script references with new CLI commands
4. **Final testing** - Comprehensive testing of all migrated commands

## 🔧 Technical Details

### **OCLIF Dependencies**
```bash
bun add @oclif/core @oclif/plugin-help @oclif/plugin-version
bun add -D @oclif/cli @oclif/dev-cli
```

### **Example Command Migration**
```typescript
// Before: scripts/local-cleanup.ts
import { createScript } from "@repo/intershell/core"

// After: src/commands/local/cleanup.ts
import { Command, Flags } from '@oclif/core'
import { colorify } from '@repo/intershell/core'

export default class LocalCleanup extends Command {
  static description = 'Comprehensive cleanup of Docker containers...'
  static flags = {
    verbose: Flags.boolean({ char: 'v', description: 'Enable verbose output' })
  }
  
  async run(): Promise<void> {
    // Command logic here
  }
}
```

---

**This migration will transform the current script-based approach into a modern, type-safe CLI framework with nested commands and better developer experience.**
