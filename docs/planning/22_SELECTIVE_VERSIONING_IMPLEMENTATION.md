# 🎯 Selective Versioning Implementation Plan

> **Implementation plan for selective versioning strategy: version only root + specific packages, bump when internal deps change**

## 📋 Table of Contents

- [Overview](#-overview)
- [Current Implementation Analysis](#-current-implementation-analysis)
- [Required Changes](#-required-changes)
- [Implementation Steps](#-implementation-steps)
- [Configuration Changes](#-configuration-changes)
- [Testing Strategy](#-testing-strategy)
- [Migration Plan](#-migration-plan)
- [Future Considerations](#-future-considerations)

## 🎯 Overview

**Goal**: Implement selective versioning as part of the multiple tag series support system. Only packages with `"private": false` or no `private` field get versions, while packages with `"private": true` remain unversioned. This enables independent versioning for different components with their own tag series.

**Key Changes**:
1. **Selective Versioning**: Only version packages that might be published externally (based on `private` field)
2. **Multiple Tag Series**: Enable independent versioning with series like `v*` (root), `ui-v*`, `admin-v*`, etc.
3. **Dependency-Aware Bumping**: Root version bumps when internal deps change
4. **Changelog Preservation**: Keep existing changelog system unchanged
5. **Tag Series Strategy**: Each versioned package gets its own tag series, unversioned packages don't

## 🔍 Current Implementation Analysis

### **Current Versioning Behavior**
- **All packages get versions** via `EntityPackages.getAllPackages()`
- **Independent versioning** - each package has its own version number
- **Package-specific changelogs** - each package generates its own changelog
- **Root package** currently at version `0.1.2`

### **Current Architecture**
```typescript
// scripts/version-prepare.ts
const packagesToProcess = await EntityPackages.getAllPackages();
// Processes ALL packages: root, @repo/ui, @repo/intershell, apps/*, packages/*

// packages/intershell/src/entities/packages/packages.ts
static async getAllPackages(): Promise<string[]> {
  const packages: string[] = ["root"];
  // Adds all apps/* and packages/* with valid package.json
}
```

### **Current Changelog System**
- **Template-based** changelog generation
- **Package-specific** changelog files
- **Version-aware** changelog merging
- **PR-based** commit grouping

## 🚀 Required Changes

### **1. Package Versioning Strategy**

#### **Versioned Packages** (Keep versions)
- Packages with `"private": false` or no `private` field
- Examples: `root`, `@repo/intershell`

#### **Unversioned Packages** (Remove versions)
- Packages with `"private": true` in package.json
- Examples: `@repo/admin`, `@repo/storefront`, `@repo/api`, `@repo/docs-astro`, `@repo/test-preset`, `@repo/typescript-config`, `@repo/ui`, `@repo/utils`

### **2. Version Bumping Logic**

#### **Root Package Bumping Rules**
```typescript
// Root version MUST bump when:
- Any internal package changes: patch
- Any app-level changes: if breaking: minor, or else patch
- Any workspace-level changes: if breaking: major, else if fix or feat or refactor: minor, or else: patch
- Any dependency updates: patch
```

#### **Selective Package Bumping Rules**
```typescript
// @repo/intershell bumps when:
- Their own source code changes: if breaking: major, if fix feat refactor: minor, else patch
- Breaking changes in their dependencies: if breaking: minor, else patch
```

### **3. Changelog Generation Strategy**

#### **Root Changelog**
- **Comprehensive coverage** of all changes across the monorepo
- **No categorization** - commits sorted by time only
- **PR section** - PR commits grouped together but sorted with other commits by time
- **Tag series**: Uses `v*` series (v1.0.0, v1.1.0, v2.0.0)

#### **Selective Package Changelogs**
- **Self-contained** changelogs for versioned packages
- **No categorization** - commits sorted by time only
- **PR section** - PR commits grouped together but sorted with other commits by time
- **Tag series**: Each versioned package gets its own series (e.g., `ui-v*`, `admin-v*`)

### **4. Tag Series Strategy**

#### **Versioned Packages Get Tag Series**
- **Root package**: `v*` series (v1.0.0, v1.1.0, v2.0.0)
- **@repo/intershell**: `intershell-v*` series (intershell-v1.0.0, intershell-v1.1.0)
- **Future packages**: `package-name-v*` series when they become versioned

#### **Unversioned Packages No Tag Series**
- **@repo/admin**: No version, no tag series
- **@repo/ui**: No version, no tag series
- **@repo/utils**: No version, no tag series

## 🛠️ Implementation Steps

### **Phase 1: Package Classification System**

#### **1.1 Use Package.json Private Field**
```typescript
// packages/intershell/src/entities/packages/packages.ts
export class EntityPackages {
  // ... existing code ...

  shouldVersion(): boolean {
    const packageJson = this.readJson();
    // Package should be versioned if private is false or undefined
    return packageJson.private !== true;
  }

  getTagSeriesName(): string | null {
    if (!this.shouldVersion()) return null;
    
    // Generate tag series name based on package name
    if (this.packageName === 'root') return 'v';
    return `${this.packageName.replace('@repo/', '')}-v`;
  }

  static async getVersionedPackages(): Promise<string[]> {
    const allPackages = await this.getAllPackages();
    const versionedPackages: string[] = [];
    
    for (const packageName of allPackages) {
      const packageInstance = new EntityPackages(packageName);
      if (packageInstance.shouldVersion()) {
        versionedPackages.push(packageName);
      }
    }
    
    return versionedPackages;
  }

  static async getUnversionedPackages(): Promise<string[]> {
    const allPackages = await this.getAllPackages();
    const unversionedPackages: string[] = [];
    
    for (const packageName of allPackages) {
      const packageInstance = new EntityPackages(packageName);
      if (!packageInstance.shouldVersion()) {
        unversionedPackages.push(packageName);
      }
    }
    
    return unversionedPackages;
  }
}
```

### **Phase 2: Create EntityVersion and Reorganize Responsibilities**

#### **2.1 Create EntityVersion Entity**
```typescript
// packages/intershell/src/entities/version/version.ts
export class EntityVersion {
  constructor(private packageName: string) {}

  // Version calculation and management
  async getCurrentVersion(): Promise<string> {
    const packageInstance = new EntityPackages(this.packageName);
    return packageInstance.readVersion();
  }

  async getNextVersion(bumpType: 'major' | 'minor' | 'patch'): Promise<string> {
    const currentVersion = await this.getCurrentVersion();
    return this.calculateNextVersion(currentVersion, bumpType);
  }

  private calculateNextVersion(currentVersion: string, bumpType: 'major' | 'minor' | 'patch'): string {
    const [major, minor, patch] = currentVersion.split(".").map(Number);
    if (Number.isNaN(major) || Number.isNaN(minor) || Number.isNaN(patch)) {
      throw new Error(`Invalid version: ${currentVersion}`);
    }

    switch (bumpType) {
      case "major": return `${major + 1}.0.0`;
      case "minor": return `${major}.${minor + 1}.0`;
      case "patch": return `${major}.${minor}.${patch + 1}`;
      default: throw new Error(`Invalid bump type: ${bumpType}`);
    }
  }

  // Version history and tracking
  async getVersionHistory(): Promise<VersionHistory> {
    const tagSeries = await this.getTagSeries();
    return {
      packageName: this.packageName,
      versions: tagSeries.versions,
      latestVersion: tagSeries.latestVersion
    };
  }

  async getLatestVersion(): Promise<string | null> {
    const history = await this.getVersionHistory();
    return history.latestVersion || null;
  }

  async versionExists(version: string): Promise<boolean> {
    const history = await this.getVersionHistory();
    return history.versions.some(v => v.version === version);
  }

  // Version bump type calculation (moved from EntityChangelog)
  async calculateBumpType(commits: ParsedCommitData[]): Promise<VersionBumpType> {
    if (this.packageName === 'root') {
      return await this.calculateRootBumpType(commits);
    }
    return await this.calculatePackageBumpType(commits);
  }

  private async calculateRootBumpType(commits: ParsedCommitData[]): Promise<VersionBumpType> {
    // Check for workspace-level breaking changes
    const hasWorkspaceBreaking = commits.some(c => 
      c.message.isBreaking && this.isWorkspaceLevelCommit(c)
    );
    if (hasWorkspaceBreaking) return 'major';

    // Check for app-level breaking changes
    const hasAppBreaking = commits.some(c => 
      c.message.isBreaking && this.isAppLevelCommit(c)
    );
    if (hasAppBreaking) return 'minor';

    // Check for features, fixes, or refactors
    const hasSignificantChanges = commits.some(c => 
      ['feat', 'fix', 'refactor'].includes(c.message.type) && this.isWorkspaceLevelCommit(c)
    );
    if (hasSignificantChanges) return 'minor';

    // Check for any internal changes (force patch bump)
    const hasInternalChanges = await this.hasInternalDependencyChanges();
    if (hasInternalChanges) return 'patch';

    return 'none';
  }

  private async calculatePackageBumpType(commits: ParsedCommitData[]): Promise<VersionBumpType> {
    // Package-specific bump type calculation
    let hasBreaking = false;
    let hasFeature = false;
    
    for (const commit of commits) {
      if (commit.message.isBreaking) hasBreaking = true;
      if (commit.message.type === "feat") hasFeature = true;
    }

    if (hasBreaking) return "major";
    if (hasFeature) return "minor";
    return "patch";
  }

  private isWorkspaceLevelCommit(commit: ParsedCommitData): boolean {
    return commit.files?.some(file => 
      file.startsWith('.') || 
      file.includes('turbo.json') || 
      file.includes('package.json') ||
      file.includes('docker-compose')
    ) ?? false;
  }

  private isAppLevelCommit(commit: ParsedCommitData): boolean {
    return commit.files?.some(file => 
      file.startsWith('apps/') || 
      file.includes('src/app/')
    ) ?? false;
  }

  private async hasInternalDependencyChanges(): Promise<boolean> {
    // Simple check: if any internal packages changed, root should bump
    // This replaces the complex dependency analyzer
    return true; // For now, always assume internal changes require root bump
  }

  // Tag series integration
  private async getTagSeries(): Promise<TagSeries> {
    const tagSeriesManager = new TagSeriesManager();
    return await tagSeriesManager.getTagSeries(this.packageName);
  }
}

// packages/intershell/src/entities/version/types.ts
export interface VersionHistory {
  packageName: string;
  versions: TagVersion[];
  latestVersion: string;
}

export type VersionBumpType = "major" | "minor" | "patch" | "none";
```

#### **2.2 Refactor EntityTag - Move Version-Related Methods to EntityVersion**
```typescript
// Current EntityTag has mixed responsibilities:
// 1. Git tag operations (create, delete, list, validate) - KEEP in EntityTag
// 2. Version management (history, calculation, bump types) - MOVE to EntityVersion
// 3. Package version tracking - MOVE to EntityVersion

// REFACTOR: Clean up EntityTag to focus only on git operations
// packages/intershell/src/entities/tag/tag.ts
export const EntityTag = {
  // KEEP: Core git tag operations
  parseByName(tagName: string): ParsedTag { /* ... */ },
  validate(tag: string | ParsedTag): TagValidationResult { /* ... */ },
  getPrefix(): string { /* ... */ },
  async createTag(tagName: string, message: string, options: {}): Promise<void> { /* ... */ },
  async deleteTag(tagName: string, deleteRemote: boolean): Promise<void> { /* ... */ },
  async tagExists(tagName: string): Promise<boolean> { /* ... */ },
  async listTags(prefix: string): Promise<string[]> { /* ... */ },
  async getTagInfo(tagName: string): Promise<{ date: string; message: string }> { /* ... */ },

  // NEW: Support multiple prefixes per package
  getPrefixForPackage(packageName: string): string {
    const packageInstance = new EntityPackages(packageName);
    return packageInstance.getTagSeriesName() || 'v';
  },

  // NEW: List tags for specific package series
  async listTagsForPackage(packageName: string): Promise<string[]> {
    const prefix = this.getPrefixForPackage(packageName);
    return await this.listTags(prefix);
  },

  // REFACTOR: Update getBaseTagSha to support package-specific prefixes
  async getBaseTagShaForPackage(packageName: string, from?: string): Promise<string> {
    if (!from) {
      const prefix = this.getPrefixForPackage(packageName);
      const tag = await this._getBaseTag(prefix);
      if (tag) return tag;
      return await this._getFirstCommit();
    }
    // ... rest of existing logic ...
  },

  // REFACTOR: Update getTagsInRange to support package-specific prefixes
  async getTagsInRangeForPackage(
    packageName: string,
    from: string,
    to: string
  ): Promise<Array<{ tag: string; previousTag?: string }>> {
    const prefix = this.getPrefixForPackage(packageName);
    const allTags = await this.listTags(prefix);
    // ... rest of existing logic ...
  },

  // REMOVE: These methods move to EntityVersion
  // - getPackageVersionHistory()
  // - getPackageVersionAtTag()
  // - getLatestPackageVersionInHistory()
  // - packageVersionExistsInHistory()
  // - compareVersions()
  // - getVersionFromTag()
};
```

#### **2.2 Integrate with Tag Series System**
```typescript
// packages/intershell/src/entities/tag/tag-series.ts
export interface TagSeries {
  name: string;                    // 'v', 'intershell-v', 'ui-v'
  pattern: string;                 // 'v*', 'intershell-v*', 'ui-v*'
  latestVersion: string;           // 'v2.1.0', 'intershell-v1.1.0'
  versions: TagVersion[];
  packageName: string;             // 'root', '@repo/intershell', '@repo/ui'
}

export interface TagVersion {
  tag: string;                     // 'v2.1.0', 'intershell-v1.1.0'
  version: string;                 // '2.1.0', '1.1.0'
  commit: string;                  // Commit hash
  date: Date;
  message: string;
}

// packages/intershell/src/entities/tag/tag-series-manager.ts
export class TagSeriesManager {
  async createTagSeries(packageName: string): Promise<TagSeries> {
    const packageInstance = new EntityPackages(packageName);
    const seriesName = packageInstance.getTagSeriesName();
    
    if (!seriesName) {
      throw new Error(`Package ${packageName} cannot have tag series (private package)`);
    }
    
    // Create or update tag series for this package
    return await this.initializeTagSeries(seriesName, packageName);
  }

  async getNextVersion(packageName: string, bumpType: 'major' | 'minor' | 'patch'): Promise<string> {
    const series = await this.getTagSeries(packageName);
    const currentVersion = series.latestVersion;
    
    // Calculate next version based on bump type
    return this.calculateNextVersion(currentVersion, bumpType);
  }
}
```

#### **2.3 Update EntityChangelog to Use EntityVersion**
```typescript
// packages/intershell/src/entities/changelog/changelog.ts
export class EntityChangelog {
  private async calculateVersionData(
    currentVersion: string, 
    commits: ParsedCommitData[]
  ): Promise<VersionData> {
    // ... existing logic ...

    // REFACTOR: Use EntityVersion for bump type calculation
    const entityVersion = new EntityVersion(this.packageName);
    bumpType = await entityVersion.calculateBumpType(commits);

    // ... rest of existing logic ...
  }

  // REMOVE: All version calculation methods moved to EntityVersion
  // - calculateRootBumpType()
  // - calculatePackageBumpType()
  // - isWorkspaceLevelCommit()
  // - isAppLevelCommit()
  // - checkInternalDependencyChanges()
}
```

### **Phase 3: Update Version Preparation Script**

#### **3.1 Modify version-prepare.ts**
```typescript
// scripts/version-prepare.ts
export const versionPrepare = createScript(scriptConfig, async function main(args, xConsole) {
  // ... existing setup code ...

  let packagesToProcess: string[] = [];

  if (processAll) {
    xConsole.info("📦 Processing versioned packages in workspace...");
    // CHANGE: Only process packages that should be versioned
    packagesToProcess = await EntityPackages.getVersionedPackages();
    xConsole.info(`Found ${packagesToProcess.length} versioned packages: ${packagesToProcess.join(", ")}`);
  } else {
    // ... existing single package logic ...
  }

  // REFACTOR: Use EntityVersion for version calculations
  for (const packageName of packagesToProcess) {
    const entityVersion = new EntityVersion(packageName);
    const commits = await getCommitsInRange(fromCommit, toCommit);
    const bumpType = await entityVersion.calculateBumpType(commits);
    
    if (bumpType !== 'none') {
      const nextVersion = await entityVersion.getNextVersion(bumpType);
      xConsole.info(`📦 ${packageName}: ${bumpType} bump to ${nextVersion}`);
    }
  }

  // ... rest of existing logic ...
});
```

#### **3.2 Update Tag Creation for Multiple Series**
```typescript
// scripts/version-apply.ts
export const versionApply = createScript(scriptConfig, async function main(args, xConsole) {
  // ... existing setup code ...

  // REFACTOR: Create tags for each versioned package with appropriate prefix
  for (const packageName of packagesToProcess) {
    if (packageName === 'root') {
      // Root package gets 'v' prefix
      const tagName = `v${newVersion}`;
      await EntityTag.createTag(tagName, commitMessage, { push: true });
    } else {
      // Other packages get 'package-name-v' prefix
      const packageInstance = new EntityPackages(packageName);
      const seriesName = packageInstance.getTagSeriesName();
      const tagName = `${seriesName}${newVersion}`;
      await EntityTag.createTag(tagName, commitMessage, { push: true });
    }
  }
});
```

### **Phase 4: Package.json Version Management**

#### **4.1 Update Package Validation**
```typescript
// packages/intershell/src/entities/packages/packages.ts
validatePackage(): PackageValidationResult {
  const packageJson = this.readJson();
  const errors: PackageValidationError[] = [];

  // Only validate version for packages that should be versioned
  if (this.shouldVersion()) {
    if (!semanticVersionRegex.test(packageJson.version)) {
      errors.push({
        code: "INVALID_VERSION",
        message: "Version should follow semantic versioning",
        field: "version",
      });
    }
    
    // Ensure private packages don't have versions
    if (packageJson.private === true) {
      errors.push({
        code: "PRIVATE_WITH_VERSION",
        message: "Private packages should not have versions",
        field: "version",
      });
    }
  } else {
    // For unversioned packages, ensure no version field and private is true
    if (packageJson.version) {
      errors.push({
        code: "UNEXPECTED_VERSION",
        message: "Private packages should not have version field",
        field: "version",
      });
    }
    
    if (packageJson.private !== true) {
      errors.push({
        code: "UNVERSIONED_NOT_PRIVATE",
        message: "Unversioned packages must have private: true",
        field: "version",
      });
    }
  }

  // ... rest of validation logic ...
}
```

#### **4.2 Tag Series Validation**
```typescript
// packages/intershell/src/entities/packages/packages.ts
validateTagSeries(): TagSeriesValidationResult {
  const errors: TagSeriesValidationError[] = [];
  
  if (this.shouldVersion()) {
    const seriesName = this.getTagSeriesName();
    if (!seriesName) {
      errors.push({
        code: "INVALID_TAG_SERIES",
        message: "Versioned packages must have valid tag series",
        field: "tagSeries",
      });
    }
  } else {
    // Unversioned packages should not have tag series
    const seriesName = this.getTagSeriesName();
    if (seriesName) {
      errors.push({
        code: "UNEXPECTED_TAG_SERIES",
        message: "Private packages should not have tag series",
        field: "tagSeries",
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

#### **4.3 Update Tag Rules Configuration**
```typescript
// packages/intershell/src/entities/tag/rules.ts
// REFACTOR: Support multiple prefixes for different packages
export const tagRules = new TagRules({
  format: {
    list: ["semver"] as const,
  },
  prefix: {
    list: ["v", "intershell-v", "ui-v", "admin-v"] as const, // Support multiple prefixes
  },
  name: {
    minLength: 1,
    maxLength: 100,
    allowedCharacters: /^[a-zA-Z0-9\-_.]+$/,
    noSpaces: true,
    noSpecialChars: true,
  },
});

// NEW: Package-specific tag rules
export class PackageTagRules {
  static getRulesForPackage(packageName: string): TagRule[] {
    const packageInstance = new EntityPackages(packageName);
    const seriesName = packageInstance.getTagSeriesName();
    
    if (!seriesName) {
      throw new Error(`Package ${packageName} cannot have tag rules (private package)`);
    }
    
    return new TagRules({
      format: { list: ["semver"] as const },
      prefix: { list: [seriesName] as const },
      name: {
        minLength: 1,
        maxLength: 100,
        allowedCharacters: /^[a-zA-Z0-9\-_.]+$/,
        noSpaces: true,
        noSpecialChars: true,
      },
    }).getRules();
  }
}
```

## ⚙️ Configuration Changes

### **1. Package.json Updates**

#### **Root Package** (No private field = versioned)
```json
{
  "name": "root",
  "version": "0.1.2"
  // No private field = will be versioned
}
```

#### **Versioned Packages** (No private field = versioned)
```json
{
  "name": "@repo/intershell",
  "version": "0.1.2"
  // No private field = will be versioned
}
```

#### **Unversioned Packages** (private: true = no versioning)
```json
{
  "name": "@repo/admin",
  "private": true
  // private: true = no version field, no versioning
}
```

### **2. Intershell Configuration**
```typescript
// i.config.ts
export default {
  versioning: {
    strategy: 'selective',
    // Versioning determined by package.json private field
    // No private field = versioned, private: true = unversioned
    rootBumpsOnInternalChanges: true,
    changelogStrategy: 'time-sorted-with-pr-section'
  }
} as const;
```

## 🧪 Testing Strategy

### **1. Unit Tests**
```typescript
// packages/intershell/src/entities/packages/packages.test.ts
describe('Selective Versioning', () => {
  test('shouldVersion() returns correct value for each package', () => {
    // Test versioned packages
    expect(new EntityPackages('root').shouldVersion()).toBe(true);
    expect(new EntityPackages('@repo/intershell').shouldVersion()).toBe(true);
    
    // Test unversioned packages
    expect(new EntityPackages('@repo/admin').shouldVersion()).toBe(false);
    expect(new EntityPackages('@repo/ui').shouldVersion()).toBe(false);
  });

  test('getVersionedPackages() returns only versioned packages', async () => {
    const versionedPackages = await EntityPackages.getVersionedPackages();
    expect(versionedPackages).toContain('root');
    expect(versionedPackages).toContain('@repo/intershell');
    expect(versionedPackages).not.toContain('@repo/admin');
    expect(versionedPackages).not.toContain('@repo/ui');
  });

  test('getTagSeriesName() returns correct series names', () => {
    expect(new EntityPackages('root').getTagSeriesName()).toBe('v');
    expect(new EntityPackages('@repo/intershell').getTagSeriesName()).toBe('intershell-v');
    expect(new EntityPackages('@repo/admin').getTagSeriesName()).toBe(null);
  });
});
```

// packages/intershell/src/entities/version/version.test.ts
describe('EntityVersion', () => {
  test('getCurrentVersion() returns package version', async () => {
    const entityVersion = new EntityVersion('root');
    const version = await entityVersion.getCurrentVersion();
    expect(version).toBeDefined();
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('getNextVersion() calculates correct next version', async () => {
    const entityVersion = new EntityVersion('root');
    const nextVersion = await entityVersion.getNextVersion('minor');
    expect(nextVersion).toBeDefined();
  });

  test('calculateBumpType() returns correct bump type for root', async () => {
    const entityVersion = new EntityVersion('root');
    const mockCommits = [
      { message: { type: 'feat', isBreaking: false }, files: ['apps/admin/src/app/page.tsx'] }
    ] as ParsedCommitData[];
    
    const bumpType = await entityVersion.calculateBumpType(mockCommits);
    expect(bumpType).toBe('minor');
  });
});
```

### **2. Tag Series Tests**
```typescript
// packages/intershell/src/entities/tag/tag.test.ts
describe('Multiple Tag Series Support', () => {
  test('getPrefixForPackage() returns correct prefix for each package', () => {
    expect(EntityTag.getPrefixForPackage('root')).toBe('v');
    expect(EntityTag.getPrefixForPackage('@repo/intershell')).toBe('intershell-v');
    expect(EntityTag.getPrefixForPackage('@repo/admin')).toBe('v'); // fallback
  });

  test('listTagsForPackage() returns tags for specific package series', async () => {
    const rootTags = await EntityTag.listTagsForPackage('root');
    const intershellTags = await EntityTag.listTagsForPackage('@repo/intershell');
    
    expect(rootTags.every(tag => tag.startsWith('v'))).toBe(true);
    expect(intershellTags.every(tag => tag.startsWith('intershell-v'))).toBe(true);
  });

  test('PackageTagRules.getRulesForPackage() returns package-specific rules', () => {
    const rootRules = PackageTagRules.getRulesForPackage('root');
    const intershellRules = PackageTagRules.getRulesForPackage('@repo/intershell');
    
    expect(rootRules).toBeDefined();
    expect(intershellRules).toBeDefined();
  });
});
```

### **3. EntityVersion Integration Tests**
```typescript
// packages/intershell/src/entities/changelog/changelog.test.ts
describe('EntityChangelog with EntityVersion', () => {
  test('calculateVersionData() uses EntityVersion for bump type calculation', async () => {
    const changelog = new EntityChangelog('root', template);
    const mockCommits = [
      { message: { type: 'feat', isBreaking: false }, files: ['apps/admin/src/app/page.tsx'] }
    ] as ParsedCommitData[];
    
    // Mock EntityVersion
    jest.spyOn(EntityVersion.prototype, 'calculateBumpType').mockResolvedValue('minor');
    
    await changelog.calculateRange('v1.0.0', 'HEAD');
    const versionData = changelog.getVersionData();
    
    expect(versionData.bumpType).toBe('minor');
  });
});
```

### **2. Integration Tests**
```typescript
// scripts/version-prepare.test.ts
describe('Version Preparation with Selective Versioning', () => {
  test('only processes versioned packages', async () => {
    // Mock git commits
    // Run version-prepare
    // Verify only versioned packages get processed
  });

  test('root package bumps when internal deps change', async () => {
    // Mock internal dependency changes
    // Verify root package gets version bump
  });
});
```

### **3. End-to-End Tests**
```bash
# Test complete workflow
bun run scripts/version-prepare.ts --dry-run
bun run scripts/version-apply.ts --dry-run

# Verify changelog generation
# Verify version bumping behavior
# Verify git tag creation
```

## 🏗️ Technical Architecture

### **New Entity Hierarchy and Responsibilities**

#### **EntityVersion** 🆕
- **Purpose**: Centralized version management and calculation
- **Responsibilities**:
  - Version calculation (current, next, bump types)
  - Version history tracking
  - Bump type determination logic
  - Root vs package versioning rules
- **Dependencies**: EntityPackages, TagSeriesManager

#### **EntityTag** 🔄
- **Purpose**: Git tag operations and management
- **Responsibilities**:
  - Git tag CRUD operations (create, delete, list, validate)
  - Tag validation rules
  - Package-specific prefix support
  - Tag series discovery
- **Dependencies**: TagRules, Git operations
- **Removed**: All version-related methods moved to EntityVersion

#### **EntityChangelog** 🔄
- **Purpose**: Changelog generation and management
- **Responsibilities**:
  - Changelog template processing
  - Commit filtering and organization
  - Changelog file management
- **Dependencies**: EntityVersion (for version calculations)
- **Removed**: Version calculation methods moved to EntityVersion

#### **EntityPackages** 🔄
- **Purpose**: Package discovery and metadata
- **Responsibilities**:
  - Package classification (versioned vs unversioned)
  - Tag series name generation
  - Package.json operations
- **Dependencies**: File system, package.json parsing

### **Entity Relationships**

```mermaid
graph TB
    A[EntityVersion] --> B[EntityPackages]
    A --> C[TagSeriesManager]
    A --> D[VersionHistory]
    
    E[EntityTag] --> F[TagRules]
    E --> G[GitOperations]
    E --> H[PackagePrefixes]
    
    I[EntityChangelog] --> A
    I --> J[ChangelogTemplates]
    I --> K[CommitData]
    
    L[VersionScripts] --> A
    L --> E
    L --> I
    
    M[CLICommands] --> A
    M --> E
    M --> I
```

### **Data Flow**

```typescript
// Version calculation workflow
interface VersionCalculationWorkflow {
  // 1. EntityPackages determines which packages should be versioned
  getVersionedPackages: () => Promise<string[]>;
  
  // 2. EntityVersion calculates bump types and next versions
  calculateBumpType: (commits: Commit[]) => Promise<VersionBumpType>;
  getNextVersion: (bumpType: VersionBumpType) => Promise<string>;
  
  // 3. EntityTag creates appropriate tags with package-specific prefixes
  createTag: (tagName: string, message: string) => Promise<void>;
  
  // 4. EntityChangelog generates changelogs using EntityVersion data
  generateChangelog: (versionData: VersionData) => Promise<string>;
}
```

## 🔄 Migration Plan

### **Phase 1: Preparation (Week 1)**
- [ ] **Create EntityVersion**: New entity for version management
- [ ] **Refactor EntityTag**: Move version methods to EntityVersion, add package-specific prefixes
- [ ] **Update Tag Rules**: Support multiple prefixes for different packages
- [ ] **Update EntityPackages**: Add tag series name generation
- [ ] **Add unit tests**: For new EntityVersion and tag series functionality

### **Phase 2: Implementation (Week 2)**
- [ ] **Update EntityChangelog**: Use EntityVersion for version calculations
- [ ] **Modify version-prepare.ts script**: Process only versioned packages using EntityVersion
- [ ] **Update version-apply.ts script**: Create tags with package-specific prefixes
- [ ] **Update package validation**: Tag series validation rules
- [ ] **Remove versions**: From unversioned packages (set private: true)

### **Phase 3: Testing & Validation (Week 3)**
- [ ] **Run comprehensive test suite**: EntityVersion and tag series functionality
- [ ] **Test versioning workflow end-to-end**: Multiple package series
- [ ] **Validate changelog generation**: Ensure no regression with EntityVersion
- [ ] **Test version calculations**: Root package bumping logic via EntityVersion
- [ ] **Test tag series creation**: Verify correct prefix generation

### **Phase 4: Deployment (Week 4)**
- [ ] **Deploy to development environment**: Test selective versioning
- [ ] **Run test versioning workflow**: Create tags with multiple series
- [ ] **Monitor and validate results**: Tag series creation and management
- [ ] **Deploy to production**: Full selective versioning with multiple tag series
- [ ] **Document new workflow**: Update developer documentation

## 🔮 Future Considerations

### **1. Multiple Tag Series Expansion**
- **Package-Specific Series**: Enable more packages to become versioned with their own tag series
- **Series Migration**: Convert unversioned packages to versioned when they become publishable
- **Series Naming Conventions**: Standardize tag series naming across the monorepo

### **2. Advanced Tag Series Features**
- **Prerelease Support**: Alpha, beta, RC versions within each series
- **Series Synchronization**: Coordinate releases across multiple series
- **Series Dependencies**: Track dependencies between different tag series

### **3. External Publishing Integration**
- **NPM Package Preparation**: Prepare versioned packages for external publishing
- **Tag Series Publishing**: Publish tag series to external registries
- **Changelog Publishing**: External changelog generation for npm packages

### **4. CI/CD Integration**
- **Series-Aware Versioning**: Trigger version bumps based on tag series
- **Multi-Series Releases**: Coordinate releases across multiple tag series
- **Series Validation**: Ensure tag series consistency in CI/CD

### **5. Monitoring & Analytics**
- **Series Performance**: Track release cadence per tag series
- **Cross-Series Impact**: Analyze how changes affect multiple series
- **Series Health Metrics**: Monitor tag series consistency and health

## 📊 Success Metrics

### **Immediate Goals**
- [ ] **Selective Versioning**: Only root + @repo/intershell have versions (based on `private` field)
- [ ] **Multiple Tag Series**: Root gets `v*` series, @repo/intershell gets `intershell-v*` series
- [ ] **Dependency Awareness**: Root bumps when internal deps change
- [ ] **Changelog Preservation**: Existing changelog system unchanged (time-sorted, PR section)
- [ ] **Tag Series Integration**: Foundation for multiple tag series support

### **Quality Metrics**
- [ ] **Test Coverage**: >90% for new functionality
- [ ] **Performance**: No degradation in versioning workflow
- [ ] **Reliability**: Version bumps happen correctly 100% of the time
- [ ] **Maintainability**: Clear separation of concerns

### **User Experience**
- [ ] **Developer Clarity**: Clear understanding of which packages are versioned
- [ ] **Workflow Simplicity**: Versioning process remains simple
- [ ] **Changelog Readability**: Comprehensive but organized changelog output
- [ ] **Error Handling**: Clear error messages for versioning issues

---

**This implementation plan provides a comprehensive approach to selective versioning while maintaining the existing changelog system and ensuring root package versions reflect the entire monorepo state.**

## 📈 **Implementation Progress Summary**

### 🎯 **Overall Status: 25% Complete**

| Phase | Status | Progress | Notes |
|-------|--------|----------|-------|
| **Phase 1: Foundation** | ✅ **COMPLETE** | 100% | Package classification, tag series generation, selective processing |
| **Phase 2: EntityVersion** | 🔄 **NEXT** | 0% | Version calculation logic refactoring |
| **Phase 3: Tag Integration** | 🔄 **PENDING** | 0% | Multiple tag series support |
| **Phase 4: End-to-End** | 🔄 **PENDING** | 0% | Full workflow testing |

### 🚀 **What's Working Now**
- ✅ **Selective Versioning**: Only packages with `private !== true` get processed
- ✅ **Tag Series Foundation**: Root gets `v*`, @repo/intershell gets `intershell-v*`
- ✅ **Version Preparation**: Script correctly filters packages
- ✅ **Comprehensive Testing**: All new functionality tested and verified

### 🎯 **Immediate Next Steps** (Choose One)
1. **Update version-apply.ts** - Implement package-specific tag creation
2. **Create EntityVersion entity** - Refactor version calculation logic
3. **Test real versioning workflow** - Verify end-to-end functionality
4. **Update package validation** - Add tag series consistency rules

### 📊 **Success Metrics Status**
- ✅ **Selective Versioning**: Implemented and working
- ✅ **Multiple Tag Series**: Foundation complete, integration pending
- 🔄 **Dependency Awareness**: Next phase
- ✅ **Changelog Preservation**: Maintained
- 🔄 **Tag Series Integration**: Foundation complete, full integration pending

### 🎉 **Key Achievements**
- **Zero breaking changes** to existing functionality
- **Comprehensive test coverage** for all new features
- **Real-world verification** with actual workspace packages
- **Clean architecture** that separates concerns properly

---

**Ready for the next phase! Choose your next small step above.** 🚀

