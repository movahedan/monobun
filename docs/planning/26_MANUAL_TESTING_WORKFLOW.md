# 🧪 Manual Testing Workflow

> **Comprehensive manual testing plan for the completed dependency analyzer and architectural refactoring**

## 📋 Table of Contents

- [Overview](#-overview)
- [Testing Environment Setup](#-testing-environment-setup)
- [Core Functionality Tests](#-core-functionality-tests)
- [Dependency Analysis Tests](#-dependency-analysis-tests)
- [Version Management Tests](#-version-management-tests)
- [Integration Tests](#-integration-tests)
- [Performance Tests](#-performance-tests)
- [Error Handling Tests](#-error-handling-tests)
- [Success Criteria](#-success-criteria)

## 🎯 Overview

This document provides a comprehensive manual testing plan for the recently completed dependency analyzer implementation and architectural refactoring. All major features have been implemented and committed, and this testing plan ensures everything works correctly in real-world scenarios.

### **What Was Completed**
- ✅ **Dependency Analyzer**: Intelligent package dependency analysis with tsconfig support
- ✅ **Entity Refactoring**: Complete architectural refactoring with dependency injection
- ✅ **Package-Aware Versioning**: Smart version bumping based on dependency changes
- ✅ **Enhanced Changelog**: Better commit filtering and changelog quality
- ✅ **TypeScript Integration**: Full tsconfig.json analysis for internal dependencies

### **Testing Goals**
- Verify all new functionality works as expected
- Ensure no regressions in existing features
- Validate performance improvements
- Confirm error handling works correctly
- Test edge cases and real-world scenarios

## 🛠️ Testing Environment Setup

### **Prerequisites**
```bash
# Ensure clean working directory
git status                    # Should be clean
git branch                   # Should be on feature/dependency-analyzer-implementation
bun --version               # Should be latest version
node --version              # Should be compatible
```

### **Environment Preparation**
```bash
# 1. Clean and fresh install
git clean -fd
bun install

# 2. Verify all checks pass
bun run check:types         # Should pass with no errors
bun run check:fix          # Should pass with no issues
bun test                   # Should pass all tests

# 3. Verify current state
git log --oneline -5       # Should show recent commits
git tag --list             # List existing tags
```

## 🔧 Core Functionality Tests

### **Test 1: Basic Version Preparation**
```bash
# Test basic version preparation workflow
bun run version:prepare --dry-run

# Expected Results:
# - Should process only versioned packages (root, @repo/intershell)
# - Should show dependency analysis for each package
# - Should display version bump calculations
# - Should not process private packages (@repo/ui, @repo/admin, etc.)
```

### **Test 2: Package-Specific Version Preparation**
```bash
# Test individual package processing
bun run version:prepare --package root --dry-run
bun run version:prepare --package @repo/intershell --dry-run

# Expected Results:
# - Each package should be processed independently
# - Dependency analysis should work for each package
# - Version calculations should be accurate
```

### **Test 3: Version Application**
```bash
# Test version application (if ready)
bun run version:apply --dry-run

# Expected Results:
# - Should show what changes would be applied
# - Should not actually modify files in dry-run mode
# - Should display clear output about version changes
```

## 🔍 Dependency Analysis Tests

### **Test 4: Internal Dependency Detection**
```bash
# Test dependency analysis for root package
cd packages/intershell
bun test src/entities/commit-package/dependency-analyzer.test.ts

# Expected Results:
# - Should detect internal monorepo dependencies
# - Should parse tsconfig.json paths correctly
# - Should identify @repo/ prefixed packages
# - Should filter out external dependencies
```

### **Test 5: Package.json Dependency Analysis**
```bash
# Test package.json dependency parsing
# Create a test commit that modifies package.json
echo '{"dependencies": {"@repo/ui": "workspace:*"}}' > test-package.json
git add test-package.json
git commit -m "test: add test package.json for dependency analysis"

# Run version preparation
bun run version:prepare --dry-run

# Expected Results:
# - Should detect the new dependency
# - Should include it in dependency analysis
# - Should affect version bump calculations
```

### **Test 6: Tsconfig.json Analysis**
```bash
# Test tsconfig.json path analysis
# Modify a tsconfig.json file
echo '{"compilerOptions": {"paths": {"@repo/ui": ["./packages/ui/src"]}}}' > test-tsconfig.json
git add test-tsconfig.json
git commit -m "test: add test tsconfig.json for path analysis"

# Run version preparation
bun run version:prepare --dry-run

# Expected Results:
# - Should detect tsconfig paths
# - Should map paths to internal packages
# - Should include in dependency analysis
```

## 📊 Version Management Tests

### **Test 7: Version Bump Type Calculation**
```bash
# Test different commit types and their version bumps
# Create different types of commits
echo "feat: add new feature" > feat-commit.txt
git add feat-commit.txt
git commit -m "feat: add new feature"

echo "fix: fix bug" > fix-commit.txt
git add fix-commit.txt
git commit -m "fix: fix bug"

echo "BREAKING CHANGE: major change" > breaking-commit.txt
git add breaking-commit.txt
git commit -m "feat!: major breaking change"

# Run version preparation
bun run version:prepare --dry-run

# Expected Results:
# - feat commits should trigger minor bumps
# - fix commits should trigger patch bumps
# - breaking changes should trigger major bumps
# - Should show correct bump types for each package
```

### **Test 8: Cross-Package Impact**
```bash
# Test how changes to dependencies affect dependent packages
# Make changes to a package that others depend on
echo "change to utils" > packages/utils/test-change.txt
git add packages/utils/test-change.txt
git commit -m "feat(utils): add new utility function"

# Run version preparation for root
bun run version:prepare --package root --dry-run

# Expected Results:
# - Root should detect the utils change
# - Should trigger appropriate version bump
# - Should show dependency impact in analysis
```

## 🔗 Integration Tests

### **Test 9: Complete Workflow Integration**
```bash
# Test the complete versioning workflow
# 1. Prepare versions
bun run version:prepare --dry-run

# 2. If satisfied, apply versions (remove --dry-run)
# bun run version:apply

# 3. Verify changes
git status
git log --oneline -3

# Expected Results:
# - Complete workflow should execute without errors
# - All steps should work together seamlessly
# - No data loss or corruption
```

### **Test 10: Changelog Generation**
```bash
# Test changelog generation with new dependency analysis
bun run version:prepare --dry-run

# Check if changelogs are generated
ls -la packages/*/CHANGELOG.md
ls -la apps/*/CHANGELOG.md

# Expected Results:
# - Changelogs should be generated for versioned packages
# - Should include only relevant commits
# - Should show dependency impact
# - Should be well-formatted and readable
```

## ⚡ Performance Tests

### **Test 11: Performance with Large Commit History**
```bash
# Test performance with many commits
# Create multiple commits to test performance
for i in {1..50}; do
  echo "test commit $i" > "test-file-$i.txt"
  git add "test-file-$i.txt"
  git commit -m "test: commit $i"
done

# Time the version preparation
time bun run version:prepare --dry-run

# Expected Results:
# - Should complete in reasonable time (< 30 seconds)
# - Should not consume excessive memory
# - Should handle large commit history gracefully
```

### **Test 12: Memory Usage**
```bash
# Monitor memory usage during version preparation
# Run with memory monitoring
bun run version:prepare --dry-run

# Expected Results:
# - Memory usage should be reasonable
# - No memory leaks
# - Should clean up resources properly
```

## 🚨 Error Handling Tests

### **Test 13: Invalid Package Names**
```bash
# Test with invalid package names
bun run version:prepare --package invalid-package --dry-run

# Expected Results:
# - Should show clear error message
# - Should not crash or hang
# - Should provide helpful guidance
```

### **Test 14: Missing Dependencies**
```bash
# Test with missing or corrupted files
# Temporarily rename a package.json
mv packages/intershell/package.json packages/intershell/package.json.backup

# Run version preparation
bun run version:prepare --dry-run

# Restore the file
mv packages/intershell/package.json.backup packages/intershell/package.json

# Expected Results:
# - Should handle missing files gracefully
# - Should show appropriate error messages
# - Should not crash the entire process
```

### **Test 15: Git Repository Issues**
```bash
# Test with git repository issues
# Create a detached HEAD state
git checkout HEAD~5

# Run version preparation
bun run version:prepare --dry-run

# Return to main branch
git checkout feature/dependency-analyzer-implementation

# Expected Results:
# - Should handle git issues gracefully
# - Should provide clear error messages
# - Should not corrupt the repository
```

## ✅ Success Criteria

### **Functional Requirements**
- [ ] All version preparation commands work correctly
- [ ] Dependency analysis detects internal packages accurately
- [ ] Version bump calculations are correct
- [ ] Changelog generation includes only relevant commits
- [ ] Cross-package impact is properly detected
- [ ] Error handling works for all edge cases

### **Performance Requirements**
- [ ] Version preparation completes in < 30 seconds for normal workloads
- [ ] Memory usage remains reasonable (< 500MB)
- [ ] No memory leaks during operation
- [ ] Handles large commit histories gracefully

### **Quality Requirements**
- [ ] All tests pass
- [ ] No TypeScript compilation errors
- [ ] No linting issues
- [ ] Clear, helpful error messages
- [ ] Consistent behavior across all scenarios

### **Integration Requirements**
- [ ] Works with existing git workflow
- [ ] Compatible with existing CI/CD
- [ ] No breaking changes to existing functionality
- [ ] Maintains backward compatibility

## 📝 Test Results Documentation

### **Test Execution Log**
Create a test results log to document findings:

```markdown
# Manual Testing Results

## Test Execution Date: [DATE]
## Tester: [NAME]
## Environment: [DETAILS]

### Test Results Summary
- [ ] Test 1: Basic Version Preparation - [PASS/FAIL]
- [ ] Test 2: Package-Specific Version Preparation - [PASS/FAIL]
- [ ] Test 3: Version Application - [PASS/FAIL]
- [ ] Test 4: Internal Dependency Detection - [PASS/FAIL]
- [ ] Test 5: Package.json Dependency Analysis - [PASS/FAIL]
- [ ] Test 6: Tsconfig.json Analysis - [PASS/FAIL]
- [ ] Test 7: Version Bump Type Calculation - [PASS/FAIL]
- [ ] Test 8: Cross-Package Impact - [PASS/FAIL]
- [ ] Test 9: Complete Workflow Integration - [PASS/FAIL]
- [ ] Test 10: Changelog Generation - [PASS/FAIL]
- [ ] Test 11: Performance with Large Commit History - [PASS/FAIL]
- [ ] Test 12: Memory Usage - [PASS/FAIL]
- [ ] Test 13: Invalid Package Names - [PASS/FAIL]
- [ ] Test 14: Missing Dependencies - [PASS/FAIL]
- [ ] Test 15: Git Repository Issues - [PASS/FAIL]

### Issues Found
[List any issues discovered during testing]

### Recommendations
[Any recommendations for improvements]

### Overall Assessment
[Overall assessment of the system's readiness]
```

## 🎯 Next Steps

After completing manual testing:

1. **Document Results**: Record all test results and findings
2. **Address Issues**: Fix any problems discovered during testing
3. **Performance Optimization**: Address any performance concerns
4. **Documentation Updates**: Update documentation based on findings
5. **Production Readiness**: Confirm system is ready for production use

---

**This manual testing plan ensures the dependency analyzer and architectural refactoring work correctly in real-world scenarios and provides confidence in the system's reliability and performance.**
