## Changelog (api)

[![Keep a Changelog](https://img.shields.io/badge/changelog-Keep%20a%20Changelog%20v1.0.0-$E05735)](https://keepachangelog.com)
[![Semantic Versioning](https://img.shields.io/badge/semver-semantic%20versioning%20v2.0.0-%23E05735)](https://semver.org)

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## api-v0.1.0
###### <a href="https://github.com/movahedan/monobun/commit/53d0b76db1b6ecf956078018fab025119ab5240c"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> clean up version tests and fix all type errors ([53d0b76](https://github.com/movahedan/monobun/commit/53d0b76db1b6ecf956078018fab025119ab5240c)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/7abec14532f8adfc12f62d9ce0c6e51bb3db5ca7"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> improve tag validation to use proper package lookup ([7abec14](https://github.com/movahedan/monobun/commit/7abec14532f8adfc12f62d9ce0c6e51bb3db5ca7)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/6a00f1ecfb2110d5f52502d8aaf9f1fe87e11a04"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> handle @repo/ prefix in tag validation and update test ([6a00f1e](https://github.com/movahedan/monobun/commit/6a00f1ecfb2110d5f52502d8aaf9f1fe87e11a04)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/c283651546f5eabe1828c0a95dc223c6c1c0810b"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> resolve test isolation issues and improve config system ([c283651](https://github.com/movahedan/monobun/commit/c283651546f5eabe1828c0a95dc223c6c1c0810b)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/89ce04b4483c0430e69a60075a5f93005c530e29"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @biomejs/biome to v2.2.3 (#190) ([89ce04b](https://github.com/movahedan/monobun/commit/89ce04b4483c0430e69a60075a5f93005c530e29)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/da0e79e918f78e310b4fcff586baeee5e2c7f2a8"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update tailwindcss monorepo to v4.1.13 (#188) ([da0e79e](https://github.com/movahedan/monobun/commit/da0e79e918f78e310b4fcff586baeee5e2c7f2a8)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/f2ecccde6988dcdd38f2695f3efe05d44c570d0f"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency vite to v7.1.4 (#186) ([f2ecccd](https://github.com/movahedan/monobun/commit/f2ecccde6988dcdd38f2695f3efe05d44c570d0f)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/561f8a87b3ec294f9ff21592f4a9e421cda6682a"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency serve to v14.2.5 (#187) ([561f8a8](https://github.com/movahedan/monobun/commit/561f8a87b3ec294f9ff21592f4a9e421cda6682a)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/c2456063ad6508e92184fe661ded57a6c4e25ffa"><img src="https://img.shields.io/badge/test-(@repo/intershell)-10B981?style=flat" alt="test" style="vertical-align: middle;" /></a> add comprehensive test coverage and fix bun test isolation (#189) ([c245606](https://github.com/movahedan/monobun/commit/c2456063ad6508e92184fe661ded57a6c4e25ffa)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/3fa2563ed884fe4fe9ef2d96d33a0ffc9b6173fa"><img src="https://img.shields.io/badge/test-(@repo/intershell)-10B981?style=flat" alt="test" style="vertical-align: middle;" /></a> add comprehensive test coverage and fix bun test isolation (#189) ([3fa2563](https://github.com/movahedan/monobun/commit/3fa2563ed884fe4fe9ef2d96d33a0ffc9b6173fa)) by **Soheil Movahedan**

### 🐛 refactor/cleanup <img src="https://img.shields.io/badge/Bug%20Fixes%20%26%20Improvements-495057?style=flat" alt="Bug Fixes & Improvements" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/185"><img src="https://img.shields.io/badge/%23185-blue?style=flat" alt="#185" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/5%20commits-green?style=flat" alt="5 commits" style="vertical-align: middle;" />

#### Summary
This PR cleans up the repository and make sure the basic setup works fine.
Except for the changelog and version management, which will be refactored in next PR.

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/55dbec3d1b4ab3513f0a480cf53a9a6e82920fc2"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update branch name reference in changelog template ([55dbec3](https://github.com/movahedan/monobun/commit/55dbec3d1b4ab3513f0a480cf53a9a6e82920fc2)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/6841043f433613b5d36d816bc4fee2cd58912b4d"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> ensure changelog file is created ([6841043](https://github.com/movahedan/monobun/commit/6841043f433613b5d36d816bc4fee2cd58912b4d)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/18f63253d1ec59a4f66c9c2441080dfb6d7b066b"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> console logs ([18f6325](https://github.com/movahedan/monobun/commit/18f63253d1ec59a4f66c9c2441080dfb6d7b066b)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/5f5f5e44d173d52afce1ed43fede3a9eec998f9d"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update ([5f5f5e4](https://github.com/movahedan/monobun/commit/5f5f5e44d173d52afce1ed43fede3a9eec998f9d)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/657b1a0bb7e07037b3fbb9b27144da9d80cd8e4e"><img src="https://img.shields.io/badge/fix-(root)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> basic setup should work ([657b1a0](https://github.com/movahedan/monobun/commit/657b1a0bb7e07037b3fbb9b27144da9d80cd8e4e)) by **Soheil Movahedan**

</details>


### 📦 renovate/biomejs-biome-2.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/131"><img src="https://img.shields.io/badge/%23131-blue?style=flat" alt="#131" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/2%20commits-green?style=flat" alt="2 commits" style="vertical-align: middle;" />

chore(deps): update dependency @biomejs/biome to v2.2.2

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/8666afbe3797f1d00209f2e10280ff8373a9b525"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> resolve all biome check issues and improve code quality ([8666afb](https://github.com/movahedan/monobun/commit/8666afbe3797f1d00209f2e10280ff8373a9b525)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/8383cb90ab3eab81097d00ab7cfa96d2b641827a"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @biomejs/biome to v2.2.2 ([8383cb9](https://github.com/movahedan/monobun/commit/8383cb90ab3eab81097d00ab7cfa96d2b641827a)) by **renovate[bot]**

</details>


### 📚 feature/claude-cursor-developer-docs <img src="https://img.shields.io/badge/Documentation-495057?style=flat" alt="Documentation" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/181"><img src="https://img.shields.io/badge/%23181-blue?style=flat" alt="#181" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/5%20commits-green?style=flat" alt="5 commits" style="vertical-align: middle;" />

#### 📊 Summary
This PR implements a comprehensive three-tier documentation system that significantly improves the project's documentation architecture and developer experience.
#### 🔑 Key Changes
- **New Cursor Rules**: Comprehensive development standards for JavaScript, TypeScript, security, and package management
- **CLAUDE.md Integration**: Project-level architecture documentation throughout the monorepo
- **Documentation Restructuring**: Updated docs to reflect new three-tier system
- **New Test Package**: Added test-package app with version 3.0.0
- **MCP Integration**: Added Model Context Protocol support
- **Enhanced Workflow**: Interactive commit workflow with documentation updates
#### 📚 Documentation System
The project now uses a three-tier documentation structure:
1. **CLAUDE.md Files**: Project-level architecture and key decisions
2. **Cursor Rules**: Development standards and best practices
3. **Developer Docs**: Practical guidance and setup instructions
#### 🚀 Impact
This refactoring provides:
- Better AI assistant understanding of the codebase
- Improved developer onboarding experience
- Consistent development standards across the team
- Enhanced project architecture documentation

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/ed04c32b9d44c282a32eda11f44b916cec46cd2f"><img src="https://img.shields.io/badge/chore-(noscope)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> remove outdated documentation files ([ed04c32](https://github.com/movahedan/monobun/commit/ed04c32b9d44c282a32eda11f44b916cec46cd2f)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/9545d054c182b35916e68da5151daed9ba7fc19f"><img src="https://img.shields.io/badge/feat-(root)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add new test-package and development tools ([9545d05](https://github.com/movahedan/monobun/commit/9545d054c182b35916e68da5151daed9ba7fc19f)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/c4a2b547833cfa1d3b1906cad9da14eae16dcca5"><img src="https://img.shields.io/badge/docs-(root)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> add comprehensive CLAUDE.md architecture documentation ([c4a2b54](https://github.com/movahedan/monobun/commit/c4a2b547833cfa1d3b1906cad9da14eae16dcca5)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/c2f236ea5a98bdcb3af6ea750050799d420101c2"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update and improve cursor rules ([c2f236e](https://github.com/movahedan/monobun/commit/c2f236ea5a98bdcb3af6ea750050799d420101c2)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/8c680e2d8b9aacdfcd934563c87d351a991e4d8b"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update documentation to reflect new three-tier system ([8c680e2](https://github.com/movahedan/monobun/commit/8c680e2d8b9aacdfcd934563c87d351a991e4d8b)) by **Soheil Movahedan**

</details>


### 📦 refactor/interhsell-testing <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/180"><img src="https://img.shields.io/badge/%23180-blue?style=flat" alt="#180" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/29%20commits-green?style=flat" alt="29 commits" style="vertical-align: middle;" />

#### Summary
Comprehensive improvements to testing infrastructure, mock system architecture, and code quality across Intershell entities.
- **Test Infrastructure**: Enhanced mock system with better type safety and command chaining
- **Test Coverage**: Added comprehensive test cases for commit parsing, PR handling, and compose functionality  
- **Bug Fixes**: Resolved commit parsing issues and improved error handling
- **Code Quality**: Fixed linting issues and improved method accessibility for testing
- **Configuration**: Updated bunfig.toml and package.json exports

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/868cf61fee0e4be4165ac293b0ef9b3bf679d3df"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> resolve remaining linting issues in compose tests ([868cf61](https://github.com/movahedan/monobun/commit/868cf61fee0e4be4165ac293b0ef9b3bf679d3df)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/faac2b9782a4f7a474c6f47a605df7d63f59ec5b"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> resolve linting issues in PR tests ([faac2b9](https://github.com/movahedan/monobun/commit/faac2b9782a4f7a474c6f47a605df7d63f59ec5b)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/3331a69491ec074197089a46bfd1004e479bc876"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> resolve commit parsing issues and update config ([3331a69](https://github.com/movahedan/monobun/commit/3331a69491ec074197089a46bfd1004e479bc876)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/96706ecafb394893aa603f2f45c51ad010474374"><img src="https://img.shields.io/badge/test-(@repo/intershell)-10B981?style=flat" alt="test" style="vertical-align: middle;" /></a> enhance test coverage and mock integration ([96706ec](https://github.com/movahedan/monobun/commit/96706ecafb394893aa603f2f45c51ad010474374)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/fe5c1ff7d194daec89557577d31d715b42cee25e"><img src="https://img.shields.io/badge/refactor-(@repo/test%20preset)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> improve mock system architecture and type safety ([fe5c1ff](https://github.com/movahedan/monobun/commit/fe5c1ff7d194daec89557577d31d715b42cee25e)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/b09901e7805058819c3be9931dda717d0cbe7579"><img src="https://img.shields.io/badge/chore-(noscope)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> remove logs ([b09901e](https://github.com/movahedan/monobun/commit/b09901e7805058819c3be9931dda717d0cbe7579)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/2dea2acff2209d43c26f2cbcd18f9326ce7dd3e5"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update planning ([2dea2ac](https://github.com/movahedan/monobun/commit/2dea2acff2209d43c26f2cbcd18f9326ce7dd3e5)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/bcc9f916b5305446893c96c6c4fdbff0d43697fa"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> integrate bun yaml parser and consolidate code ([bcc9f91](https://github.com/movahedan/monobun/commit/bcc9f916b5305446893c96c6c4fdbff0d43697fa)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/7e2b0c208dde455f3ffea276538ed0124941a1bb"><img src="https://img.shields.io/badge/deps-(root)-059669?style=flat" alt="deps" style="vertical-align: middle;" /></a> upgrade bun to 1.2.21 and update biome dependency ([7e2b0c2](https://github.com/movahedan/monobun/commit/7e2b0c208dde455f3ffea276538ed0124941a1bb)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/1563686d94d2ceefc838d7fe272296a423f345b4"><img src="https://img.shields.io/badge/chore-(@repo/test%20preset)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> add mock-bun export to package.json ([1563686](https://github.com/movahedan/monobun/commit/1563686d94d2ceefc838d7fe272296a423f345b4)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/15fc2a7f9cd973ecb505eaf0c7f107d4a18fb234"><img src="https://img.shields.io/badge/test-(@repo/intershell)-10B981?style=flat" alt="test" style="vertical-align: middle;" /></a> cleanup test file and add comprehensive getAllPackages tests ([15fc2a7](https://github.com/movahedan/monobun/commit/15fc2a7f9cd973ecb505eaf0c7f107d4a18fb234)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/87ad24882dc6fbfbb74cc10355206b580fed4de4"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> replace shell commands with Node.js fs operations in getAllPackages ([87ad248](https://github.com/movahedan/monobun/commit/87ad24882dc6fbfbb74cc10355206b580fed4de4)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/78f3ff02c6b75c57be84b1ced4604da651e739d4"><img src="https://img.shields.io/badge/feat-(@repo/test%20preset)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add new mocking utilities for Bun and async fs operations ([78f3ff0](https://github.com/movahedan/monobun/commit/78f3ff02c6b75c57be84b1ced4604da651e739d4)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/f1b11552ef86c9dceac843767ac641767a16e688"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> final cleanup and test additions ([f1b1155](https://github.com/movahedan/monobun/commit/f1b11552ef86c9dceac843767ac641767a16e688)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/0de5008891c33b72308d775b5dc881ba908f772a"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> update commit-check to use new entity architecture ([0de5008](https://github.com/movahedan/monobun/commit/0de5008891c33b72308d775b5dc881ba908f772a)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/67f60f3a3bf361409a8ba2854fc3f65b6da4e7cf"><img src="https://img.shields.io/badge/chore-(@repo/intershell)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update package configuration and dependencies ([67f60f3](https://github.com/movahedan/monobun/commit/67f60f3a3bf361409a8ba2854fc3f65b6da4e7cf)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/d3f5fb98e8530ad7c8728a1192074f4df7e5b197"><img src="https://img.shields.io/badge/feat-(@repo/intershell)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> enhance PR entity with comprehensive testing ([d3f5fb9](https://github.com/movahedan/monobun/commit/d3f5fb98e8530ad7c8728a1192074f4df7e5b197)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/bfb611bf27ce5188135a131b41d3eaf66ae15be8"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> convert commit entity to class-based architecture ([bfb611b](https://github.com/movahedan/monobun/commit/bfb611bf27ce5188135a131b41d3eaf66ae15be8)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/d51b7109480937befb0eed53c2cae48680a7dac5"><img src="https://img.shields.io/badge/feat-(@repo/intershell)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> complete config entity with dynamic package discovery ([d51b710](https://github.com/movahedan/monobun/commit/d51b7109480937befb0eed53c2cae48680a7dac5)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/c0ec9f148c7a012749d4556e9522f345785d41ee"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> complete branch entity refactoring with 100% test coverage ([c0ec9f1](https://github.com/movahedan/monobun/commit/c0ec9f148c7a012749d4556e9522f345785d41ee)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/2552fcb8127407395aedcf363687422487f2bfcf"><img src="https://img.shields.io/badge/chore-(@repo/intershell)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> export new config entity from index ([2552fcb](https://github.com/movahedan/monobun/commit/2552fcb8127407395aedcf363687422487f2bfcf)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/8dc7cc8f6e0c9c497d9396d0f368490f1634ef91"><img src="https://img.shields.io/badge/test-(@repo/intershell)-10B981?style=flat" alt="test" style="vertical-align: middle;" /></a> improve packages testing and mock modules ([8dc7cc8](https://github.com/movahedan/monobun/commit/8dc7cc8f6e0c9c497d9396d0f368490f1634ef91)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/94a472ac76efa43a3ed6f6c0b909c48f60ed6622"><img src="https://img.shields.io/badge/feat-(@repo/intershell)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add new config entity with comprehensive testing ([94a472a](https://github.com/movahedan/monobun/commit/94a472ac76efa43a3ed6f6c0b909c48f60ed6622)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/10d4751223c833291678328daac05b2af87ed895"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> testing of branch entity ([10d4751](https://github.com/movahedan/monobun/commit/10d4751223c833291678328daac05b2af87ed895)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/f4f27aa9129599a8e9248630b866451a89a47d20"><img src="https://img.shields.io/badge/chore-(@repo/intershell)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update package configuration and add i.config.ts ([f4f27aa](https://github.com/movahedan/monobun/commit/f4f27aa9129599a8e9248630b866451a89a47d20)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/1731dac24b1dfc95773724d34b1f380d71fee865"><img src="https://img.shields.io/badge/chore-(@repo/intershell)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> simplify branch naming rules and update devcontainer scopes ([1731dac](https://github.com/movahedan/monobun/commit/1731dac24b1dfc95773724d34b1f380d71fee865)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/73b8c71184d96f03406fb75f9bb4b6014d68734e"><img src="https://img.shields.io/badge/chore-(@repo/intershell)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update package versions and TypeScript configuration ([73b8c71](https://github.com/movahedan/monobun/commit/73b8c71184d96f03406fb75f9bb4b6014d68734e)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/3b19a0767d75ea90ce58a988a012f6872c2958f0"><img src="https://img.shields.io/badge/test-(@repo/intershell)-10B981?style=flat" alt="test" style="vertical-align: middle;" /></a> cover affected, compose, yaml, and package tests ([3b19a07](https://github.com/movahedan/monobun/commit/3b19a0767d75ea90ce58a988a012f6872c2958f0)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/1dface9fb9049f9170b68dd7b1b0e5fa73b93ba8"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> major compose entity refactor and dependency cleanup ([1dface9](https://github.com/movahedan/monobun/commit/1dface9fb9049f9170b68dd7b1b0e5fa73b93ba8)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/33c5870b486f2af57cbb9b0537d8d4c4383d174d"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update dependency @types/react-dom to v19.1.9 (#179) ([33c5870](https://github.com/movahedan/monobun/commit/33c5870b486f2af57cbb9b0537d8d4c4383d174d)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/3ab24d60bcad79e75f58c4405768fdc9d0c352fb"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update dependency @types/react to v19.1.12 (#178) ([3ab24d6](https://github.com/movahedan/monobun/commit/3ab24d60bcad79e75f58c4405768fdc9d0c352fb)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/70c358306f0ed87fa6badf85305c07e1a1d4c864"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update dependency @types/react-dom to v19.1.8 (#177) ([70c3583](https://github.com/movahedan/monobun/commit/70c358306f0ed87fa6badf85305c07e1a1d4c864)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/973e04e3eb43de43c2e71430e4f48dcae68f9efd"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update oven/bun docker tag to v1.2.21 (#176) ([973e04e](https://github.com/movahedan/monobun/commit/973e04e3eb43de43c2e71430e4f48dcae68f9efd)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/58717865aec7edd35ba376243470b686baf5f00a"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency bun-types to v1.2.21 (#175) ([5871786](https://github.com/movahedan/monobun/commit/58717865aec7edd35ba376243470b686baf5f00a)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/cd08c215e9166b5c21f6242d7e7e8b47c7129dc2"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update dependency @types/react to v19.1.11 (#174) ([cd08c21](https://github.com/movahedan/monobun/commit/cd08c215e9166b5c21f6242d7e7e8b47c7129dc2)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/c14e9753363ed392a5b3db727f6480463846cc10"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update planning ([c14e975](https://github.com/movahedan/monobun/commit/c14e9753363ed392a5b3db727f6480463846cc10)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/a677b93d2c59807f12d64e7eeed3558cd8148d27"><img src="https://img.shields.io/badge/release-(noscope)-059669?style=flat" alt="release" style="vertical-align: middle;" /></a> v0.1.2 ([a677b93](https://github.com/movahedan/monobun/commit/a677b93d2c59807f12d64e7eeed3558cd8148d27)) by **github-actions[bot]**

### 📦 refactor/intershell-minor-refactoring <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/173"><img src="https://img.shields.io/badge/%23173-blue?style=flat" alt="#173" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/7%20commits-green?style=flat" alt="7 commits" style="vertical-align: middle;" />

#### 🎯 Overview
This PR refactors the intershell package to improve performance, code quality, and maintainability through several key improvements.
#### ✨ Key Changes
- **Package Management**: Convert EntityPackages.readJson() from async to sync operations
- **Changelog System**: Refactor changelog generation with improved range calculation methods
- **Entity Improvements**: Enhanced branch, commit, and tag entity functionality
- **Script Automation**: Add automatic dependency installation in version scripts
- **Dependency Management**: Properly categorize test dependencies as devDependencies
- **Code Quality**: Remove unused types, improve error handling, and clean up interfaces
#### 🔧 Technical Notes
- **Breaking Changes**: Some methods changed from async to sync (e.g., readJson, generateMergedChangelog)
- **Performance**: Synchronous file operations replacing async operations
- **Maintainability**: Cleaner APIs and better error handling
- **Automation**: Version scripts now automatically run bun install after updates

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/564bfb446a7b52c92748422e682a72c0efd681bf"><img src="https://img.shields.io/badge/fix-(root)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> add automatic dependency installation to version-prepare ([564bfb4](https://github.com/movahedan/monobun/commit/564bfb446a7b52c92748422e682a72c0efd681bf)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/0140afd816343beed7ad32cfeb9355da4beefd84"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> improve commit-check with EntityBranch.getCurrentBranch() ([0140afd](https://github.com/movahedan/monobun/commit/0140afd816343beed7ad32cfeb9355da4beefd84)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/1b3ba809e3b2599139d9c400306e7c6e92ead2b7"><img src="https://img.shields.io/badge/fix-(@repo/test%20preset)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> move test dependencies to devDependencies ([1b3ba80](https://github.com/movahedan/monobun/commit/1b3ba809e3b2599139d9c400306e7c6e92ead2b7)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/b97258df9c2376b0c0a9caf89d5b672e6eba617b"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> update version scripts for new changelog methods ([b97258d](https://github.com/movahedan/monobun/commit/b97258df9c2376b0c0a9caf89d5b672e6eba617b)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/24331b330041e8672bde381470c0651200187c0e"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> supporting entities with improved validation ([24331b3](https://github.com/movahedan/monobun/commit/24331b330041e8672bde381470c0651200187c0e)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/cd5f0ea0bd57e90e26287f02b3922309335748cf"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> changelog system with improved range calculation ([cd5f0ea](https://github.com/movahedan/monobun/commit/cd5f0ea0bd57e90e26287f02b3922309335748cf)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/b7b535c761276bc40fbce2f1d5726cf760dcc521"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> package reader funcs with synch operations ([b7b535c](https://github.com/movahedan/monobun/commit/b7b535c761276bc40fbce2f1d5726cf760dcc521)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/63e1dbea0b9eb293ed93528785755bc9cdaa6486"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> support for protected branches in branch validation ([63e1dbe](https://github.com/movahedan/monobun/commit/63e1dbea0b9eb293ed93528785755bc9cdaa6486)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/329d36f822ba1a8ca8a83185711d3210c4d4def4"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> commit entity - changelog manual change error ([329d36f](https://github.com/movahedan/monobun/commit/329d36f822ba1a8ca8a83185711d3210c4d4def4)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/dd582f2d504db9d5fdbfa8f83d46f875c77a3b44"><img src="https://img.shields.io/badge/chore-(@repo/intershell)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update changelog ([dd582f2](https://github.com/movahedan/monobun/commit/dd582f2d504db9d5fdbfa8f83d46f875c77a3b44)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/3d1902093cc537812cae71982865d762528944c5"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> changelog entity - improve merge commit message ([3d19020](https://github.com/movahedan/monobun/commit/3d1902093cc537812cae71982865d762528944c5)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/086504c3164ebf15161291f13fa1fcddf1c97120"><img src="https://img.shields.io/badge/release-(noscope)-059669?style=flat" alt="release" style="vertical-align: middle;" /></a> v0.1.1 ([086504c](https://github.com/movahedan/monobun/commit/086504c3164ebf15161291f13fa1fcddf1c97120)) by **github-actions[bot]**

### 🔄 feature/staged-check <img src="https://img.shields.io/badge/Code%20Quality%20%26%20Refactoring-495057?style=flat" alt="Code Quality & Refactoring" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/172"><img src="https://img.shields.io/badge/%23172-blue?style=flat" alt="#172" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/2%20commits-green?style=flat" alt="2 commits" style="vertical-align: middle;" />

## Overview
This PR refactors the commit validation system to improve code organization and add comprehensive staged file validation capabilities.
## Key Changes
- Staged File Validation: Added getStagedFiles() and validateStagedFiles() methods to EntityCommit
- Naming Consistency: Renamed prefixes to prefix throughout branch entity for better clarity
- Code Organization: Moved staged file validation logic from scripts into the commit entity
- Enhanced Validation: Added configurable validation rules with file patterns, content patterns, and ignore rules
- CI Environment Support: Improved error handling and CI environment detection
- Bug Fixes: Fixed duplicate error throwing in commit-check script
## Technical Notes
- No Breaking Changes: All public APIs remain compatible
- Enhanced Validation: New StagedConfig type for configurable validation rules
- Better Separation of Concerns: Validation logic moved from scripts to entities
- Improved Error Reporting: More detailed error messages and better CI handling

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/f04724b8c57dcb1910e83e02283a886ee56a2b9e"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> simplify branch parsing logic in EntityBranch ([f04724b](https://github.com/movahedan/monobun/commit/f04724b8c57dcb1910e83e02283a886ee56a2b9e)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/985900784f4459adc5eafe4d73b8920a8c55d3c5"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> add staged-check to commit entity ([9859007](https://github.com/movahedan/monobun/commit/985900784f4459adc5eafe4d73b8920a8c55d3c5)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/2516669d74bc53aba52b5a1f7477a7fbd52fec84"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> streamline commit and version change ([2516669](https://github.com/movahedan/monobun/commit/2516669d74bc53aba52b5a1f7477a7fbd52fec84)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/902429181a0a8c6152a5d7a34d9cd045b770643a"><img src="https://img.shields.io/badge/release-(noscope)-059669?style=flat" alt="release" style="vertical-align: middle;" /></a> v0.1.0 ([9024291](https://github.com/movahedan/monobun/commit/902429181a0a8c6152a5d7a34d9cd045b770643a)) by **github-actions[bot]**

### 📦 feature/intershell <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/171"><img src="https://img.shields.io/badge/%23171-blue?style=flat" alt="#171" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/24%20commits-green?style=flat" alt="24 commits" style="vertical-align: middle;" />

#### 🎯 Overview
This PR introduces a major architectural refactoring by creating the new  CLI framework package and reorganizing the development infrastructure.
##### ✨ Key Changes
- **New CLI Framework Package**: Created  with core utilities, entities, and interactive CLI capabilities
- **Docker Reorganization**: Moved development Docker files from  to root for better accessibility
- **Script Modernization**: Updated all scripts to use the new intershell package, removing duplicated code
- **Dependency Cleanup**: Removed old entities and shell utilities, added  as workspace dependency
##### 🔧 Technical Notes
- **Breaking Change**: This refactoring removes old CLI utilities from  directory
- **New Package Structure**:  provides modular CLI framework with TypeScript support
- **Improved Maintainability**: Centralized CLI logic reduces code duplication across the monorepo
- **Better Development Experience**: Reorganized Docker setup improves local development workflow

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/fe8a65a1f499b33588bb7a558de88bf1b02fe165"><img src="https://img.shields.io/badge/chore-(noscope)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> reorganize vscode-service configuration in docker-compose.dev.yml ([fe8a65a](https://github.com/movahedan/monobun/commit/fe8a65a1f499b33588bb7a558de88bf1b02fe165)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/04f9843735a05c6de57ab402011b3078bbbc3cba"><img src="https://img.shields.io/badge/docs-(@repo/intershell)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update README.md with dependency graph ([04f9843](https://github.com/movahedan/monobun/commit/04f9843735a05c6de57ab402011b3078bbbc3cba)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/fac2a1de6114513ab8a6744f4c46fcbab16e43c0"><img src="https://img.shields.io/badge/feat-(noscope)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> improve logging in version-prepare script ([fac2a1d](https://github.com/movahedan/monobun/commit/fac2a1de6114513ab8a6744f4c46fcbab16e43c0)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/222aff9f7b1881c9a58d6cf5577fc82daa3245de"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> remove unused changelog template files ([222aff9](https://github.com/movahedan/monobun/commit/222aff9f7b1881c9a58d6cf5577fc82daa3245de)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/6fd33d78f65de3a0a41c85b3aa7c04d6f1162926"><img src="https://img.shields.io/badge/chore-(noscope)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependencies and version management scripts ([6fd33d7](https://github.com/movahedan/monobun/commit/6fd33d78f65de3a0a41c85b3aa7c04d6f1162926)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/6025ea8b169ee74681faa7c5679b369d700d6fee"><img src="https://img.shields.io/badge/feat-(@repo/intershell)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> enhance package and tag management entities ([6025ea8](https://github.com/movahedan/monobun/commit/6025ea8b169ee74681faa7c5679b369d700d6fee)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/0e1b09040f3e7a46355b4f5e66296754e8935de7"><img src="https://img.shields.io/badge/feat-(@repo/intershell)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> improve commit and PR entity functionality ([0e1b090](https://github.com/movahedan/monobun/commit/0e1b09040f3e7a46355b4f5e66296754e8935de7)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/dcc9796f3a004726962d84e1af03bd100be0b418"><img src="https://img.shields.io/badge/feat-(@repo/intershell)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> enhance changelog functionality and wrapshell core ([dcc9796](https://github.com/movahedan/monobun/commit/dcc9796f3a004726962d84e1af03bd100be0b418)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/9d34f92acfdf518914d3d94fef3e5b690bcd564e"><img src="https://img.shields.io/badge/chore-(noscope)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update code docs ([9d34f92](https://github.com/movahedan/monobun/commit/9d34f92acfdf518914d3d94fef3e5b690bcd564e)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/f6ef8aefabc44eb4a30ce7a39fa732b1b013c031"><img src="https://img.shields.io/badge/docs-(root)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update docs ([f6ef8ae](https://github.com/movahedan/monobun/commit/f6ef8aefabc44eb4a30ce7a39fa732b1b013c031)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/c8c3155eb260b3fcebb5d8aef0e05e3562039260"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> correct service entries access in EntityCompose ([c8c3155](https://github.com/movahedan/monobun/commit/c8c3155eb260b3fcebb5d8aef0e05e3562039260)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/c1b60510155bb075e932b3cc36168baffe6c501f"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update service name handling in EntityCompose ([c1b6051](https://github.com/movahedan/monobun/commit/c1b60510155bb075e932b3cc36168baffe6c501f)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/edfcbd2280870725e8854674ea9e7551d2bca3e7"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> correct base SHA retrieval in PR handling ([edfcbd2](https://github.com/movahedan/monobun/commit/edfcbd2280870725e8854674ea9e7551d2bca3e7)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/d0196933cd7f858b70286c472eea39fe30968e88"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> add logging for unsuccessful tag retrieval ([d019693](https://github.com/movahedan/monobun/commit/d0196933cd7f858b70286c472eea39fe30968e88)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/a47c1a90021f6467c9268be76f47e9f3a6790057"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> resolve branch name handling in getBaseTagSha ([a47c1a9](https://github.com/movahedan/monobun/commit/a47c1a90021f6467c9268be76f47e9f3a6790057)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/31bb59ea602f9c91d27920bc4e11707a69a8f8a5"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> increase maxLength for commit description to 100 ([31bb59e](https://github.com/movahedan/monobun/commit/31bb59ea602f9c91d27920bc4e11707a69a8f8a5)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/d49597dff19c7212603f5a8967bce2b4b889dfba"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> remove entity duplication ([d49597d](https://github.com/movahedan/monobun/commit/d49597dff19c7212603f5a8967bce2b4b889dfba)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/afe677d9becd993fbec53deff0f77b864610c6c2"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> resolve SonarQube regex security vulnerability ([afe677d](https://github.com/movahedan/monobun/commit/afe677d9becd993fbec53deff0f77b864610c6c2)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/171a77ec8abbf8e29ca428856c01c642f9ba67d9"><img src="https://img.shields.io/badge/fix-(root)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> resolve update-package-json script issue ([171a77e](https://github.com/movahedan/monobun/commit/171a77ec8abbf8e29ca428856c01c642f9ba67d9)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/598b1d2ff1b59a243e5c2da2eb493c6dd7a2a2b6"><img src="https://img.shields.io/badge/chore-(root)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update biome configuration ([598b1d2](https://github.com/movahedan/monobun/commit/598b1d2ff1b59a243e5c2da2eb493c6dd7a2a2b6)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/b9482d448fb9c49518a95bb59bcecbe135aae3f5"><img src="https://img.shields.io/badge/chore-(root)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> remove old devcontainer files and entities ([b9482d4](https://github.com/movahedan/monobun/commit/b9482d448fb9c49518a95bb59bcecbe135aae3f5)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/d028817a47549924bc26f2af7f9e43c2b7dbe211"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> update scripts to use @repo/intershell package ([d028817](https://github.com/movahedan/monobun/commit/d028817a47549924bc26f2af7f9e43c2b7dbe211)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/b6bb32cc07e50411014387eb368510e77c02dd70"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> move dev Docker files to root directory ([b6bb32c](https://github.com/movahedan/monobun/commit/b6bb32cc07e50411014387eb368510e77c02dd70)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/b68de0c26cdca5f19260673c469c9d527ceafee5"><img src="https://img.shields.io/badge/feat-(@repo/intershell)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add CLI framework package ([b68de0c](https://github.com/movahedan/monobun/commit/b68de0c26cdca5f19260673c469c9d527ceafee5)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/ae16d44e4851d9cbdc4c98c023c3a426cf9e5566"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update dependency astro to v4.16.19 [security] (#170) ([ae16d44](https://github.com/movahedan/monobun/commit/ae16d44e4851d9cbdc4c98c023c3a426cf9e5566)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/75d18fc655d5778516753191b418d0b0337e0691"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency vite to v7.1.3 (#169) ([75d18fc](https://github.com/movahedan/monobun/commit/75d18fc655d5778516753191b418d0b0337e0691)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/72b9b13a41446e9ca2dccc62fd93caa1e33d6f2b"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update dependency next to v15.4.7 (#168) ([72b9b13](https://github.com/movahedan/monobun/commit/72b9b13a41446e9ca2dccc62fd93caa1e33d6f2b)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/0251703316f1180ddb268b45e5e97549e1aa6410"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency turbo to v2.5.6 (#167) ([0251703](https://github.com/movahedan/monobun/commit/0251703316f1180ddb268b45e5e97549e1aa6410)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/fa880eaa12c99b3c102dac98493784627664a55d"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> reorganize InterShell documentation structure ([fa880ea](https://github.com/movahedan/monobun/commit/fa880eaa12c99b3c102dac98493784627664a55d)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/45712b668d757018f20e1470036a339625a2cee8"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update plannings ([45712b6](https://github.com/movahedan/monobun/commit/45712b668d757018f20e1470036a339625a2cee8)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/8309f85182b56c5911802f2ad46d80ff3e00c49c"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update tailwindcss monorepo to v4.1.12 (#163) ([8309f85](https://github.com/movahedan/monobun/commit/8309f85182b56c5911802f2ad46d80ff3e00c49c)) by **renovate[bot]**

### 🐛 fix/auto-versioning <img src="https://img.shields.io/badge/Bug%20Fixes%20%26%20Improvements-495057?style=flat" alt="Bug Fixes & Improvements" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/162"><img src="https://img.shields.io/badge/%23162-blue?style=flat" alt="#162" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/5%20commits-green?style=flat" alt="5 commits" style="vertical-align: middle;" />

Updates documentation to reflect the recent fixes for PR commit detection and version bump logic.
    AI Prompt: Added changelog generation documentation and PR commit handling
    Auto Versioning: Documented enhanced changelog features and PR commit grouping
    Development Flows: Added changelog generation workflow documentation
    Scripting: Documented EntityPr and enhanced changelog capabilities

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/ddaedad50b425f530d1aab21bf1a02fa6490093a"><img src="https://img.shields.io/badge/docs-(scripts)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update documentation for PR commit detection and version bump fixes ([ddaedad](https://github.com/movahedan/monobun/commit/ddaedad50b425f530d1aab21bf1a02fa6490093a)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/3d22a5a5f7116decb19e7ec36d77ed9762e72683"><img src="https://img.shields.io/badge/feat-(scripts)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> enhance changelog categorization for PR commits ([3d22a5a](https://github.com/movahedan/monobun/commit/3d22a5a5f7116decb19e7ec36d77ed9762e72683)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/725369efca4c508b18783863d54d59c21fd0510f"><img src="https://img.shields.io/badge/refactor-(scripts)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> improve version bump detection logic ([725369e](https://github.com/movahedan/monobun/commit/725369efca4c508b18783863d54d59c21fd0510f)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/1aa9c4543c733e0dbad6f22cc8be9dd35eb007a1"><img src="https://img.shields.io/badge/fix-(scripts)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> improve PR commit detection for squash merges ([1aa9c45](https://github.com/movahedan/monobun/commit/1aa9c4543c733e0dbad6f22cc8be9dd35eb007a1)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/5fbfe2e7610030acb60ecd5aa797b0b2585b2214"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> ensure CI pipeline pushes both commit changes and tags ([5fbfe2e](https://github.com/movahedan/monobun/commit/5fbfe2e7610030acb60ecd5aa797b0b2585b2214)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/95c2cb537e582227e53fc14ffb885953afaddf1f"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> ensure CI pipeline pushes both commit changes and tags ([95c2cb5](https://github.com/movahedan/monobun/commit/95c2cb537e582227e53fc14ffb885953afaddf1f)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/04601d7acf009cc0b744f3ac548477be235fefd4"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> reorganize README structure and move services section ([04601d7](https://github.com/movahedan/monobun/commit/04601d7acf009cc0b744f3ac548477be235fefd4)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/90210706e4485f7291f36247a34fefe99eb3f83e"><img src="https://img.shields.io/badge/feat-(scripts)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add base-sha parameter and auto-detection to ci-attach-affected script ([9021070](https://github.com/movahedan/monobun/commit/90210706e4485f7291f36247a34fefe99eb3f83e)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/bed9441f1cd06af7cd31574b296116453e94c2e2"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> enhance README with improved sections and scripting info ([bed9441](https://github.com/movahedan/monobun/commit/bed9441f1cd06af7cd31574b296116453e94c2e2)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/ff0964f8c0eedcf1cc519ef5b247ac458bfa44c6"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> center README content ([ff0964f](https://github.com/movahedan/monobun/commit/ff0964f8c0eedcf1cc519ef5b247ac458bfa44c6)) by **Soheil Movahedan**

### 🔄 refactor/rename-project-to-monobun <img src="https://img.shields.io/badge/Code%20Quality%20%26%20Refactoring-495057?style=flat" alt="Code Quality & Refactoring" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/161"><img src="https://img.shields.io/badge/%23161-blue?style=flat" alt="#161" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

refactor: rename project from Turbobun to Monobun

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/66e4dadf774f24dfaf9936bfbda50f1d7e4b030d"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> Squashed changes from PR (rename project from Turbobun to Monobun) ([66e4dad](https://github.com/movahedan/monobun/commit/66e4dadf774f24dfaf9936bfbda50f1d7e4b030d)) by **Soheil Movahedan**

</details>


### 📚 docs/entity-based-architecture-updates <img src="https://img.shields.io/badge/Documentation-495057?style=flat" alt="Documentation" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/160"><img src="https://img.shields.io/badge/%23160-blue?style=flat" alt="#160" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/5%20commits-green?style=flat" alt="5 commits" style="vertical-align: middle;" />

This PR comprehensively updates all documentation to reflect the new entity-based architecture and enhanced automation system.
� What's Updated:
    - Quality Checklist: Enhanced standards for entity-based development
    - AI Prompt: Comprehensive guidelines for AI assistants
    - Setup Flows: Enhanced automation workflows and CLI systems
    - Development Flows: Updated development processes and CI/CD integration
    - Scripting Guide: Advanced automation system documentation
    - Auto Versioning: Entity-based version management workflows
    - README: Updated project overview and features
    - Scripts README: Enhanced automation system documentation

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/3a0f9ef0406369efe60668628f8478cf85929ee7"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> remove --all flag from version-prepare script and update package.json ([3a0f9ef](https://github.com/movahedan/monobun/commit/3a0f9ef0406369efe60668628f8478cf85929ee7)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/ac51155ee617c2675ee808e5fcd587e18d66efdc"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update README and scripts README for enhanced automation system ([ac51155](https://github.com/movahedan/monobun/commit/ac51155ee617c2675ee808e5fcd587e18d66efdc)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/e38d59f228a734bcafbed3873d0fd287e3093e02"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update scripting guide and auto versioning for entity-based architecture ([e38d59f](https://github.com/movahedan/monobun/commit/e38d59f228a734bcafbed3873d0fd287e3093e02)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/368acbbb182717755800a68ad5be59607bf15899"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update setup and development flows for enhanced automation system ([368acbb](https://github.com/movahedan/monobun/commit/368acbbb182717755800a68ad5be59607bf15899)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/f631585a472eec443f761384f0aa67156d81c871"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update quality checklist and AI prompt for entity-based architecture ([f631585](https://github.com/movahedan/monobun/commit/f631585a472eec443f761384f0aa67156d81c871)) by **Soheil Movahedan**

</details>


### 🚀 movahedan/feat/version-management-multi-package <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/159"><img src="https://img.shields.io/badge/%23159-blue?style=flat" alt="#159" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

Enhances the version management system to support processing all packages in the workspace by default, while maintaining backward compatibility for single package processing.

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/247bc0e052b6c5b34b79d917036b44656c8450c0"><img src="https://img.shields.io/badge/feat-(noscope)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> Squashed changes from PR (enhance version management for multi-package processing) ([247bc0e](https://github.com/movahedan/monobun/commit/247bc0e052b6c5b34b79d917036b44656c8450c0)) by **Soheil Movahedan**

</details>


### 🔄 feature/custom-version-management <img src="https://img.shields.io/badge/Code%20Quality%20%26%20Refactoring-495057?style=flat" alt="Code Quality & Refactoring" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/154"><img src="https://img.shields.io/badge/%23154-blue?style=flat" alt="#154" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/37%20commits-green?style=flat" alt="37 commits" style="vertical-align: middle;" />

Refactors the version management system from a monolithic approach to a modular, 
entity-based architecture for better maintainability and separation of concerns.
- New Entity System: Implemented modular entities for changelog management, 
  package operations, and workspace handling
- Streamlined Scripts: Replaced 5 old version scripts with 3 focused scripts 
  (prepare, apply, ci)
- Better Architecture: Separated concerns between version preparation, 
  application, and CI workflows
- Secure Commit Validation: Built comprehensive validation system to replace 
  external commitlint dependencies
- Security Fixes: Resolved ReDoS vulnerabilities and implemented secure regex practices
- Code Quality: Eliminated duplication across CLI tools and commit types
- Interactive CLI: Added modern CLI with callback-based key handling
- Git Integration: Fixed commit message parsing and scope validation
- Updated Documentation: Synchronized all docs to reflect the new architecture
This completes the transformation from legacy version management to a robust, 
secure, and maintainable system.

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/ffbaf81441d032858ecee772fab304d54e220c38"><img src="https://img.shields.io/badge/feat-(scripts)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add scripts as valid commit scope ([ffbaf81](https://github.com/movahedan/monobun/commit/ffbaf81441d032858ecee772fab304d54e220c38)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/cc167a0abf140e447879ede6cfb2f5e2e16e7a6c"><img src="https://img.shields.io/badge/fix-(root)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> handle trailing newlines in commit message validation ([cc167a0](https://github.com/movahedan/monobun/commit/cc167a0abf140e447879ede6cfb2f5e2e16e7a6c)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/1fca8463b4c7f57b77145874b9480efc83420bdf"><img src="https://img.shields.io/badge/refactor-(scripts)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> eliminate duplication in CLI tools ([1fca846](https://github.com/movahedan/monobun/commit/1fca8463b4c7f57b77145874b9480efc83420bdf)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/f1f23be1a4e90452c336d9b570b6431d327fba1d"><img src="https://img.shields.io/badge/refactor-(types)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> eliminate duplication in commit types ([f1f23be](https://github.com/movahedan/monobun/commit/f1f23be1a4e90452c336d9b570b6431d327fba1d)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/197b1a39903f1a4e04022c9dafca2c7a2e0a2f76"><img src="https://img.shields.io/badge/refactor-(scripts)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> remove duplicate quickActions arrays ([197b1a3](https://github.com/movahedan/monobun/commit/197b1a39903f1a4e04022c9dafca2c7a2e0a2f76)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/8205f95562cf1fe4999f81c2d50d59b97e27cc49"><img src="https://img.shields.io/badge/refactor-(scripts)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> eliminate commit type duplication ([8205f95](https://github.com/movahedan/monobun/commit/8205f95562cf1fe4999f81c2d50d59b97e27cc49)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/d1283fd5607f9e0de661f55185aee6543128686d"><img src="https://img.shields.io/badge/fix-(scripts)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> secure regex patterns to prevent ReDoS attacks ([d1283fd](https://github.com/movahedan/monobun/commit/d1283fd5607f9e0de661f55185aee6543128686d)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/53bcc994019d0ef71d23609ad756aa330c0d397b"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> optimize getAffectedServices with single-pass processing ([53bcc99](https://github.com/movahedan/monobun/commit/53bcc994019d0ef71d23609ad756aa330c0d397b)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/17f60c848b868f1b0373ea96c68da0ee783d4bc9"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> update commit validation and check logic ([17f60c8](https://github.com/movahedan/monobun/commit/17f60c848b868f1b0373ea96c68da0ee783d4bc9)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/d5f212f53ce012bc1b9ba40452e200d998a0092f"><img src="https://img.shields.io/badge/perf-(root)-60a5fa?style=flat" alt="perf" style="vertical-align: middle;" /></a> optimize package operations and simplify version management ([d5f212f](https://github.com/movahedan/monobun/commit/d5f212f53ce012bc1b9ba40452e200d998a0092f)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/491c9af7a51a8c19b01367777254d1ead511eb5e"><img src="https://img.shields.io/badge/feat-(root)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> enhance changelog generation and management ([491c9af](https://github.com/movahedan/monobun/commit/491c9af7a51a8c19b01367777254d1ead511eb5e)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/3c542c44a0d6a1ae42bd93a5765e87a32cf7d59a"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> extract PR handling and enhance commit types ([3c542c4](https://github.com/movahedan/monobun/commit/3c542c44a0d6a1ae42bd93a5765e87a32cf7d59a)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/463d9e3bc403426596f962c82f8ec114989cbcb8"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> improve changelog and commit management entities ([463d9e3](https://github.com/movahedan/monobun/commit/463d9e3bc403426596f962c82f8ec114989cbcb8)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/65c7cf5ef3ebff992698629d6c545bbaf1893699"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> changelog ([65c7cf5](https://github.com/movahedan/monobun/commit/65c7cf5ef3ebff992698629d6c545bbaf1893699)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/3f17cb554a4a29e7e4a19e683455ab050bf806d7"><img src="https://img.shields.io/badge/fix-(root)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update branch name check command in CI configuration ([3f17cb5](https://github.com/movahedan/monobun/commit/3f17cb554a4a29e7e4a19e683455ab050bf806d7)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/837d60c2bb29ac2605704a6040da8d09092321ca"><img src="https://img.shields.io/badge/fix-(root)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> regex vulnerability to super-linear runtime due to backtracking ([837d60c](https://github.com/movahedan/monobun/commit/837d60c2bb29ac2605704a6040da8d09092321ca)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/b37e15986ae58fd721675826fde24742afcab926"><img src="https://img.shields.io/badge/merge-(noscope)-6B7280?style=flat" alt="merge" style="vertical-align: middle;" /></a> Merge branch 'main' into feature/custom-version-management ([b37e159](https://github.com/movahedan/monobun/commit/b37e15986ae58fd721675826fde24742afcab926)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/108e8b7a31f920b9986cc0f46642f68afc172ee8"><img src="https://img.shields.io/badge/fix-(root)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> attach affected script for turbo ([108e8b7](https://github.com/movahedan/monobun/commit/108e8b7a31f920b9986cc0f46642f68afc172ee8)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/bd76b9a0661473c6934c6849152e976e29559a18"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> remove old version management scripts and utilities ([bd76b9a](https://github.com/movahedan/monobun/commit/bd76b9a0661473c6934c6849152e976e29559a18)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/c1dae1ef11b73d4f96472aca4a3e1cb98f173c58"><img src="https://img.shields.io/badge/chore-(root)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependencies and configuration for new architecture ([c1dae1e](https://github.com/movahedan/monobun/commit/c1dae1ef11b73d4f96472aca4a3e1cb98f173c58)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/9ef9a2626f03bba09fb94e81ce1c3e7807603df6"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> update existing scripts for new entity-based architecture ([9ef9a26](https://github.com/movahedan/monobun/commit/9ef9a2626f03bba09fb94e81ce1c3e7807603df6)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/e76fa8f4dd4857d616bec0f1fd090153046b8ac8"><img src="https://img.shields.io/badge/feat-(root)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add new version management scripts with entity-based architecture ([e76fa8f](https://github.com/movahedan/monobun/commit/e76fa8f4dd4857d616bec0f1fd090153046b8ac8)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/0c927e8cf7f8e238d4ecbf1f0446e8a4a47bee15"><img src="https://img.shields.io/badge/feat-(root)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> implement entity-based architecture for version management ([0c927e8](https://github.com/movahedan/monobun/commit/0c927e8cf7f8e238d4ecbf1f0446e8a4a47bee15)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/459a77a3e90d94d7fc1b3c336c6e02bcdb53efdb"><img src="https://img.shields.io/badge/docs-(root)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update documentation for new entity-based version management ([459a77a](https://github.com/movahedan/monobun/commit/459a77a3e90d94d7fc1b3c336c6e02bcdb53efdb)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/3791f6cc6a25f067d29c84386e041b5faefd7458"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> replace vulnerable regex patterns with trimEnd() to prevent ReDoS attacks ([3791f6c](https://github.com/movahedan/monobun/commit/3791f6cc6a25f067d29c84386e041b5faefd7458)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/12f1c895bd556e04c38d5b8725eaf5fda04e3daf"><img src="https://img.shields.io/badge/chore-(root)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> exclude scripts directory from test coverage ([12f1c89](https://github.com/movahedan/monobun/commit/12f1c895bd556e04c38d5b8725eaf5fda04e3daf)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/ab302c36ff6f65ee44b8efcbcc96887b034ea505"><img src="https://img.shields.io/badge/test-(root)-10B981?style=flat" alt="test" style="vertical-align: middle;" /></a> check if package list output is fixed ([ab302c3](https://github.com/movahedan/monobun/commit/ab302c36ff6f65ee44b8efcbcc96887b034ea505)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/8c63d4c6f2a6bc29220aaba96374c4a47c1f0d05"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> update lefthook and ci workflows ([8c63d4c](https://github.com/movahedan/monobun/commit/8c63d4c6f2a6bc29220aaba96374c4a47c1f0d05)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/6e862c5afe03bf169c0afee6ae46ff1c4f74375a"><img src="https://img.shields.io/badge/chore-(root)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> remove commitlint dependencies and update scripts ([6e862c5](https://github.com/movahedan/monobun/commit/6e862c5afe03bf169c0afee6ae46ff1c4f74375a)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/dd40c62cf9423584accf069bc4e502e97c3f3876"><img src="https://img.shields.io/badge/chore-(root)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> remove legacy CI scripts and commitlint config ([dd40c62](https://github.com/movahedan/monobun/commit/dd40c62cf9423584accf069bc4e502e97c3f3876)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/9017136cbf6d03854beccd7ba3df6f9581162b69"><img src="https://img.shields.io/badge/feat-(root)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add commit-check and commit-staged-check scripts to replace external commitlint dependencies ([9017136](https://github.com/movahedan/monobun/commit/9017136cbf6d03854beccd7ba3df6f9581162b69)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/a1c1d19ac43c14a4d49a18cf2f5cfd6231b8f209"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> merge step manager into commit-interactive and remove unnecessary complexity ([a1c1d19](https://github.com/movahedan/monobun/commit/a1c1d19ac43c14a4d49a18cf2f5cfd6231b8f209)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/c14afc6f23359269e9da0dacf9d3a83864d8f7f0"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> consolidate commit parsing logic into shared utilities ([c14afc6](https://github.com/movahedan/monobun/commit/c14afc6f23359269e9da0dacf9d3a83864d8f7f0)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/0b7f0da259104d4b4a80d77318b55cfdbbf6ff7f"><img src="https://img.shields.io/badge/feat-(root)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add InteractiveCLI with callback-based key handling ([0b7f0da](https://github.com/movahedan/monobun/commit/0b7f0da259104d4b4a80d77318b55cfdbbf6ff7f)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/cd0d521425be634470e4e234421615caa8cb574d"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> update build configuration and generated files ([cd0d521](https://github.com/movahedan/monobun/commit/cd0d521425be634470e4e234421615caa8cb574d)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/50dc3457473b592bc2d316b4f33fb8f522b4f1b5"><img src="https://img.shields.io/badge/docs-(root)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update documentation for new version management system ([50dc345](https://github.com/movahedan/monobun/commit/50dc3457473b592bc2d316b4f33fb8f522b4f1b5)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/a3e82ef0201cfb912930f1512352a743da9ed771"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> replace changesets with custom version management ([a3e82ef](https://github.com/movahedan/monobun/commit/a3e82ef0201cfb912930f1512352a743da9ed771)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/c5772d634900b0257fa935b9a928365112c50eb7"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency lefthook to v1.12.3 (#158) ([c5772d6](https://github.com/movahedan/monobun/commit/c5772d634900b0257fa935b9a928365112c50eb7)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/3f95fe8ff8cdcc0797b8cc776a4a90ddfdc0e08a"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency vite to v7.1.2 (#157) ([3f95fe8](https://github.com/movahedan/monobun/commit/3f95fe8ff8cdcc0797b8cc776a4a90ddfdc0e08a)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/b37e15986ae58fd721675826fde24742afcab926"><img src="https://img.shields.io/badge/merge-(noscope)-6B7280?style=flat" alt="merge" style="vertical-align: middle;" /></a> Merge branch 'main' into feature/custom-version-management ([b37e159](https://github.com/movahedan/monobun/commit/b37e15986ae58fd721675826fde24742afcab926)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/8f5cbd8ddeb82bdacee38c66dc01119337126471"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update dependency @types/react to v19.1.10 (#156) ([8f5cbd8](https://github.com/movahedan/monobun/commit/8f5cbd8ddeb82bdacee38c66dc01119337126471)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/6f6d803c9156c2e249c86bae291d826e7c37ad3b"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update oven/bun docker tag to v1.2.20 (#153) ([6f6d803](https://github.com/movahedan/monobun/commit/6f6d803c9156c2e249c86bae291d826e7c37ad3b)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/8ee223cf0faf36298984bceba994c5e86c6f2a29"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency bun-types to v1.2.20 (#155) ([8ee223c](https://github.com/movahedan/monobun/commit/8ee223cf0faf36298984bceba994c5e86c6f2a29)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/20487e08fbdc6cd5b4ac4ef58477da5b09d10ffd"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> pin dependencies (#152) ([20487e0](https://github.com/movahedan/monobun/commit/20487e08fbdc6cd5b4ac4ef58477da5b09d10ffd)) by **renovate[bot]**

### 🚀 feature/astro <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/150"><img src="https://img.shields.io/badge/%23150-blue?style=flat" alt="#150" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/9%20commits-green?style=flat" alt="9 commits" style="vertical-align: middle;" />

✨ Key Changes
Complete Astro documentation site with Tailwind CSS
Comprehensive documentation content (installation, setup, dev flows)
Docker configuration for deployment
GitHub Pages deployment setup
Mobile navigation component
Planning documentation for enterprise environments

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/b5253439579230230fd8dcbb1cd19314c0e2c10a"><img src="https://img.shields.io/badge/fix-(root)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> check.yml deps issue ([b525343](https://github.com/movahedan/monobun/commit/b5253439579230230fd8dcbb1cd19314c0e2c10a)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/b66ec1f3f260ad90102b9fce635f76b2dde158d0"><img src="https://img.shields.io/badge/fix-(admin,docs%20astro,@repo/ui)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> set nginx user as runner ([b66ec1f](https://github.com/movahedan/monobun/commit/b66ec1f3f260ad90102b9fce635f76b2dde158d0)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/5050540b4279174bd6e437b5ab06c56045fdecc9"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> standardize user to runner-user and improve security ([5050540](https://github.com/movahedan/monobun/commit/5050540b4279174bd6e437b5ab06c56045fdecc9)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/af955ee074457833d446fc0a20ae2660354de279"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> standardize user to runner-user and improve security ([af955ee](https://github.com/movahedan/monobun/commit/af955ee074457833d446fc0a20ae2660354de279)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/0a2a64945247fd0094f0c89777857951c83e121c"><img src="https://img.shields.io/badge/fix-(root)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update ci-staged to properly ignore new package.json files ([0a2a649](https://github.com/movahedan/monobun/commit/0a2a64945247fd0094f0c89777857951c83e121c)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/f9835466dcaf46be99fe5a732cbdb605d9ea2229"><img src="https://img.shields.io/badge/feat-(docs%20astro)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add initial astro documentation site ([f983546](https://github.com/movahedan/monobun/commit/f9835466dcaf46be99fe5a732cbdb605d9ea2229)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/74dd18bd167d74932242e2d3285138b1238ba5a9"><img src="https://img.shields.io/badge/chore-(noscope)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update rules ([74dd18b](https://github.com/movahedan/monobun/commit/74dd18bd167d74932242e2d3285138b1238ba5a9)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/0fe82f34b3f9aa2bc0b863ed32b03534ed75b1e4"><img src="https://img.shields.io/badge/feat-(root)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> update admin and ui nginx to use envs ([0fe82f3](https://github.com/movahedan/monobun/commit/0fe82f34b3f9aa2bc0b863ed32b03534ed75b1e4)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/f3e347e88810701cb30cc5c948d7962c61406edc"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> prepare repo scripts for installing a new app ([f3e347e](https://github.com/movahedan/monobun/commit/f3e347e88810701cb30cc5c948d7962c61406edc)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/f6c502eb189269072d60f2a45d6db7813e666527"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency vite to v7.1.1 (#151) ([f6c502e](https://github.com/movahedan/monobun/commit/f6c502eb189269072d60f2a45d6db7813e666527)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/40068f9af68a4c63b6fb31607f4eaea2d80b276a"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency vite to v7.1.0 (#149) ([40068f9](https://github.com/movahedan/monobun/commit/40068f9af68a4c63b6fb31607f4eaea2d80b276a)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/91ddebcb1fa659bdde11d535235926b7662133c5"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update dependency next to v15.4.6 (#148) ([91ddebc](https://github.com/movahedan/monobun/commit/91ddebcb1fa659bdde11d535235926b7662133c5)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/acaf96493601516a218c2b1e73ddb7cc779caf3f"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency yaml to v2.8.1 (#147) ([acaf964](https://github.com/movahedan/monobun/commit/acaf96493601516a218c2b1e73ddb7cc779caf3f)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/16bba3d139b8cb4a4b569dfe2a1769994a0f0918"><img src="https://img.shields.io/badge/docs-(root)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> :fire: create a nice readme.md xd ([16bba3d](https://github.com/movahedan/monobun/commit/16bba3d139b8cb4a4b569dfe2a1769994a0f0918)) by **Soheil Movahedan**

### 🐛 fix/improve-git-command-handling <img src="https://img.shields.io/badge/Bug%20Fixes%20%26%20Improvements-495057?style=flat" alt="Bug Fixes & Improvements" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/145"><img src="https://img.shields.io/badge/%23145-blue?style=flat" alt="#145" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(root): improve git command output handling and version tag logic
    Added proper string trimming for git command outputs to prevent whitespace issues
    Improved version tag SHA comparison logic with fallback to previous tags
    Enhanced affected packages detection with special handling when current SHA equals version tag SHA
    Better error handling and edge case management for version commit workflow

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/eb3d757ebf65d401671b23b7d1836bbd1822c57c"><img src="https://img.shields.io/badge/fix-(root)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> Squashed changes from PR (improve git command output handling and version tag logic) ([eb3d757](https://github.com/movahedan/monobun/commit/eb3d757ebf65d401671b23b7d1836bbd1822c57c)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/dee8e9ac9045808d653fcf06f117406a5bcd73fa"><img src="https://img.shields.io/badge/other-(noscope)-6B7280?style=flat" alt="other" style="vertical-align: middle;" /></a> RELEASING: Releasing 7 package(s) ([dee8e9a](https://github.com/movahedan/monobun/commit/dee8e9ac9045808d653fcf06f117406a5bcd73fa)) by **github-actions[bot]**

### 🔄 refactor/test-versioning <img src="https://img.shields.io/badge/Code%20Quality%20%26%20Refactoring-495057?style=flat" alt="Code Quality & Refactoring" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/144"><img src="https://img.shields.io/badge/%23144-blue?style=flat" alt="#144" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/9%20commits-green?style=flat" alt="9 commits" style="vertical-align: middle;" />

docs(root): reorganize documentation and add comprehensive commit workflow
    Added interactive commit-and-documentation workflow
    Reorganized documentation structure with enhanced AI guidelines
    Updated testing patterns and best practices
    Modernized versioning documentation approach
    Enhanced development workflows and setup flows

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/19940c93978e461563cdff655d960965a2223dfd"><img src="https://img.shields.io/badge/docs-(root)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> reorganize documentation and add commit workflow ([19940c9](https://github.com/movahedan/monobun/commit/19940c93978e461563cdff655d960965a2223dfd)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/4a858c8fceeb58b9adcfd989c2053c9361b7ae90"><img src="https://img.shields.io/badge/feat-(root)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> create ci-staged script ([4a858c8](https://github.com/movahedan/monobun/commit/4a858c8fceeb58b9adcfd989c2053c9361b7ae90)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/52188752c6cabeb99715539964d8a3a1f3b2c555"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> get-all-directories ([5218875](https://github.com/movahedan/monobun/commit/52188752c6cabeb99715539964d8a3a1f3b2c555)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/368e1893ffdbb9efff8a20a0b0408aaf1d2ccf0c"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> delete logger package and move it to utils ([368e189](https://github.com/movahedan/monobun/commit/368e1893ffdbb9efff8a20a0b0408aaf1d2ccf0c)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/e3a1294680fce7c0b2ee763fac7875888a364e3d"><img src="https://img.shields.io/badge/chore-(noscope)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> just none-sense improvements haha ([e3a1294](https://github.com/movahedan/monobun/commit/e3a1294680fce7c0b2ee763fac7875888a364e3d)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/c83570bd538f6624d5e00333174e013232af76df"><img src="https://img.shields.io/badge/chore-(root)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> rename script/utils => script/scripting-utils ([c83570b](https://github.com/movahedan/monobun/commit/c83570bd538f6624d5e00333174e013232af76df)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/20923ee3875bba9a8ff3a12c8fecdca58f2f849a"><img src="https://img.shields.io/badge/perf-(root)-60a5fa?style=flat" alt="perf" style="vertical-align: middle;" /></a> remove chalk form repo, write colorify instead ([20923ee](https://github.com/movahedan/monobun/commit/20923ee3875bba9a8ff3a12c8fecdca58f2f849a)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/bbaca2b0130498f3746d0a9763e7ccf40acff9fd"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> use bun file api as much as possible ([bbaca2b](https://github.com/movahedan/monobun/commit/bbaca2b0130498f3746d0a9763e7ccf40acff9fd)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/7bac340e41199234f0422a91c43ba29b9a7b96a5"><img src="https://img.shields.io/badge/style-(root)-8B5CF6?style=flat" alt="style" style="vertical-align: middle;" /></a> change biome formatter linewidth => 100 ([7bac340](https://github.com/movahedan/monobun/commit/7bac340e41199234f0422a91c43ba29b9a7b96a5)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/5fb458218f67df00746ad1ff43d20276ac2f504f"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> resolve javascript hoisting issue in version-commit script ([5fb4582](https://github.com/movahedan/monobun/commit/5fb458218f67df00746ad1ff43d20276ac2f504f)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/548e261e5092506185325b4cb154d218499eb241"><img src="https://img.shields.io/badge/other-(noscope)-6B7280?style=flat" alt="other" style="vertical-align: middle;" /></a> RELEASING: Releasing 8 package(s) ([548e261](https://github.com/movahedan/monobun/commit/548e261e5092506185325b4cb154d218499eb241)) by **github-actions[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/f4ed6b05a99d200f27f9746c9881b18001808a53"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> version flow ([f4ed6b0](https://github.com/movahedan/monobun/commit/f4ed6b05a99d200f27f9746c9881b18001808a53)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/a21e3fab8c21f521060a8fbf553a43de928b2ab5"><img src="https://img.shields.io/badge/feat-(noscope)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> implement working github actions authentication for versioning ([a21e3fa](https://github.com/movahedan/monobun/commit/a21e3fab8c21f521060a8fbf553a43de928b2ab5)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/e64caeb6cf2259b9179bedc0690b43fa1d12db8a"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> add write permissions to version workflow ([e64caeb](https://github.com/movahedan/monobun/commit/e64caeb6cf2259b9179bedc0690b43fa1d12db8a)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/c27ebfd872bee0221bc1f617df66c41934ed3e9d"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> add version fields to utility packages and update versioning logic ([c27ebfd](https://github.com/movahedan/monobun/commit/c27ebfd872bee0221bc1f617df66c41934ed3e9d)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/6678a5f64c67d26bf63f0bc4a2fe55620b1169b1"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> add auto-ignore logic to version-commit script ([6678a5f](https://github.com/movahedan/monobun/commit/6678a5f64c67d26bf63f0bc4a2fe55620b1169b1)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/716b8aab1d2648ee92e150a26c6201862d513b9c"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> rename config-typescript to typescript-config for consistency ([716b8aa](https://github.com/movahedan/monobun/commit/716b8aab1d2648ee92e150a26c6201862d513b9c)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/0c78b5b46a01e2a4125088feb71be5476874248f"><img src="https://img.shields.io/badge/fix-(root)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> version pipeline ([0c78b5b](https://github.com/movahedan/monobun/commit/0c78b5b46a01e2a4125088feb71be5476874248f)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/5bc59cf7be1c7ee2e54cb2a3073acbe3cf10eaab"><img src="https://img.shields.io/badge/chore-(noscope)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> improve logs ([5bc59cf](https://github.com/movahedan/monobun/commit/5bc59cf7be1c7ee2e54cb2a3073acbe3cf10eaab)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/76f122a0d9d064a0c2de837759b6250f58ac827f"><img src="https://img.shields.io/badge/feat-(noscope)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> implement git tag-based versioning and deployment system ([76f122a](https://github.com/movahedan/monobun/commit/76f122a0d9d064a0c2de837759b6250f58ac827f)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/9615791b4b0c84b6a2dbbde40d92f4a29dbd3495"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> remove arg-parser and move it to create-scripts ([9615791](https://github.com/movahedan/monobun/commit/9615791b4b0c84b6a2dbbde40d92f4a29dbd3495)) by **Soheil Movahedan**

### 🚀 feature/auto-version <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/141"><img src="https://img.shields.io/badge/%23141-blue?style=flat" alt="#141" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

Pull Request Overview
This PR implements a comprehensive automated version management system that splits the monolithic version management approach into focused, single-purpose scripts with intelligent changeset creation and CI/CD integration.
    Replaces manual version workflow with automated changeset creation based on affected packages
    Introduces intelligent deployment analysis that filters packages by version fields
    Integrates version management directly into GitHub Actions PR and main branch workflows
    Split monolithic version.ts into focused single-purpose scripts
    Add version-add-auto.ts for automated changeset creation
    Add version-deploy.ts for deployment analysis
    Add ci-attach-packages-to-deploy.ts for CI integration
    Filter to only packages with version fields (exclude libraries)
    Update GitHub Actions workflows to use new scripts
    Merge version management documentation into comprehensive guide
    Remove version fields from library packages
    Update package.json scripts for new workflow
    Delete old monolithic scripts and documentation
    Implement dynamic scope generation from monorepo structure
    Update commitlint to validate scopes against generated list
    Update local-vscode.ts to sync scopes to both .vscode and devcontainer
    Ensure scopes follow lowercase convention for commitlint compliance

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/3f88ffc04e06191bbbd417317c1a835f08dfc31c"><img src="https://img.shields.io/badge/feat-(root)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> Squashed changes from PR (implement automated version management with dynamic scopes) ([3f88ffc](https://github.com/movahedan/monobun/commit/3f88ffc04e06191bbbd417317c1a835f08dfc31c)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/29f072c474eb166b9ce5bca579207a0a011a044c"><img src="https://img.shields.io/badge/merge-(noscope)-6B7280?style=flat" alt="merge" style="vertical-align: middle;" /></a> Merge branch 'feature/auto-version' ([29f072c](https://github.com/movahedan/monobun/commit/29f072c474eb166b9ce5bca579207a0a011a044c)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/d08055444745cb15b5e879e45a44cc2fcb594158"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency typescript to v5.9.2 (#139) ([d080554](https://github.com/movahedan/monobun/commit/d08055444745cb15b5e879e45a44cc2fcb594158)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/8342e1ad318e4aadefdce3f93eded2f97e58917d"><img src="https://img.shields.io/badge/chore-(noscope)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> switch to 'bun test' globally and cleanup configuration ([8342e1a](https://github.com/movahedan/monobun/commit/8342e1ad318e4aadefdce3f93eded2f97e58917d)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/fc229e1f18f233288b1ab93b68b10b461041b87c"><img src="https://img.shields.io/badge/other-(noscope)-6B7280?style=flat" alt="other" style="vertical-align: middle;" /></a> wip ([fc229e1](https://github.com/movahedan/monobun/commit/fc229e1f18f233288b1ab93b68b10b461041b87c)) by **Soheil Movahedan**

### 🔄 refactor/dev-setup <img src="https://img.shields.io/badge/Code%20Quality%20%26%20Refactoring-495057?style=flat" alt="Code Quality & Refactoring" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/137"><img src="https://img.shields.io/badge/%23137-blue?style=flat" alt="#137" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/8%20commits-green?style=flat" alt="8 commits" style="vertical-align: middle;" />

This PR refactors the development setup to improve containerization and environment configuration management. The changes focus on standardizing port configurations, removing hardcoded values, and streamlining Docker and DevContainer workflows.
    Removed hardcoded ports and host configurations from Dockerfiles and configuration files
    Standardized environment variable handling using Docker Compose env_file directives and centralized configuration
    Updated port mappings with UI service moving from port 3006 to 3004 for consistency

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/7f8d42874bb50752593c5032599b3572eef784fa"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> add environment configuration strategy to setup flows ([7f8d428](https://github.com/movahedan/monobun/commit/7f8d42874bb50752593c5032599b3572eef784fa)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/2c06a882125fbf3dcc977d0f67b1c4cf0a1ed748"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update documentation to reflect recent implementation changes ([2c06a88](https://github.com/movahedan/monobun/commit/2c06a882125fbf3dcc977d0f67b1c4cf0a1ed748)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/d1e9699b3c58eb9ab3ce35f72e760157e44050b0"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update development dependencies and configurations ([d1e9699](https://github.com/movahedan/monobun/commit/d1e9699b3c58eb9ab3ce35f72e760157e44050b0)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/c6ead2e5f8643f45e073e53934639555220ff5b6"><img src="https://img.shields.io/badge/chore-(scripts)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> improve script execution and logging ([c6ead2e](https://github.com/movahedan/monobun/commit/c6ead2e5f8643f45e073e53934639555220ff5b6)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/4a25790eeddf8b5f788389b6a13509ef7660497e"><img src="https://img.shields.io/badge/refactor-(build)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> optimize turbo configuration for development workflow ([4a25790](https://github.com/movahedan/monobun/commit/4a25790eeddf8b5f788389b6a13509ef7660497e)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/e14a5c4cfb5cf0b5e88b1f4e07996e9349fe88e9"><img src="https://img.shields.io/badge/refactor-(dev)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> update development scripts for container compatibility ([e14a5c4](https://github.com/movahedan/monobun/commit/e14a5c4cfb5cf0b5e88b1f4e07996e9349fe88e9)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/571cc9b91cd8611b0d79013069e3194cbc0a6926"><img src="https://img.shields.io/badge/refactor-(docker)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> remove unnecessary expose and env declarations ([571cc9b](https://github.com/movahedan/monobun/commit/571cc9b91cd8611b0d79013069e3194cbc0a6926)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/2f55972a0f657053f6619009e19058ebec2e1c7f"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> update devcontainer and ci/cd configuration ([2f55972](https://github.com/movahedan/monobun/commit/2f55972a0f657053f6619009e19058ebec2e1c7f)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/4dbaa05c90ce57f813bfd12ef86dc8df654bbe12"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update dependency next to v15.4.5 (#136) ([4dbaa05](https://github.com/movahedan/monobun/commit/4dbaa05c90ce57f813bfd12ef86dc8df654bbe12)) by **renovate[bot]**

### 🚀 refactor/124-refactor-test-approach-use-bun-as-much-as-possible <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/135"><img src="https://img.shields.io/badge/%23135-blue?style=flat" alt="#135" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

This PR centralizes test dependencies and configurations to improve maintainability and coverage reporting across the monorepo. The changes consolidate test-related dependencies into a centralized test-preset package and remove redundant test scripts.
    Centralizes @happy-dom/global-registrator and testing dependencies in the test-preset package
    Simplifies package.json scripts by removing redundant test:watch and test:coverage scripts
    Adds comprehensive Card component tests achieving 100% coverage

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/59b5ca582219cc4a5b1c6dac506dd91bd188175b"><img src="https://img.shields.io/badge/feat-(noscope)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> Squashed changes from PR (centralize test dependencies and improve coverage) ([59b5ca5](https://github.com/movahedan/monobun/commit/59b5ca582219cc4a5b1c6dac506dd91bd188175b)) by **Soheil Movahedan**

</details>


### 🔄 refactor/121-refactor-docker-compose-parser <img src="https://img.shields.io/badge/Code%20Quality%20%26%20Refactoring-495057?style=flat" alt="Code Quality & Refactoring" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/134"><img src="https://img.shields.io/badge/%23134-blue?style=flat" alt="#134" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

This PR refactors the docker-compose parser and related scripts to improve code organization and API design. The main changes consolidate parsing logic into a more cohesive interface and update consuming scripts to use the new API.
    Consolidates multiple docker-compose utility functions into a single parseCompose function
    Replaces individual utility functions with methods on a composed object
    Updates all consuming scripts to use the new parser API

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/2ce0c5e7208429c99387e035956a7d5217dcae3c"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> Squashed changes from PR (improve docker-compose parser and related scripts) ([2ce0c5e](https://github.com/movahedan/monobun/commit/2ce0c5e7208429c99387e035956a7d5217dcae3c)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/a457bd50609f8de485d1c4f2c804a44ad928c9c5"><img src="https://img.shields.io/badge/fix-(ui)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> linter issues ([a457bd5](https://github.com/movahedan/monobun/commit/a457bd50609f8de485d1c4f2c804a44ad928c9c5)) by **Soheil Movahedan**

### 🐛 movahedan/120-refactor-and-simplify-vscode-sync-code <img src="https://img.shields.io/badge/Bug%20Fixes%20%26%20Improvements-495057?style=flat" alt="Bug Fixes & Improvements" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/133"><img src="https://img.shields.io/badge/%23133-blue?style=flat" alt="#133" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />


<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/cdb574cc34b0f0953a199258be3b846d979ad534"><img src="https://img.shields.io/badge/fix-(scripts)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> Squashed changes from PR (remove trailing comma in object destructuring) ([cdb574c](https://github.com/movahedan/monobun/commit/cdb574cc34b0f0953a199258be3b846d979ad534)) by **Soheil Movahedan**

</details>


### 📦 renovate/react-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/132"><img src="https://img.shields.io/badge/%23132-blue?style=flat" alt="#132" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update react monorepo to v19.1.1

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/b3740352cd0b4158b41ebec58be9f8a502ea48e4"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> Squashed changes from PR (update react monorepo to v19.1.1) ([b374035](https://github.com/movahedan/monobun/commit/b3740352cd0b4158b41ebec58be9f8a502ea48e4)) by **renovate[bot]**

</details>


### 🚀 refactor/remove-remix <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/130"><img src="https://img.shields.io/badge/%23130-blue?style=flat" alt="#130" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/7%20commits-green?style=flat" alt="7 commits" style="vertical-align: middle;" />

This PR removes the Remix-based blog app from the monorepo and refactors the UI package to use Storybook instead of a complex Vite build system. The change simplifies the overall architecture by eliminating the intermediate blog application and repositioning the UI package as a development-focused component library with Storybook for documentation and testing.
Key changes:
    Removal of the entire blog application and its dependencies
    Replacement of the complex Vite library build system with a simpler Storybook-based development workflow
    Addition of new UI components (Card, Input, Label, LoginForm) with comprehensive Storybook stories and tests

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/53e5f0b932cd8c5280dcc4b980e06940447cf095"><img src="https://img.shields.io/badge/feat-(noscope)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> configure json lockfile as default behavior ([53e5f0b](https://github.com/movahedan/monobun/commit/53e5f0b932cd8c5280dcc4b980e06940447cf095)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/ca0d900a4d8b9da0d77e878d8292db5105847202"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> resolve docker build pipeline lockfile issue ([ca0d900](https://github.com/movahedan/monobun/commit/ca0d900a4d8b9da0d77e878d8292db5105847202)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/6951a0a7b1e29c37bcfc64772b6036c8e50749f7"><img src="https://img.shields.io/badge/merge-(noscope)-6B7280?style=flat" alt="merge" style="vertical-align: middle;" /></a> Merge branch 'main' into refactor/remove-remix ([6951a0a](https://github.com/movahedan/monobun/commit/6951a0a7b1e29c37bcfc64772b6036c8e50749f7)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/97c1df1819a890a2698799f2c0d6e778268c1bbb"><img src="https://img.shields.io/badge/merge-(noscope)-6B7280?style=flat" alt="merge" style="vertical-align: middle;" /></a> Merge branch 'main' into refactor/remove-remix ([97c1df1](https://github.com/movahedan/monobun/commit/97c1df1819a890a2698799f2c0d6e778268c1bbb)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/f07da1ef0c41a4d12b4e1d7de3c6635be6839a29"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> remove remix blog app and update documentation ([f07da1e](https://github.com/movahedan/monobun/commit/f07da1ef0c41a4d12b4e1d7de3c6635be6839a29)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/0cae23cf964c6b97939a70a4135c2fe5657a992b"><img src="https://img.shields.io/badge/refactor-(repo)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> rename bun.lock to bun.lockb ([0cae23c](https://github.com/movahedan/monobun/commit/0cae23cf964c6b97939a70a4135c2fe5657a992b)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/2479cd9efa6504be4d6c372f8053ccea98eb6813"><img src="https://img.shields.io/badge/feat-(noscope)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add storybook to ui package and improve development setup ([2479cd9](https://github.com/movahedan/monobun/commit/2479cd9efa6504be4d6c372f8053ccea98eb6813)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/6951a0a7b1e29c37bcfc64772b6036c8e50749f7"><img src="https://img.shields.io/badge/merge-(noscope)-6B7280?style=flat" alt="merge" style="vertical-align: middle;" /></a> Merge branch 'main' into refactor/remove-remix ([6951a0a](https://github.com/movahedan/monobun/commit/6951a0a7b1e29c37bcfc64772b6036c8e50749f7)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/97c1df1819a890a2698799f2c0d6e778268c1bbb"><img src="https://img.shields.io/badge/merge-(noscope)-6B7280?style=flat" alt="merge" style="vertical-align: middle;" /></a> Merge branch 'main' into refactor/remove-remix ([97c1df1](https://github.com/movahedan/monobun/commit/97c1df1819a890a2698799f2c0d6e778268c1bbb)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/0d5d249b4fc8b9ce372dbc4d0233eb8c77092166"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update react monorepo (#129) ([0d5d249](https://github.com/movahedan/monobun/commit/0d5d249b4fc8b9ce372dbc4d0233eb8c77092166)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/895195c7b485d38247d25c3ddbed561e8ab7967c"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update dependency isbot to v5.1.29 (#128) ([895195c](https://github.com/movahedan/monobun/commit/895195c7b485d38247d25c3ddbed561e8ab7967c)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/c99b138c7e8811e377abca9ac168471f79420c3c"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update react monorepo to v19.1.1 (#127) ([c99b138](https://github.com/movahedan/monobun/commit/c99b138c7e8811e377abca9ac168471f79420c3c)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/d5b6676409d854d756f43bc7eb3f6f63f6c93476"><img src="https://img.shields.io/badge/chore-(noscope)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> improve minor namings ([d5b6676](https://github.com/movahedan/monobun/commit/d5b6676409d854d756f43bc7eb3f6f63f6c93476)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/09add2f3c98f8442a32aaefc7eacc9579ce0c71d"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> fix broken links and obvious mistakes in documentation ([09add2f](https://github.com/movahedan/monobun/commit/09add2f3c98f8442a32aaefc7eacc9579ce0c71d)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/b9e447c4a46bc6830e7feb42842027588e10d356"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> use bunx for biome check in build script to avoid script dependency ([b9e447c](https://github.com/movahedan/monobun/commit/b9e447c4a46bc6830e7feb42842027588e10d356)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/cd4760a95e070867053876ea59b744092bdd1965"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> run check:fix from root directory in build script ([cd4760a](https://github.com/movahedan/monobun/commit/cd4760a95e070867053876ea59b744092bdd1965)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/e120b5e0e7ec11b04fefb3fcffd6c788847e85b3"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> add optional chaining to prevent undefined error in arg parser ([e120b5e](https://github.com/movahedan/monobun/commit/e120b5e0e7ec11b04fefb3fcffd6c788847e85b3)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/f38a3606b56ccb3e461f8689cc5e64015f165726"><img src="https://img.shields.io/badge/test-(noscope)-10B981?style=flat" alt="test" style="vertical-align: middle;" /></a> add test file for validation ([f38a360](https://github.com/movahedan/monobun/commit/f38a3606b56ccb3e461f8689cc5e64015f165726)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/a8d1be6780ea58e5ec918a65966df1677b2e9527"><img src="https://img.shields.io/badge/feat-(noscope)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add comprehensive technology badges to readme ([a8d1be6](https://github.com/movahedan/monobun/commit/a8d1be6780ea58e5ec918a65966df1677b2e9527)) by **Soheil Movahedan**

### 📦 renovate/apps <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/118"><img src="https://img.shields.io/badge/%23118-blue?style=flat" alt="#118" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency @remix-run/dev to v2.17.0

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/a4804379be642010b9c2d1219e90033de5c93c10"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency @remix-run/dev to v2.17.0) ([a480437](https://github.com/movahedan/monobun/commit/a4804379be642010b9c2d1219e90033de5c93c10)) by **renovate[bot]**

</details>


### 📦 renovate/body-parser-2.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/115"><img src="https://img.shields.io/badge/%23115-blue?style=flat" alt="#115" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependency body-parser to v2

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/d02f19d0e3395171b589d43f499bd2e6ab9e7254"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency body-parser to v2) ([d02f19d](https://github.com/movahedan/monobun/commit/d02f19d0e3395171b589d43f499bd2e6ab9e7254)) by **renovate[bot]**

</details>


### 📦 renovate/express-5.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/116"><img src="https://img.shields.io/badge/%23116-blue?style=flat" alt="#116" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependency express to v5

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/c4a9fc3ea34afb7cd5c65e08ea156d876fbc9a4b"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency express to v5) ([c4a9fc3](https://github.com/movahedan/monobun/commit/c4a9fc3ea34afb7cd5c65e08ea156d876fbc9a4b)) by **renovate[bot]**

</details>


### 📦 renovate/testing-library-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/114"><img src="https://img.shields.io/badge/%23114-blue?style=flat" alt="#114" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update testing-library monorepo

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/837f73d353ef194236754eabed548c40b84865ea"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> Squashed changes from PR (update testing-library monorepo) ([837f73d](https://github.com/movahedan/monobun/commit/837f73d353ef194236754eabed548c40b84865ea)) by **renovate[bot]**

</details>


### 📦 renovate/apps <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/112"><img src="https://img.shields.io/badge/%23112-blue?style=flat" alt="#112" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update apps

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/b3ae83f607f5016dfede7874a667ab26f23b79d8"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> Squashed changes from PR (update apps) ([b3ae83f](https://github.com/movahedan/monobun/commit/b3ae83f607f5016dfede7874a667ab26f23b79d8)) by **renovate[bot]**

</details>


### 🔄 refactor/dev-container-again <img src="https://img.shields.io/badge/Code%20Quality%20%26%20Refactoring-495057?style=flat" alt="Code Quality & Refactoring" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/113"><img src="https://img.shields.io/badge/%23113-blue?style=flat" alt="#113" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/9%20commits-green?style=flat" alt="9 commits" style="vertical-align: middle;" />

refactor(ci): improve dev container and ci infrastructure
This PR refactors CI infrastructure and dev container setup, introducing new Docker compose parsing utilities and improving script organization. Key changes include replacing legacy GitHub output scripts with improved alternatives, adding comprehensive service information extraction tools, and enhancing the development environment with better Docker configuration.
    Introduces new docker-compose-parser.ts utility for centralized Docker compose file parsing
    Replaces two legacy GitHub output scripts with improved github-attach-* alternatives
    Adds comprehensive get-service-info.ts script for service information extraction
Commits:
    refactor docker-compose service parsing with new docker-compose-parser utility
    replace attach-affected-to-github-output with improved get-affected-services script
    replace attach-service-ports-to-github-output with github-attach-service-ports
    add comprehensive get-service-info script for service information extraction
    enhance dev container setup with improved docker configuration
    update package.json dependencies across apps and packages
    add test task to ui package turbo configuration
    add comprehensive documentation for ai development workflow
    improve script organization and error handling throughout

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/c9389ce1c4ab7a6263c95807433dac1360fed182"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> handle multiple docker compose port formats ([c9389ce](https://github.com/movahedan/monobun/commit/c9389ce1c4ab7a6263c95807433dac1360fed182)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/d78411cc4a47aa55618f63b43a0b207685134dbb"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> improve affected packages detection and cleanup scripts ([d78411c](https://github.com/movahedan/monobun/commit/d78411cc4a47aa55618f63b43a0b207685134dbb)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/cb007d365a004cac98fde0e0f91c7b7e5d4f1fd8"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> resolve jq syntax error in github actions pipeline ([cb007d3](https://github.com/movahedan/monobun/commit/cb007d365a004cac98fde0e0f91c7b7e5d4f1fd8)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/be285b2ff570c8b48c4414ec656a42b9c73a942b"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> reorganize scripts and their documentation structure ([be285b2](https://github.com/movahedan/monobun/commit/be285b2ff570c8b48c4414ec656a42b9c73a942b)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/1e58d9ab5a12cf547d515b063e4d3d14c27a2c32"><img src="https://img.shields.io/badge/fix-(ci)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> remove dev:status ([1e58d9a](https://github.com/movahedan/monobun/commit/1e58d9ab5a12cf547d515b063e4d3d14c27a2c32)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/306bfa5ea2c580f34cbb6a2fd6094d1d7d017091"><img src="https://img.shields.io/badge/refactor-(scripts,docs)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> remove centralized command finder ([306bfa5](https://github.com/movahedan/monobun/commit/306bfa5ea2c580f34cbb6a2fd6094d1d7d017091)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/8156cb38bd4d7628ccdba5a72138d8b6ae9d8536"><img src="https://img.shields.io/badge/docs-(scripts)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update scripting guide ([8156cb3](https://github.com/movahedan/monobun/commit/8156cb38bd4d7628ccdba5a72138d8b6ae9d8536)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/06df6bb8259c9af8e979357bf3ca4e9f780946f7"><img src="https://img.shields.io/badge/refactor-(devcontainer)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> simplify docker configuration ([06df6bb](https://github.com/movahedan/monobun/commit/06df6bb8259c9af8e979357bf3ca4e9f780946f7)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/45613c70db6516cd26051614fd3112937787c4e4"><img src="https://img.shields.io/badge/refactor-(ci)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> improve dev container and ci infrastructure ([45613c7](https://github.com/movahedan/monobun/commit/45613c70db6516cd26051614fd3112937787c4e4)) by **Soheil Movahedan**

</details>


### 📦 renovate/vite-tsconfig-paths-5.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/107"><img src="https://img.shields.io/badge/%23107-blue?style=flat" alt="#107" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency vite-tsconfig-paths to v5

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/bfb09b02bfb5ec3d579e1caf4385b0902a143930"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency vite-tsconfig-paths to v5) ([bfb09b0](https://github.com/movahedan/monobun/commit/bfb09b02bfb5ec3d579e1caf4385b0902a143930)) by **renovate[bot]**

</details>


### 📦 renovate/tailwind-merge-3.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/111"><img src="https://img.shields.io/badge/%23111-blue?style=flat" alt="#111" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependency tailwind-merge to v3

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/ed85fae360071e1fdb73746d5a3c97777bfe4c0b"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency tailwind-merge to v3) ([ed85fae](https://github.com/movahedan/monobun/commit/ed85fae360071e1fdb73746d5a3c97777bfe4c0b)) by **renovate[bot]**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/8bd692fabb83858336abf5d62ba29b869ea2e36a"><img src="https://img.shields.io/badge/fix-(ci)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> add dynamic port detection for docker services ([8bd692f](https://github.com/movahedan/monobun/commit/8bd692fabb83858336abf5d62ba29b869ea2e36a)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/a0892d697e9f33113e60b3cc9f17b8159604f1b4"><img src="https://img.shields.io/badge/docs-(repo)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> add push prompt to conventional commits rule ([a0892d6](https://github.com/movahedan/monobun/commit/a0892d697e9f33113e60b3cc9f17b8159604f1b4)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/44f323acf65d1d79d1a8720b7e71ed305790511d"><img src="https://img.shields.io/badge/docs-(repo)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> improve script development rule with proper exports ([44f323a](https://github.com/movahedan/monobun/commit/44f323acf65d1d79d1a8720b7e71ed305790511d)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/27337d5cb807db729a6768a47a96811d1e789f35"><img src="https://img.shields.io/badge/docs-(repo)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> add comprehensive conventional commits rule ([27337d5](https://github.com/movahedan/monobun/commit/27337d5cb807db729a6768a47a96811d1e789f35)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/700635b4727f02451c6c15a10d00e8bbd1084e4d"><img src="https://img.shields.io/badge/fix-(ci)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> resolve docker dependency issues in github actions ([700635b](https://github.com/movahedan/monobun/commit/700635b4727f02451c6c15a10d00e8bbd1084e4d)) by **Soheil Movahedan**

### 📦 renovate/vite-7.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/110"><img src="https://img.shields.io/badge/%23110-blue?style=flat" alt="#110" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency vite to v7.0.6

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/aa35a7801a768e5d4ae54f87214054fd82fedfb5"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency vite to v7.0.6) ([aa35a78](https://github.com/movahedan/monobun/commit/aa35a7801a768e5d4ae54f87214054fd82fedfb5)) by **renovate[bot]**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/5d5987dcd6fc70ed0e8c0f82b1eb0893e580b2d7"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> add some planning docs ([5d5987d](https://github.com/movahedan/monobun/commit/5d5987dcd6fc70ed0e8c0f82b1eb0893e580b2d7)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/3192dc3741d65eca275608bfde3dd15752682781"><img src="https://img.shields.io/badge/docs-(repo)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> add environment variables documentation ([3192dc3](https://github.com/movahedan/monobun/commit/3192dc3741d65eca275608bfde3dd15752682781)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/990d9bc3c816e439672481ef6f74c032caf94419"><img src="https://img.shields.io/badge/docs-(repo)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update cursor rules ([990d9bc](https://github.com/movahedan/monobun/commit/990d9bc3c816e439672481ef6f74c032caf94419)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/e2b2b3c76a0e8e8717565159addda47918f916fc"><img src="https://img.shields.io/badge/docs-(repo)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> add renovate and sonarcube to readme ([e2b2b3c](https://github.com/movahedan/monobun/commit/e2b2b3c76a0e8e8717565159addda47918f916fc)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/6714f9d3cd671645ab8ddebba04db887b7bbac95"><img src="https://img.shields.io/badge/docs-(repo)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> add build-vite-library documentation ([6714f9d](https://github.com/movahedan/monobun/commit/6714f9d3cd671645ab8ddebba04db887b7bbac95)) by **Soheil Movahedan**

### 📦 renovate/major-18-happy-dom-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/109"><img src="https://img.shields.io/badge/%23109-blue?style=flat" alt="#109" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependency @happy-dom/global-registrator to v18

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/cd10284ee92a92634ce0d1b1c29dd01331e85844"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency @happy-dom/global-registrator to v18) ([cd10284](https://github.com/movahedan/monobun/commit/cd10284ee92a92634ce0d1b1c29dd01331e85844)) by **renovate[bot]**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/31e048500468361a9cb7e4bac10518fe95445b40"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> add some cursor rules ([31e0485](https://github.com/movahedan/monobun/commit/31e048500468361a9cb7e4bac10518fe95445b40)) by **Soheil Movahedan**

### 📦 renovate/vite-7.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/106"><img src="https://img.shields.io/badge/%23106-blue?style=flat" alt="#106" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency vite to v7

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/65e18b0b06160f54c31a15f2d29291002830d98e"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency vite to v7) ([65e18b0](https://github.com/movahedan/monobun/commit/65e18b0b06160f54c31a15f2d29291002830d98e)) by **renovate[bot]**

</details>


### 📦 renovate/oven-sh-setup-bun-2.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/108"><img src="https://img.shields.io/badge/%23108-blue?style=flat" alt="#108" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update oven-sh/setup-bun action to v2

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/cb8bcbcc15ee5d33edea0ef2f58e823b00f555a8"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (update oven-sh/setup-bun action to v2) ([cb8bcbc](https://github.com/movahedan/monobun/commit/cb8bcbcc15ee5d33edea0ef2f58e823b00f555a8)) by **renovate[bot]**

</details>


### 📦 renovate/lefthook-1.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/105"><img src="https://img.shields.io/badge/%23105-blue?style=flat" alt="#105" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency lefthook to v1.12.2

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/6d7fc960c2fc008f3d7f7110b8b15c4e0dc6e506"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency lefthook to v1.12.2) ([6d7fc96](https://github.com/movahedan/monobun/commit/6d7fc960c2fc008f3d7f7110b8b15c4e0dc6e506)) by **renovate[bot]**

</details>


### 🐛 feature/jit-and-compiled-packages <img src="https://img.shields.io/badge/Bug%20Fixes%20%26%20Improvements-495057?style=flat" alt="Bug Fixes & Improvements" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/104"><img src="https://img.shields.io/badge/%23104-blue?style=flat" alt="#104" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/4%20commits-green?style=flat" alt="4 commits" style="vertical-align: middle;" />

refactor: setup just-in-time and compiled packages correctly
This pull request refactors the monorepo build system by implementing a just-in-time (JIT) compilation approach for packages instead of pre-compiled builds. It replaces the previous prebuild system with a unified build workflow script and switches from bundled TypeScript compilation to direct source imports.
Key changes:
    Implements a new build workflow script that automates TypeScript compilation, Vite entry generation, and package.json export updates
    Removes prebuild utilities and switches to JIT compilation with direct source imports
    Consolidates TypeScript configurations using shared base configurations

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/401a8647772c67221c40c052b2d64c1a0eb7ff0e"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> improve codebase ([401a864](https://github.com/movahedan/monobun/commit/401a8647772c67221c40c052b2d64c1a0eb7ff0e)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/8115c51045e1def1ec3b5007919031bbc940fd88"><img src="https://img.shields.io/badge/merge-(noscope)-6B7280?style=flat" alt="merge" style="vertical-align: middle;" /></a> Merge branch 'main' into feature/jit-and-compiled-packages ([8115c51](https://github.com/movahedan/monobun/commit/8115c51045e1def1ec3b5007919031bbc940fd88)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/2e33ce4422edd74f481b2974d76da884c168b2c4"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> add out to gitignore ([2e33ce4](https://github.com/movahedan/monobun/commit/2e33ce4422edd74f481b2974d76da884c168b2c4)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/18b49d28690adaac72adc38bf34be8cf39bd9fa9"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> setup just-in-time and compiled packages correctly ([18b49d2](https://github.com/movahedan/monobun/commit/18b49d28690adaac72adc38bf34be8cf39bd9fa9)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/8115c51045e1def1ec3b5007919031bbc940fd88"><img src="https://img.shields.io/badge/merge-(noscope)-6B7280?style=flat" alt="merge" style="vertical-align: middle;" /></a> Merge branch 'main' into feature/jit-and-compiled-packages ([8115c51](https://github.com/movahedan/monobun/commit/8115c51045e1def1ec3b5007919031bbc940fd88)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/06866385c204620e43a87b52c35646cc2d15c7d6"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency supertest to v7.1.4 (#103) ([0686638](https://github.com/movahedan/monobun/commit/06866385c204620e43a87b52c35646cc2d15c7d6)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/e9a449f99b7f0c5190302570ddfc3356c9e4f32a"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> add out to gitignore ([e9a449f](https://github.com/movahedan/monobun/commit/e9a449f99b7f0c5190302570ddfc3356c9e4f32a)) by **Soheil Movahedan**

### 📦 renovate/bunchee-6.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/84"><img src="https://img.shields.io/badge/%2384-blue?style=flat" alt="#84" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency bunchee to v6.5.4

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/4f9083522cdc1b0f782b626e53befd609102b181"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency bunchee to v6.5.4) ([4f90835](https://github.com/movahedan/monobun/commit/4f9083522cdc1b0f782b626e53befd609102b181)) by **renovate[bot]**

</details>


### 📦 renovate/pin-dependencies <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/102"><img src="https://img.shields.io/badge/%23102-blue?style=flat" alt="#102" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): pin dependencies

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/11276fceb1999b20e0dac295a564e7ec5704e6ee"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> Squashed changes from PR (pin dependencies) ([11276fc](https://github.com/movahedan/monobun/commit/11276fceb1999b20e0dac295a564e7ec5704e6ee)) by **renovate[bot]**

</details>


### 🚀 refactor/scripts <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/101"><img src="https://img.shields.io/badge/%23101-blue?style=flat" alt="#101" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/6%20commits-green?style=flat" alt="6 commits" style="vertical-align: middle;" />

Refactor/scripts

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/7918ac8c6caeefe363cf84a2ec9c008b87fc0958"><img src="https://img.shields.io/badge/other-(noscope)-6B7280?style=flat" alt="other" style="vertical-align: middle;" /></a> Update scripts/check-pipelines.ts ([7918ac8](https://github.com/movahedan/monobun/commit/7918ac8c6caeefe363cf84a2ec9c008b87fc0958)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/ac5811dc8f75dca974c825f0d8eff9a99f4e6b1d"><img src="https://img.shields.io/badge/other-(noscope)-6B7280?style=flat" alt="other" style="vertical-align: middle;" /></a> Update scripts/check-pipelines.ts ([ac5811d](https://github.com/movahedan/monobun/commit/ac5811dc8f75dca974c825f0d8eff9a99f4e6b1d)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/ca4d376b6efa1b3235f18d1cfd86c0d5ad4db463"><img src="https://img.shields.io/badge/feat-(repo)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add test scripts ([ca4d376](https://github.com/movahedan/monobun/commit/ca4d376b6efa1b3235f18d1cfd86c0d5ad4db463)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/afc4eabc246595f064cfdda1d58655c5eb6aeaae"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update the doc for dev:checkup and small changes ([afc4eab](https://github.com/movahedan/monobun/commit/afc4eabc246595f064cfdda1d58655c5eb6aeaae)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/4f67b605c04998a3778ebc7009b30e48f2f6d1e9"><img src="https://img.shields.io/badge/fix-(repo)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> check and main workflows ([4f67b60](https://github.com/movahedan/monobun/commit/4f67b605c04998a3778ebc7009b30e48f2f6d1e9)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/b905c9da885644b41c7519efb189115b5bae3645"><img src="https://img.shields.io/badge/refactor-(repo)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> scripts directory structured changed a bit ([b905c9d](https://github.com/movahedan/monobun/commit/b905c9da885644b41c7519efb189115b5bae3645)) by **Soheil Movahedan**

</details>


### 📦 renovate/major-19-react-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/100"><img src="https://img.shields.io/badge/%23100-blue?style=flat" alt="#100" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update react monorepo to v19 (major)

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/f071983d01d2691a75fec2b4a0e0cf118b489ce3"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> Squashed changes from PR (update react monorepo to v19) ([f071983](https://github.com/movahedan/monobun/commit/f071983d01d2691a75fec2b4a0e0cf118b489ce3)) by **renovate[bot]**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/00142359a41328e0bbab8b5ae015ac64e4956d58"><img src="https://img.shields.io/badge/docs-(noscope)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update readme.md ([0014235](https://github.com/movahedan/monobun/commit/00142359a41328e0bbab8b5ae015ac64e4956d58)) by **Soheil Movahedan**

### 📦 renovate/oven-bun-1.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/97"><img src="https://img.shields.io/badge/%2397-blue?style=flat" alt="#97" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update oven/bun docker tag to v1.2.19

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/00f12720d4c534e2ccc9bb2dcde80ac7b7d2c6e5"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (update oven/bun docker tag to v1.2.19) ([00f1272](https://github.com/movahedan/monobun/commit/00f12720d4c534e2ccc9bb2dcde80ac7b7d2c6e5)) by **renovate[bot]**

</details>


### 🚀 refactor/prod-containers <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/98"><img src="https://img.shields.io/badge/%2398-blue?style=flat" alt="#98" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/8%20commits-green?style=flat" alt="8 commits" style="vertical-align: middle;" />

Refactor/prod containers

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/a90f36f15fdb37c85c42d8b676c9359fea39e3d2"><img src="https://img.shields.io/badge/fix-(repo)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> chmod limit to 055 for copied resources ([a90f36f](https://github.com/movahedan/monobun/commit/a90f36f15fdb37c85c42d8b676c9359fea39e3d2)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/c478addc829a6966015b9da5983c3108dfc77e99"><img src="https://img.shields.io/badge/feat-(repo)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add check-pipelines to test github actions locally ([c478add](https://github.com/movahedan/monobun/commit/c478addc829a6966015b9da5983c3108dfc77e99)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/8fb473b07b3861e2b1cb5bfd2e705b34b629e1c4"><img src="https://img.shields.io/badge/feat-(repo)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add create-script.ts for re-usable script creation ([8fb473b](https://github.com/movahedan/monobun/commit/8fb473b07b3861e2b1cb5bfd2e705b34b629e1c4)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/f27bf7d0b510762ea017a819a07844107f8a4925"><img src="https://img.shields.io/badge/fix-(repo)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> remove dependencies as a work around ci fixing ([f27bf7d](https://github.com/movahedan/monobun/commit/f27bf7d0b510762ea017a819a07844107f8a4925)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/1faf557fc2aa0d972803bc7235ed95846330aa35"><img src="https://img.shields.io/badge/feat-(repo)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add docker-compose-validation in github actions ([1faf557](https://github.com/movahedan/monobun/commit/1faf557fc2aa0d972803bc7235ed95846330aa35)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/17ac6914f3bf5c156ddfdd8671e3474814c2f4f9"><img src="https://img.shields.io/badge/feat-(repo)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> fix prod problems by downgrading performance problem ([17ac691](https://github.com/movahedan/monobun/commit/17ac6914f3bf5c156ddfdd8671e3474814c2f4f9)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/5b982a0e845475b7ac94fe4821099e3c31064ca9"><img src="https://img.shields.io/badge/feat-(ci)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add docker-compose-validation ([5b982a0](https://github.com/movahedan/monobun/commit/5b982a0e845475b7ac94fe4821099e3c31064ca9)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/deb6d84a1a60d705aa694863d3fd73edd3fc606d"><img src="https://img.shields.io/badge/feat-(noscope)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add healthcheck for all the apps and write test for devcontainers ([deb6d84](https://github.com/movahedan/monobun/commit/deb6d84a1a60d705aa694863d3fd73edd3fc606d)) by **Soheil Movahedan**

</details>


### 🚀 feature/devcontainer-further-foundings <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/96"><img src="https://img.shields.io/badge/%2396-blue?style=flat" alt="#96" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/17%20commits-green?style=flat" alt="17 commits" style="vertical-align: middle;" />

Pull Request Overview
This PR refactors the development workflow from production Docker Compose to DevContainer-based development with comprehensive configuration improvements and enhanced developer tooling. The changes introduce a complete DevContainer setup with Docker-from-Docker capabilities, streamline package.json scripts, and provide extensive documentation for development workflows.
Key Changes:
    Complete DevContainer setup: New VS Code DevContainer configuration with Docker-from-Docker support
    Package script reorganization: Simplified and categorized development, container, and production scripts
    Enhanced documentation: Added comprehensive guides for Docker, DevContainer, development workflow, and coding conventions

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/b35d2d247c26ee5878b08c61af9e6fbac08052f0"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> redos-resistant ([b35d2d2](https://github.com/movahedan/monobun/commit/b35d2d247c26ee5878b08c61af9e6fbac08052f0)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/e56f3ec77121dbf25ebe187a9a0322c70e24f40e"><img src="https://img.shields.io/badge/docs-(repo)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> add quality checklist documentation ([e56f3ec](https://github.com/movahedan/monobun/commit/e56f3ec77121dbf25ebe187a9a0322c70e24f40e)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/a2899e093eea3948b00954f3f259fc72cec38883"><img src="https://img.shields.io/badge/docs-(repo)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update docs ([a2899e0](https://github.com/movahedan/monobun/commit/a2899e093eea3948b00954f3f259fc72cec38883)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/ddd30963443ac837653194a12da2ee5641c017f9"><img src="https://img.shields.io/badge/feat-(repo)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add vscode sync to setup and cleanup ([ddd3096](https://github.com/movahedan/monobun/commit/ddd30963443ac837653194a12da2ee5641c017f9)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/3e8eb5380a8f400acbcfd7bf70a4fe00b33227e0"><img src="https://img.shields.io/badge/docs-(repo)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update vscode sync doc ([3e8eb53](https://github.com/movahedan/monobun/commit/3e8eb5380a8f400acbcfd7bf70a4fe00b33227e0)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/ae933cda622eca8dec01605231b721a472b46438"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> small improvements ([ae933cd](https://github.com/movahedan/monobun/commit/ae933cda622eca8dec01605231b721a472b46438)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/92b8089006371a3bd49bd32437034cc13b04f6bb"><img src="https://img.shields.io/badge/chore-(noscope)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update .gitignore to include tsconfig.tsbuildinfo and .vscode ([92b8089](https://github.com/movahedan/monobun/commit/92b8089006371a3bd49bd32437034cc13b04f6bb)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/7aa039cae9b060b971f12ce9c58166266e449a4e"><img src="https://img.shields.io/badge/feat-(repo)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> remove vscode setting duplication ([7aa039c](https://github.com/movahedan/monobun/commit/7aa039cae9b060b971f12ce9c58166266e449a4e)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/87d49e1a6562fdd48a3060fee33f2c62b668c2b5"><img src="https://img.shields.io/badge/feat-(storefront)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> fix install-swc-library os compatibility ([87d49e1](https://github.com/movahedan/monobun/commit/87d49e1a6562fdd48a3060fee33f2c62b668c2b5)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/07dc78256403cdc5557c8e292c982922ca7275c5"><img src="https://img.shields.io/badge/feat-(repo)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> refactor setup and cleanup scripts ([07dc782](https://github.com/movahedan/monobun/commit/07dc78256403cdc5557c8e292c982922ca7275c5)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/5e6264b1fda4f7206a58ad3c351a1b8e419275e7"><img src="https://img.shields.io/badge/fix-(repo)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> improve setup-docker in devcontainer ([5e6264b](https://github.com/movahedan/monobun/commit/5e6264b1fda4f7206a58ad3c351a1b8e419275e7)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/d61077e3d75fff7547ea4a22b3087c6a67f81bd3"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> typo ([d61077e](https://github.com/movahedan/monobun/commit/d61077e3d75fff7547ea4a22b3087c6a67f81bd3)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/f59b19a2ea9cd52f59d935d5bc691e711ee2c55d"><img src="https://img.shields.io/badge/fix-(storefront)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> install swc os specific library in postinstall ([f59b19a](https://github.com/movahedan/monobun/commit/f59b19a2ea9cd52f59d935d5bc691e711ee2c55d)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/d06898cd9589a9ce4a57e2a48e313ec3a04cf2b4"><img src="https://img.shields.io/badge/merge-(noscope)-6B7280?style=flat" alt="merge" style="vertical-align: middle;" /></a> Merge branch 'main' into feature/devcontainer-further-foundings ([d06898c](https://github.com/movahedan/monobun/commit/d06898cd9589a9ce4a57e2a48e313ec3a04cf2b4)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/818d215ebdc1b9af6de501274edada6d738a65bf"><img src="https://img.shields.io/badge/docs-(repo)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> add extensive docs for the repo ([818d215](https://github.com/movahedan/monobun/commit/818d215ebdc1b9af6de501274edada6d738a65bf)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/47390853a463c1e904326208a7d6fe07a1587205"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> dev container setup ([4739085](https://github.com/movahedan/monobun/commit/47390853a463c1e904326208a7d6fe07a1587205)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/4157560a2904cc1bf587ec3a054efb086c944495"><img src="https://img.shields.io/badge/refactor-(repo)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> devcontainer optimization ([4157560](https://github.com/movahedan/monobun/commit/4157560a2904cc1bf587ec3a054efb086c944495)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/d06898cd9589a9ce4a57e2a48e313ec3a04cf2b4"><img src="https://img.shields.io/badge/merge-(noscope)-6B7280?style=flat" alt="merge" style="vertical-align: middle;" /></a> Merge branch 'main' into feature/devcontainer-further-foundings ([d06898c](https://github.com/movahedan/monobun/commit/d06898cd9589a9ce4a57e2a48e313ec3a04cf2b4)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/7588cfa4ba47105f2505fb47c78f4510aa1f8c45"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update oven/bun docker tag to v1.2.19 (#95) ([7588cfa](https://github.com/movahedan/monobun/commit/7588cfa4ba47105f2505fb47c78f4510aa1f8c45)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/716d27bda016ed1e33d8c3947b7a6ac35d9a039a"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency bun-types to v1.2.19 (#94) ([716d27b](https://github.com/movahedan/monobun/commit/716d27bda016ed1e33d8c3947b7a6ac35d9a039a)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/b000016648565bacdd149c31fdfbf7da59d23e46"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update dependency morgan to v1.10.1 (#92) ([b000016](https://github.com/movahedan/monobun/commit/b000016648565bacdd149c31fdfbf7da59d23e46)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/bf273af91b7445b488b83f188abf54150cda2e40"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @biomejs/biome to v2.1.2 (#93) ([bf273af](https://github.com/movahedan/monobun/commit/bf273af91b7445b488b83f188abf54150cda2e40)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/f140483ab7d41f73bb1d4aefe759bc5124c4c25e"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @biomejs/biome (#91) ([f140483](https://github.com/movahedan/monobun/commit/f140483ab7d41f73bb1d4aefe759bc5124c4c25e)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/92cc74269c517a73f1634ee7451cf3e2bdbb8b7c"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency turbo to v2.5.5 (#90) ([92cc742](https://github.com/movahedan/monobun/commit/92cc74269c517a73f1634ee7451cf3e2bdbb8b7c)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/ab5d976a9f2d00cb927937518f2d0989a6d4e695"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> dockerfiles ([ab5d976](https://github.com/movahedan/monobun/commit/ab5d976a9f2d00cb927937518f2d0989a6d4e695)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/ecdb4f08765e37671bdfd8ce7ac95eb36824115a"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @biomejs/biome to v2.1.1 (#89) ([ecdb4f0](https://github.com/movahedan/monobun/commit/ecdb4f08765e37671bdfd8ce7ac95eb36824115a)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/582dc2822718c090cf57cb30b316cdf8569abfdb"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency supertest to v7.1.3 (#88) ([582dc28](https://github.com/movahedan/monobun/commit/582dc2822718c090cf57cb30b316cdf8569abfdb)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/9bc65cc0c1c04e3dfebd8149c60519c3945c1a69"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> github actinos ([9bc65cc](https://github.com/movahedan/monobun/commit/9bc65cc0c1c04e3dfebd8149c60519c3945c1a69)) by **Soheil Movahedan**

### 📦 renovate/clsx-2.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/87"><img src="https://img.shields.io/badge/%2387-blue?style=flat" alt="#87" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependency clsx to v2.1.1

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/971e5054eaaff211ffb54560545bd4de6739822b"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency clsx to v2.1.1) ([971e505](https://github.com/movahedan/monobun/commit/971e5054eaaff211ffb54560545bd4de6739822b)) by **renovate[bot]**

</details>


### 📦 renovate/oven-bun-1.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/86"><img src="https://img.shields.io/badge/%2386-blue?style=flat" alt="#86" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update oven/bun docker tag to v1.2.18

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/f711f66f35ef0e5b74579e1f35553fba559d9f36"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (update oven/bun docker tag to v1.2.18) ([f711f66](https://github.com/movahedan/monobun/commit/f711f66f35ef0e5b74579e1f35553fba559d9f36)) by **renovate[bot]**

</details>


### 🐛 feature/migrate-jest-to-bun-test <img src="https://img.shields.io/badge/Bug%20Fixes%20%26%20Improvements-495057?style=flat" alt="Bug Fixes & Improvements" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/85"><img src="https://img.shields.io/badge/%2385-blue?style=flat" alt="#85" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/2%20commits-green?style=flat" alt="2 commits" style="vertical-align: middle;" />

This PR refactors the repository’s testing setup to migrate from Jest to Bun’s built-in test runner.
    Removed Jest types, presets, dependencies, and scripts across packages.
    Updated test files to import from bun:test and leverage Testing Library with Happy DOM.
    Added Bun configuration (bunfig.toml) and custom test-preset modules for global setup and matchers.

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/883d9e7d0f1697647ff38cad0b51d3461f506fe4"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> biome errors ([883d9e7](https://github.com/movahedan/monobun/commit/883d9e7d0f1697647ff38cad0b51d3461f506fe4)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/d12ed6060271524571583b50c40d6edad2ab3626"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> migrate jest to bun ([d12ed60](https://github.com/movahedan/monobun/commit/d12ed6060271524571583b50c40d6edad2ab3626)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/0ce49cf38351367fcafb1ae48337158830292a41"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> pin dependency class-variance-authority to 0.7.1 (#83) ([0ce49cf](https://github.com/movahedan/monobun/commit/0ce49cf38351367fcafb1ae48337158830292a41)) by **renovate[bot]**

### 🐛 feature/devcontainer-first-setup <img src="https://img.shields.io/badge/Bug%20Fixes%20%26%20Improvements-495057?style=flat" alt="Bug Fixes & Improvements" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/82"><img src="https://img.shields.io/badge/%2382-blue?style=flat" alt="#82" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/17%20commits-green?style=flat" alt="17 commits" style="vertical-align: middle;" />

Adds initial devcontainer and Docker Compose configurations for hot-reload development, along with TypeScript project scaffolding and shared utility/UI packages.
    Introduce .devcontainer/devcontainer.json and docker-compose.dev.yml for unified VS Code remote/container setup with hot reload.
    Update Docker Compose and Next.js/Vite configs to enable polling-based file watching.
    Scaffold @repo/utils and @repo/ui packages with TS configs, build scripts, and exports.
Reviewed Changes
Copilot reviewed 45 out of 47 changed files in this pull request and generated 3 comments.

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/1d2158cb03464d560727fd0a10866d3496897895"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> small issue ([1d2158c](https://github.com/movahedan/monobun/commit/1d2158cb03464d560727fd0a10866d3496897895)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/cfd942d5efc79f9058e1d90f77fdb5cd01949edc"><img src="https://img.shields.io/badge/feat-(noscope)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add setup.dev and cleanup.dev ([cfd942d](https://github.com/movahedan/monobun/commit/cfd942d5efc79f9058e1d90f77fdb5cd01949edc)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/be88232a8ab25e549c71d63cb4059a13f111769c"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> sonarcloud complain ([be88232](https://github.com/movahedan/monobun/commit/be88232a8ab25e549c71d63cb4059a13f111769c)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/fd9811114d62db9179b72c4da03d45b8eac10c4f"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> dockerfile.dev user ([fd98111](https://github.com/movahedan/monobun/commit/fd9811114d62db9179b72c4da03d45b8eac10c4f)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/15dc0dacd97e9e002f45fec7ac5001d82343a46a"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> improve package.json scripts ([15dc0da](https://github.com/movahedan/monobun/commit/15dc0dacd97e9e002f45fec7ac5001d82343a46a)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/0d2a0a4b649f7a105439624b4cb6f018379cf47d"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> remove duplication in prebuild scripts ([0d2a0a4](https://github.com/movahedan/monobun/commit/0d2a0a4b649f7a105439624b4cb6f018379cf47d)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/72468b1889c67f4f0fe6698b1df28e8f61c1c8f4"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> biome erros ([72468b1](https://github.com/movahedan/monobun/commit/72468b1889c67f4f0fe6698b1df28e8f61c1c8f4)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/32b3680965e42587e7646f9691313442ddf54f5d"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> rename check-types to check:types ([32b3680](https://github.com/movahedan/monobun/commit/32b3680965e42587e7646f9691313442ddf54f5d)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/c0efa5a9236b1d3e839b56ca328fcb617495bb61"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> revert github action trigger rule ([c0efa5a](https://github.com/movahedan/monobun/commit/c0efa5a9236b1d3e839b56ca328fcb617495bb61)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/eb718b68cec4ab4301fc91eedd486320ad6fd94a"><img src="https://img.shields.io/badge/feat-(noscope)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> address of all the errors ([eb718b6](https://github.com/movahedan/monobun/commit/eb718b68cec4ab4301fc91eedd486320ad6fd94a)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/e9905786b0955acb828a5e040a3eddc219df589e"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> utils ts issue ([e990578](https://github.com/movahedan/monobun/commit/e9905786b0955acb828a5e040a3eddc219df589e)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/9b1ff79e0bea2c36ce293fb910751214ad6caa8e"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> devcontainers ssh problem ([9b1ff79](https://github.com/movahedan/monobun/commit/9b1ff79e0bea2c36ce293fb910751214ad6caa8e)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/d2915ef3eb3990e0dc6ec49fa38f09fe272dd965"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> ui deps problem ([d2915ef](https://github.com/movahedan/monobun/commit/d2915ef3eb3990e0dc6ec49fa38f09fe272dd965)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/fb7b5e290fe4c20cf028bfc982f71c15ec579ce3"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> github actions ([fb7b5e2](https://github.com/movahedan/monobun/commit/fb7b5e290fe4c20cf028bfc982f71c15ec579ce3)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/eda1742af90892b4338cc6abf59658dd6b050c35"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> ui deps problem ([eda1742](https://github.com/movahedan/monobun/commit/eda1742af90892b4338cc6abf59658dd6b050c35)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/fc95cb68a04df6dfb2a34647a94a94ab595cbed0"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> devcontainer ssh ([fc95cb6](https://github.com/movahedan/monobun/commit/fc95cb68a04df6dfb2a34647a94a94ab595cbed0)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/f743e27a075dde96023b1e106116c541005d5c21"><img src="https://img.shields.io/badge/feat-(noscope)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> introduce devcontainers ([f743e27](https://github.com/movahedan/monobun/commit/f743e27a075dde96023b1e106116c541005d5c21)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/bdd2ebc55d32c8fcf01e3e618aaa0a37ea6f5098"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update dependency next to v15.3.5 (#81) ([bdd2ebc](https://github.com/movahedan/monobun/commit/bdd2ebc55d32c8fcf01e3e618aaa0a37ea6f5098)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/82bf39577b64c9e143c70fdd12eeb669b90d0321"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update oven/bun docker tag to v1.2.18 (#80) ([82bf395](https://github.com/movahedan/monobun/commit/82bf39577b64c9e143c70fdd12eeb669b90d0321)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/d40ef23e96a054755fe83859e1865eacd7da1a63"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency lefthook to v1.11.16 (#79) ([d40ef23](https://github.com/movahedan/monobun/commit/d40ef23e96a054755fe83859e1865eacd7da1a63)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/d2af3e24b8297a3dece9f6a1f4aef399ce6698b8"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @biomejs/biome to v2.0.6 (#78) ([d2af3e2](https://github.com/movahedan/monobun/commit/d2af3e24b8297a3dece9f6a1f4aef399ce6698b8)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/291c3c8d7a3394b6e2eb9a69066e1d2cbaf4b10f"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update dependency @vercel/remix to v2.16.7 (#77) ([291c3c8](https://github.com/movahedan/monobun/commit/291c3c8d7a3394b6e2eb9a69066e1d2cbaf4b10f)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/7342dea59d2835fe3b657987f74bc123b5d6c51d"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency bunchee to v6.5.4 (#76) ([7342dea](https://github.com/movahedan/monobun/commit/7342dea59d2835fe3b657987f74bc123b5d6c51d)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/68dc2386c137bd5c1a1294cf07fb1b56cf2ce0e1"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @biomejs/biome to v2.0.5 (#75) ([68dc238](https://github.com/movahedan/monobun/commit/68dc2386c137bd5c1a1294cf07fb1b56cf2ce0e1)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/253eeace2c18d445819f7141bd3ecd1e08ba9739"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update oven/bun docker tag to v1.2.17 (#74) ([253eeac](https://github.com/movahedan/monobun/commit/253eeace2c18d445819f7141bd3ecd1e08ba9739)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/2f55194d8892d96cf7f1320cd56c90608acd3ace"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @biomejs/biome to v2.0.4 (#73) ([2f55194](https://github.com/movahedan/monobun/commit/2f55194d8892d96cf7f1320cd56c90608acd3ace)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/60a54e05cc923e6e3971aa83f4ea9758a08ba2cf"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @changesets/cli to v2.29.5 (#72) ([60a54e0](https://github.com/movahedan/monobun/commit/60a54e05cc923e6e3971aa83f4ea9758a08ba2cf)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/5008284a666f928576b47bae8f60706ab989a115"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update dependency next to v15.3.4 (#71) ([5008284](https://github.com/movahedan/monobun/commit/5008284a666f928576b47bae8f60706ab989a115)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/bb99f97f622b5cb8e431eaac75db4b08f9ec2317"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @biomejs/biome to v2.0.0 (#70) ([bb99f97](https://github.com/movahedan/monobun/commit/bb99f97f622b5cb8e431eaac75db4b08f9ec2317)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/2a2113280fc28dc5d8f4ffa0e8f1b883e564e6dc"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency lefthook to v1.11.14 (#69) ([2a21132](https://github.com/movahedan/monobun/commit/2a2113280fc28dc5d8f4ffa0e8f1b883e564e6dc)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/c2810ca2f559957de9d65fcfecf2a3ca775857eb"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency bunchee to v6.5.3 (#68) ([c2810ca](https://github.com/movahedan/monobun/commit/c2810ca2f559957de9d65fcfecf2a3ca775857eb)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/79402b7f7607bda4661b26a2ce6e3f2e97525097"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update oven/bun docker tag to v1.2.16 (#67) ([79402b7](https://github.com/movahedan/monobun/commit/79402b7f7607bda4661b26a2ce6e3f2e97525097)) by **renovate[bot]**

### 📦 renovate/lock-file-maintenance <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/66"><img src="https://img.shields.io/badge/%2366-blue?style=flat" alt="#66" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): lock file maintenance

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/2570365202148becb062e9a139a0877842d9f830"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (lock file maintenance) ([2570365](https://github.com/movahedan/monobun/commit/2570365202148becb062e9a139a0877842d9f830)) by **renovate[bot]**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/e1198aef9c41d23ba4de776416580e948a41a1d8"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update remix monorepo to v2.16.8 (#53) ([e1198ae](https://github.com/movahedan/monobun/commit/e1198aef9c41d23ba4de776416580e948a41a1d8)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/855cee3d8d120df986612a2ad0e4e975f8b1fe3c"><img src="https://img.shields.io/badge/chore-(noscope)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> delete package lock ([855cee3](https://github.com/movahedan/monobun/commit/855cee3d8d120df986612a2ad0e4e975f8b1fe3c)) by **Soheil Movahedan**

### 📦 renovate/morgan-1.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/64"><img src="https://img.shields.io/badge/%2364-blue?style=flat" alt="#64" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency @types/morgan to v1.9.10

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/c2aab6798bb01b113e55ebb4636b886134ee402e"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency @types/morgan to v1.9.10) ([c2aab67](https://github.com/movahedan/monobun/commit/c2aab6798bb01b113e55ebb4636b886134ee402e)) by **renovate[bot]**

</details>


### 📦 renovate/nextjs-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/56"><img src="https://img.shields.io/badge/%2356-blue?style=flat" alt="#56" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependency next to v15.3.3

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/2e058aa5ae682d6a68cdde673163b122ef603955"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency next to v15.3.3) ([2e058aa](https://github.com/movahedan/monobun/commit/2e058aa5ae682d6a68cdde673163b122ef603955)) by **renovate[bot]**

</details>


### 📦 renovate/turbo-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/65"><img src="https://img.shields.io/badge/%2365-blue?style=flat" alt="#65" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/2%20commits-green?style=flat" alt="2 commits" style="vertical-align: middle;" />

Renovate/turbo monorepo

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/080630deb09826b97e97f010e0b67b88706b83fe"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency turbo to v2.5.4 ([080630d](https://github.com/movahedan/monobun/commit/080630deb09826b97e97f010e0b67b88706b83fe)) by **renovate[bot]**
- <a href="https://github.com/movahedan/monobun/commit/22ba1f963013b1d92cbc1d0287eb4846a5a3996b"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @types/express to v4.17.23 (#62) ([22ba1f9](https://github.com/movahedan/monobun/commit/22ba1f963013b1d92cbc1d0287eb4846a5a3996b)) by **renovate[bot]**

</details>


### 📦 renovate/turbo-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/57"><img src="https://img.shields.io/badge/%2357-blue?style=flat" alt="#57" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency turbo to v2.5.4

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/8cc868792154b6ae66e21f6607e47f14879b1a7c"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency turbo to v2.5.4) ([8cc8687](https://github.com/movahedan/monobun/commit/8cc868792154b6ae66e21f6607e47f14879b1a7c)) by **renovate[bot]**

</details>


### 📦 renovate/react-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/51"><img src="https://img.shields.io/badge/%2351-blue?style=flat" alt="#51" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependency @types/react to v18.3.23

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/fa5c795d0ab5e0e93fa70f7b56137cbd43226c2b"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency @types/react to v18.3.23) ([fa5c795](https://github.com/movahedan/monobun/commit/fa5c795d0ab5e0e93fa70f7b56137cbd43226c2b)) by **renovate[bot]**

</details>


### 📦 renovate/oven-bun-1.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/55"><img src="https://img.shields.io/badge/%2355-blue?style=flat" alt="#55" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/2%20commits-green?style=flat" alt="2 commits" style="vertical-align: middle;" />

chore(deps): update oven/bun docker tag to v1.2.15

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/67c7ebd7a97fb3d524208baa63af062db3cabeb3"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update bun to v1.2.15 ([67c7ebd](https://github.com/movahedan/monobun/commit/67c7ebd7a97fb3d524208baa63af062db3cabeb3)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/cdcc2fd0a5bef213e7a662b3df55aa9977dddbf6"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update oven/bun docker tag to v1.2.15 ([cdcc2fd](https://github.com/movahedan/monobun/commit/cdcc2fd0a5bef213e7a662b3df55aa9977dddbf6)) by **renovate[bot]**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/29844c2e1836de8df7055303cf01d1af0c32aa8b"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @types/express to v4.17.23 (#62) ([29844c2](https://github.com/movahedan/monobun/commit/29844c2e1836de8df7055303cf01d1af0c32aa8b)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/77a1aaec149268a8a72d8b7d1234dcfc4f6a327e"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @types/cors to v2.8.19 (#60) ([77a1aae](https://github.com/movahedan/monobun/commit/77a1aaec149268a8a72d8b7d1234dcfc4f6a327e)) by **renovate[bot]**

### 📦 renovate/biomejs-biome-2.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/58"><img src="https://img.shields.io/badge/%2358-blue?style=flat" alt="#58" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency @biomejs/biome to v2.0.0-beta.6

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/bf8d3edd1d7ba45c4042fc2caf37cad9b498c28d"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency @biomejs/biome to v2.0.0-beta.6) ([bf8d3ed](https://github.com/movahedan/monobun/commit/bf8d3edd1d7ba45c4042fc2caf37cad9b498c28d)) by **renovate[bot]**

</details>


### 📦 renovate/lefthook-1.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/52"><img src="https://img.shields.io/badge/%2352-blue?style=flat" alt="#52" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency lefthook to v1.11.13

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/a915c9a8a43fe57cf0a46a2dd31742d5c6f641dd"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency lefthook to v1.11.13) ([a915c9a](https://github.com/movahedan/monobun/commit/a915c9a8a43fe57cf0a46a2dd31742d5c6f641dd)) by **renovate[bot]**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/1da50d4ac80b8e87a9221fbb2f353fa23f086f32"><img src="https://img.shields.io/badge/chore-(noscope)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update readme ([1da50d4](https://github.com/movahedan/monobun/commit/1da50d4ac80b8e87a9221fbb2f353fa23f086f32)) by **Soheil Movahedan**

### 📦 refactor/optimize-docker-files <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/63"><img src="https://img.shields.io/badge/%2363-blue?style=flat" alt="#63" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/3%20commits-green?style=flat" alt="3 commits" style="vertical-align: middle;" />

This PR refactors and optimizes the Dockerfiles across multiple apps and updates dependency configurations and setup scripts. Key changes include:
    Updating base images in Dockerfiles to use the lighter alpine variant.
    Adjusting the dependency configuration in the UI package.
    Adding a setup script to retrieve runnable packages based on turbo build results.

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/ac9122f58e05f76387ee8f5c02e6f87fafcf2983"><img src="https://img.shields.io/badge/ci-(repo)-2496ED?style=flat" alt="ci" style="vertical-align: middle;" /></a> optimize github flow ([ac9122f](https://github.com/movahedan/monobun/commit/ac9122f58e05f76387ee8f5c02e6f87fafcf2983)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/8f8f856df000444bbf6b7a0451ada160a7dc9d85"><img src="https://img.shields.io/badge/feat-(repo)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add affected script just for fun ([8f8f856](https://github.com/movahedan/monobun/commit/8f8f856df000444bbf6b7a0451ada160a7dc9d85)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/8935fcaf5abfc0c60ec608b3eda6914cc3877d5d"><img src="https://img.shields.io/badge/feat-(repo)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> optimize dockerfiles sizes ([8935fca](https://github.com/movahedan/monobun/commit/8935fcaf5abfc0c60ec608b3eda6914cc3877d5d)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/49a9280544ea31f1a020e638926719bc3aae1ddc"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @types/body-parser to v1.19.6 (#59) ([49a9280](https://github.com/movahedan/monobun/commit/49a9280544ea31f1a020e638926719bc3aae1ddc)) by **renovate[bot]**

### 🛠️ refactor/utilize-setup-scripts <img src="https://img.shields.io/badge/Infrastructure%20%26%20Tooling-495057?style=flat" alt="Infrastructure & Tooling" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/61"><img src="https://img.shields.io/badge/%2361-blue?style=flat" alt="#61" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/4%20commits-green?style=flat" alt="4 commits" style="vertical-align: middle;" />

refactor(repo): imrove setup scripts
This PR refactors the repository’s setup scripts to improve maintainability and consistency. Key changes include:
    Refactoring start.ts to use a new logging function and dynamic service configuration.
    Introducing a new config.ts file to centralize runnable service definitions.
    Moving cleanup functionality into scripts/setup/cleanup.ts while removing legacy scripts.

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/44a92b36ef5407588981010d0ba54f09b434d3e5"><img src="https://img.shields.io/badge/ci-(repo)-2496ED?style=flat" alt="ci" style="vertical-align: middle;" /></a> optimize github action ([44a92b3](https://github.com/movahedan/monobun/commit/44a92b36ef5407588981010d0ba54f09b434d3e5)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/1f4b5cc117d74caa9e498b52298e6063a2b5288e"><img src="https://img.shields.io/badge/ci-(repo)-2496ED?style=flat" alt="ci" style="vertical-align: middle;" /></a> optimize lefthook ([1f4b5cc](https://github.com/movahedan/monobun/commit/1f4b5cc117d74caa9e498b52298e6063a2b5288e)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/32296b7f9a14d514f07a1bcfe35e3dcfa160f3cf"><img src="https://img.shields.io/badge/ci-(repo)-2496ED?style=flat" alt="ci" style="vertical-align: middle;" /></a> optimized github action ([32296b7](https://github.com/movahedan/monobun/commit/32296b7f9a14d514f07a1bcfe35e3dcfa160f3cf)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/2f593fd862486c26f4ed4dbbe9b9ec837958caa3"><img src="https://img.shields.io/badge/refactor-(repo)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> imrove setup scripts ([2f593fd](https://github.com/movahedan/monobun/commit/2f593fd862486c26f4ed4dbbe9b9ec837958caa3)) by **Soheil Movahedan**

</details>


### 📦 renovate/oven-bun-1.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/44"><img src="https://img.shields.io/badge/%2344-blue?style=flat" alt="#44" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update oven/bun docker tag to v1.2.14

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/76d485bb52d5b0627748b5e20c0f74641fab5d49"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (update oven/bun docker tag to v1.2.14) ([76d485b](https://github.com/movahedan/monobun/commit/76d485bb52d5b0627748b5e20c0f74641fab5d49)) by **renovate[bot]**

</details>


### 📦 renovate/biomejs-biome-2.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/49"><img src="https://img.shields.io/badge/%2349-blue?style=flat" alt="#49" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency @biomejs/biome to v2.0.0-beta.5

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/a355e8efd8cc6c719f228001c8748954565e2e97"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency @biomejs/biome to v2.0.0-beta.5) ([a355e8e](https://github.com/movahedan/monobun/commit/a355e8efd8cc6c719f228001c8748954565e2e97)) by **renovate[bot]**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/ceb2685125f01cc6d805de33c8cd9f04c3c7f6a9"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> pin dependency @remix-run/serve to 2.16.7 (#48) ([ceb2685](https://github.com/movahedan/monobun/commit/ceb2685125f01cc6d805de33c8cd9f04c3c7f6a9)) by **renovate[bot]**

### 📦 renovate/migrate-config <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/50"><img src="https://img.shields.io/badge/%2350-blue?style=flat" alt="#50" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/2%20commits-green?style=flat" alt="2 commits" style="vertical-align: middle;" />

chore(config): migrate renovate config

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/fa2084a1c3ebe1e3ae9ea6b9678aab1de60b8e3e"><img src="https://img.shields.io/badge/merge-(noscope)-6B7280?style=flat" alt="merge" style="vertical-align: middle;" /></a> Merge branch 'main' into renovate/migrate-config ([fa2084a](https://github.com/movahedan/monobun/commit/fa2084a1c3ebe1e3ae9ea6b9678aab1de60b8e3e)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/cf74db4965ec52917af5bf18c32b124f7734475e"><img src="https://img.shields.io/badge/chore-(config)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> migrate config renovate.json ([cf74db4](https://github.com/movahedan/monobun/commit/cf74db4965ec52917af5bf18c32b124f7734475e)) by **renovate[bot]**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/fa2084a1c3ebe1e3ae9ea6b9678aab1de60b8e3e"><img src="https://img.shields.io/badge/merge-(noscope)-6B7280?style=flat" alt="merge" style="vertical-align: middle;" /></a> Merge branch 'main' into renovate/migrate-config ([fa2084a](https://github.com/movahedan/monobun/commit/fa2084a1c3ebe1e3ae9ea6b9678aab1de60b8e3e)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/a645c33355513de87f8182a6ea88efb51cebdb94"><img src="https://img.shields.io/badge/fix-(repo)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> check-branch-name add dot in the pattern ([a645c33](https://github.com/movahedan/monobun/commit/a645c33355513de87f8182a6ea88efb51cebdb94)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/1a774861640927503d798cd209bcd43bc8cee1cb"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency vite to v6 ([1a77486](https://github.com/movahedan/monobun/commit/1a774861640927503d798cd209bcd43bc8cee1cb)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/151e64cbabe9bb02e6e9051dbc312e21086d93c5"><img src="https://img.shields.io/badge/fix-(repo)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update renovate ([151e64c](https://github.com/movahedan/monobun/commit/151e64cbabe9bb02e6e9051dbc312e21086d93c5)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/f2d6c0f19bdf8cbb3310e9059efb7f43960082ca"><img src="https://img.shields.io/badge/merge-(noscope)-6B7280?style=flat" alt="merge" style="vertical-align: middle;" /></a> Merge branch 'renovate/migrate-config' ([f2d6c0f](https://github.com/movahedan/monobun/commit/f2d6c0f19bdf8cbb3310e9059efb7f43960082ca)) by **Soheil Movahedan**

### 📦 renovate/migrate-config <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/45"><img src="https://img.shields.io/badge/%2345-blue?style=flat" alt="#45" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/2%20commits-green?style=flat" alt="2 commits" style="vertical-align: middle;" />

chore(config): migrate renovate config

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/de2d2e6ae22ba63fe32ad3e811ffab94f520e20f"><img src="https://img.shields.io/badge/chore-(config)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> migrate config renovate.json ([de2d2e6](https://github.com/movahedan/monobun/commit/de2d2e6ae22ba63fe32ad3e811ffab94f520e20f)) by **renovate[bot]**
- <a href="https://github.com/movahedan/monobun/commit/5517c141e67a71ab5c1a6153f077d7f0b93b65bc"><img src="https://img.shields.io/badge/fix-(repo)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update renovate to understand react pacakges ([5517c14](https://github.com/movahedan/monobun/commit/5517c141e67a71ab5c1a6153f077d7f0b93b65bc)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/c62ba62dd544c2a5e39656ecdab4448e40415ff2"><img src="https://img.shields.io/badge/chore-(config)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> migrate config renovate.json ([c62ba62](https://github.com/movahedan/monobun/commit/c62ba62dd544c2a5e39656ecdab4448e40415ff2)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/8346d2ae10c84520cd69dc30da5431c83d3aa52c"><img src="https://img.shields.io/badge/fix-(repo)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update renovate to understand react pacakges ([8346d2a](https://github.com/movahedan/monobun/commit/8346d2ae10c84520cd69dc30da5431c83d3aa52c)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/f7577f483a154744eae5ac7d7678f49cdaccc722"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> pin dependencies (#43) ([f7577f4](https://github.com/movahedan/monobun/commit/f7577f483a154744eae5ac7d7678f49cdaccc722)) by **renovate[bot]**

### 🚀 feature/dockerization <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/42"><img src="https://img.shields.io/badge/%2342-blue?style=flat" alt="#42" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/9%20commits-green?style=flat" alt="9 commits" style="vertical-align: middle;" />

Feature/dockerization

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/1e3ae1db93aca2b21e6a827fe0557fa78a724a53"><img src="https://img.shields.io/badge/fix-(repo)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> quality gate errors ([1e3ae1d](https://github.com/movahedan/monobun/commit/1e3ae1db93aca2b21e6a827fe0557fa78a724a53)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/fe34ea1443544e5dd72b7b5829d7bcc6a54c320f"><img src="https://img.shields.io/badge/merge-(noscope)-6B7280?style=flat" alt="merge" style="vertical-align: middle;" /></a> Merge branch 'main' into feature/dockerization ([fe34ea1](https://github.com/movahedan/monobun/commit/fe34ea1443544e5dd72b7b5829d7bcc6a54c320f)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/fe90004d6fc68a7a3062fa37f3036b67847888c6"><img src="https://img.shields.io/badge/feat-(repo)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> :tada: dockerize everything ([fe90004](https://github.com/movahedan/monobun/commit/fe90004d6fc68a7a3062fa37f3036b67847888c6)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/16d7c742102eee58690f5ec69fb40c6cc598ced4"><img src="https://img.shields.io/badge/fix-(repo)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> remove lint command ([16d7c74](https://github.com/movahedan/monobun/commit/16d7c742102eee58690f5ec69fb40c6cc598ced4)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/0b308eda80c2e7dd0889cf746781333cc4b0cdb3"><img src="https://img.shields.io/badge/ci-(repo)-2496ED?style=flat" alt="ci" style="vertical-align: middle;" /></a> add check, main, and _setup workflows ([0b308ed](https://github.com/movahedan/monobun/commit/0b308eda80c2e7dd0889cf746781333cc4b0cdb3)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/755ad952e3fc1390a3610e3214cd78915097820b"><img src="https://img.shields.io/badge/merge-(noscope)-6B7280?style=flat" alt="merge" style="vertical-align: middle;" /></a> Merge branch 'main' into feature/github-actions ([755ad95](https://github.com/movahedan/monobun/commit/755ad952e3fc1390a3610e3214cd78915097820b)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/5a709470fc276c17010e61c8790a81e5d385792d"><img src="https://img.shields.io/badge/feat-(repo)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add commitlint - improve branchlint ([5a70947](https://github.com/movahedan/monobun/commit/5a709470fc276c17010e61c8790a81e5d385792d)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/4794db73818a44a95b01b476863c4aa09472a784"><img src="https://img.shields.io/badge/feat-(repo)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add branch name check script ([4794db7](https://github.com/movahedan/monobun/commit/4794db73818a44a95b01b476863c4aa09472a784)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/dff2aa9c8974f629c5999b32ae89a7e8dca95a8f"><img src="https://img.shields.io/badge/feature-(ci)-6B7280?style=flat" alt="feature" style="vertical-align: middle;" /></a> add pr-release and release actions ([dff2aa9](https://github.com/movahedan/monobun/commit/dff2aa9c8974f629c5999b32ae89a7e8dca95a8f)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/fe34ea1443544e5dd72b7b5829d7bcc6a54c320f"><img src="https://img.shields.io/badge/merge-(noscope)-6B7280?style=flat" alt="merge" style="vertical-align: middle;" /></a> Merge branch 'main' into feature/dockerization ([fe34ea1](https://github.com/movahedan/monobun/commit/fe34ea1443544e5dd72b7b5829d7bcc6a54c320f)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/bc8fe1e7aaa8c9b518932b4d707cb37e0b678c10"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @types/react to v18.3.22 (#41) ([bc8fe1e](https://github.com/movahedan/monobun/commit/bc8fe1e7aaa8c9b518932b4d707cb37e0b678c10)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/3f7268e2fe553344f3466073485c6aaa8598678c"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @biomejs/biome to v2.0.0-beta.5 (#40) ([3f7268e](https://github.com/movahedan/monobun/commit/3f7268e2fe553344f3466073485c6aaa8598678c)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/49a8b60d66fae2c063e7574ca8b84c4f7ebdf17e"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> lock file maintenance shared packages (#38) ([49a8b60](https://github.com/movahedan/monobun/commit/49a8b60d66fae2c063e7574ca8b84c4f7ebdf17e)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/93c30536fa0d563a726bb7e6c4f9c7a1dfdea040"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> lock file maintenance apps (#37) ([93c3053](https://github.com/movahedan/monobun/commit/93c30536fa0d563a726bb7e6c4f9c7a1dfdea040)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/bfb743b338e4195e1f1e13f063b34aa0072ac40f"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @biomejs/biome to v2.0.0-beta.4 (#35) ([bfb743b](https://github.com/movahedan/monobun/commit/bfb743b338e4195e1f1e13f063b34aa0072ac40f)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/2b7cf778cdcf899fbba118606d02e2e296fab1db"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency lefthook to v1.11.13 (#36) ([2b7cf77](https://github.com/movahedan/monobun/commit/2b7cf778cdcf899fbba118606d02e2e296fab1db)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/6c8cac988f237b3583eab91ce94a4c42e20d1908"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @biomejs/biome to v2.0.0-beta.4 (#34) ([6c8cac9](https://github.com/movahedan/monobun/commit/6c8cac988f237b3583eab91ce94a4c42e20d1908)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/dbaf036d36f79dc7b106531020388446c33e4369"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @changesets/cli to v2.29.4 (#33) ([dbaf036](https://github.com/movahedan/monobun/commit/dbaf036d36f79dc7b106531020388446c33e4369)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/755ad952e3fc1390a3610e3214cd78915097820b"><img src="https://img.shields.io/badge/merge-(noscope)-6B7280?style=flat" alt="merge" style="vertical-align: middle;" /></a> Merge branch 'main' into feature/github-actions ([755ad95](https://github.com/movahedan/monobun/commit/755ad952e3fc1390a3610e3214cd78915097820b)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/fbfb1aeb106a0570f5b948fdf6d4d9b221c6be57"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> lock file maintenance shared packages (#31) ([fbfb1ae](https://github.com/movahedan/monobun/commit/fbfb1aeb106a0570f5b948fdf6d4d9b221c6be57)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/c77ce89ce58829699fb977825e6f8e5496a83e83"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> lock file maintenance apps (#30) ([c77ce89](https://github.com/movahedan/monobun/commit/c77ce89ce58829699fb977825e6f8e5496a83e83)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/24816619e4e466dad032c5604052285b9f064ced"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @biomejs/biome to v2.0.0-beta.3 (#13) ([2481661](https://github.com/movahedan/monobun/commit/24816619e4e466dad032c5604052285b9f064ced)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/7de31f84d1cef252770ebeb9a7cd771e3eb747b2"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependency @biomejs/biome to v2.0.0-beta.3 (#29) ([7de31f8](https://github.com/movahedan/monobun/commit/7de31f84d1cef252770ebeb9a7cd771e3eb747b2)) by **renovate[bot]**
###### <a href="https://github.com/movahedan/monobun/commit/dd7d5d4a2712396384a6a8ccb0493dac36bb03b8"><img src="https://img.shields.io/badge/feature-(repo)-6B7280?style=flat" alt="feature" style="vertical-align: middle;" /></a> add first GithubActions ([dd7d5d4](https://github.com/movahedan/monobun/commit/dd7d5d4a2712396384a6a8ccb0493dac36bb03b8)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/584785dbe7f566525caa70b6032753e6ba8ab71b"><img src="https://img.shields.io/badge/chore-(repo)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> remove renovate.json from biome ([584785d](https://github.com/movahedan/monobun/commit/584785dbe7f566525caa70b6032753e6ba8ab71b)) by **Soheil Movahedan**

### 📦 renovate/pin-dependencies <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/27"><img src="https://img.shields.io/badge/%2327-blue?style=flat" alt="#27" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): pin dependencies

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/a87b240b3f670a5a0d7b17400a6ff761e0e7460c"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (pin dependencies) ([a87b240](https://github.com/movahedan/monobun/commit/a87b240b3f670a5a0d7b17400a6ff761e0e7460c)) by **renovate[bot]**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/0f8fd5c6ea7728af6a24765ec1425f6e382bd8b0"><img src="https://img.shields.io/badge/chore-(repo)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> add changessets for version management ([0f8fd5c](https://github.com/movahedan/monobun/commit/0f8fd5c6ea7728af6a24765ec1425f6e382bd8b0)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/09970cb055b5e5de092bd2f7bd216a8bad9e605f"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> remove @types/node from package.json files ([09970cb](https://github.com/movahedan/monobun/commit/09970cb055b5e5de092bd2f7bd216a8bad9e605f)) by **Soheil Movahedan**

### 📦 renovate/migrate-config <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/26"><img src="https://img.shields.io/badge/%2326-blue?style=flat" alt="#26" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(config): migrate renovate config

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/71259149e24fdce23e73fa2949d13c125c21a241"><img src="https://img.shields.io/badge/chore-(config)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (migrate config renovate.json) ([7125914](https://github.com/movahedan/monobun/commit/71259149e24fdce23e73fa2949d13c125c21a241)) by **renovate[bot]**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/b87a30b8c5531b609ff4579340558b6fc76041ba"><img src="https://img.shields.io/badge/chore-(config)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> ignore internal packages in renovate ([b87a30b](https://github.com/movahedan/monobun/commit/b87a30b8c5531b609ff4579340558b6fc76041ba)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/c7851a5994e9e7348274195cfaab313d30fdeda7"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update react (#12) ([c7851a5](https://github.com/movahedan/monobun/commit/c7851a5994e9e7348274195cfaab313d30fdeda7)) by **renovate[bot]**

### 📦 renovate/migrate-config <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/25"><img src="https://img.shields.io/badge/%2325-blue?style=flat" alt="#25" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(config): migrate renovate config

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/6e4e1a283bcf8d76b335f8ab2a5e3ae740d73b5b"><img src="https://img.shields.io/badge/chore-(config)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (migrate config renovate.json) ([6e4e1a2](https://github.com/movahedan/monobun/commit/6e4e1a283bcf8d76b335f8ab2a5e3ae740d73b5b)) by **renovate[bot]**

</details>


### 📦 renovate/node-22.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/22"><img src="https://img.shields.io/badge/%2322-blue?style=flat" alt="#22" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update node.js to v22.15.0

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/153c3ef5a1b6869594009c71b7851a09f8bd94f9"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (update node.js to v22.15.0) ([153c3ef](https://github.com/movahedan/monobun/commit/153c3ef5a1b6869594009c71b7851a09f8bd94f9)) by **renovate[bot]**

</details>


### 📦 renovate/dependencies-(non-major) <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/23"><img src="https://img.shields.io/badge/%2323-blue?style=flat" alt="#23" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependencies (non-major)

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/dfda47bf8fd80331a6dcfd7418d8d879519aca16"><img src="https://img.shields.io/badge/fix-(deps)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependencies (non-major)) ([dfda47b](https://github.com/movahedan/monobun/commit/dfda47bf8fd80331a6dcfd7418d8d879519aca16)) by **renovate[bot]**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/2280fe1c76a5c555dacf23261dd309b453d77fa1"><img src="https://img.shields.io/badge/fix-(chore)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update renovate configuration ([2280fe1](https://github.com/movahedan/monobun/commit/2280fe1c76a5c555dacf23261dd309b453d77fa1)) by **Soheil Movahedan**

### 🐛 fix/sonar-issues <img src="https://img.shields.io/badge/Bug%20Fixes%20%26%20Improvements-495057?style=flat" alt="Bug Fixes & Improvements" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/11"><img src="https://img.shields.io/badge/%2311-blue?style=flat" alt="#11" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

This PR addresses SonarCloud issues by updating component prop type annotations to use Readonly and refining the environment variable handling for port configuration.
    Updated prop types of components in UI, Storefront, and Blog applications
    Changed port assignment to use the nullish coalescing operator for improved default handling

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/c667136e2f2b93d1dc9221b9fe66e2913e037eac"><img src="https://img.shields.io/badge/fix-(repo)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> Squashed changes from PR (sonar cloud issues) ([c667136](https://github.com/movahedan/monobun/commit/c667136e2f2b93d1dc9221b9fe66e2913e037eac)) by **Soheil Movahedan**

</details>


### 📦 renovate/typescript-5.8.3 <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/10"><img src="https://img.shields.io/badge/%2310-blue?style=flat" alt="#10" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore: upgrade typescript to 5.8.3

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/15cf1a1d9bdf6cfcdc1a8a7185f5bd3253d082dc"><img src="https://img.shields.io/badge/chore-(noscope)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (upgrade typescript to 5.8.3) ([15cf1a1](https://github.com/movahedan/monobun/commit/15cf1a1d9bdf6cfcdc1a8a7185f5bd3253d082dc)) by **Soheil Movahedan**

</details>


### 📦 renovate/typescript-5.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/7"><img src="https://img.shields.io/badge/%237-blue?style=flat" alt="#7" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency typescript to v5.8.3

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/1e974611f501bcb5e4d481ed7e75b73e5c47c872"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency typescript to v5.8.3) ([1e97461](https://github.com/movahedan/monobun/commit/1e974611f501bcb5e4d481ed7e75b73e5c47c872)) by **renovate[bot]**

</details>


### 📦 renovate/npm-vite-vulnerability <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/6"><img src="https://img.shields.io/badge/%236-blue?style=flat" alt="#6" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency vite to v5.4.19 [security]

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/aec36ef3b5fb0dcb2657c4b3635e8e3fa78873fa"><img src="https://img.shields.io/badge/chore-(deps)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> Squashed changes from PR (update dependency vite to v5.4.19 [security]) ([aec36ef](https://github.com/movahedan/monobun/commit/aec36ef3b5fb0dcb2657c4b3635e8e3fa78873fa)) by **renovate[bot]**

</details>


### 🐛 fix/biome <img src="https://img.shields.io/badge/Bug%20Fixes%20%26%20Improvements-495057?style=flat" alt="Bug Fixes & Improvements" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/9"><img src="https://img.shields.io/badge/%239-blue?style=flat" alt="#9" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

This PR makes minor adjustments related to biome configuration.
    Reorders import declaration in tsup.config.ts for consistency
    Reorganizes and adds biome-related settings in .vscode/settings.json

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/2d28e103c5c2070fdec7055dbf8f683ab19cd97e"><img src="https://img.shields.io/badge/fix-(chore)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> Squashed changes from PR (biome) ([2d28e10](https://github.com/movahedan/monobun/commit/2d28e103c5c2070fdec7055dbf8f683ab19cd97e)) by **Soheil Movahedan**

</details>


### 📦 renovate/configure <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/4"><img src="https://img.shields.io/badge/%234-blue?style=flat" alt="#4" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

This PR configures Renovate with a new JSON schema and updates dependency version definitions across multiple package.json files, locking versions to explicit values.
    Introduces a new Renovate configuration in renovate.json.
    Updates dependency and devDependency versions in UI, Logger, Jest Presets, and various app package.json files.
    Adds a new cleanup command and updates the Node engine version in the root package.json.

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/f7215bb58c9b14cc4667079b632d8af4f6eabda0"><img src="https://img.shields.io/badge/fix-(repo)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> Squashed changes from PR (fix renovate configuration) ([f7215bb](https://github.com/movahedan/monobun/commit/f7215bb58c9b14cc4667079b632d8af4f6eabda0)) by **Soheil Movahedan**

</details>

###### <a href="https://github.com/movahedan/monobun/commit/70cbb660cdc0a0f5f47f61257063dbcb64385f15"><img src="https://img.shields.io/badge/feat-(repo)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> install renovate and pin dependencies ([70cbb66](https://github.com/movahedan/monobun/commit/70cbb660cdc0a0f5f47f61257063dbcb64385f15)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/38f443f21f030856b33b89529a1ac51159346f9f"><img src="https://img.shields.io/badge/feat-(repo)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> install lefthook as git hooks manager ([38f443f](https://github.com/movahedan/monobun/commit/38f443f21f030856b33b89529a1ac51159346f9f)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/b56dfdccd50917c25693f3d7d0ce143874c0dd09"><img src="https://img.shields.io/badge/feat-(repo)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> install biome v2.0.0-beta.2 ([b56dfdc](https://github.com/movahedan/monobun/commit/b56dfdccd50917c25693f3d7d0ce143874c0dd09)) by **Soheil Movahedan**
###### <a href="https://github.com/movahedan/monobun/commit/b28af670c340fe3628702694db7ce9a705c3c7e3"><img src="https://img.shields.io/badge/feat-(create%20turbo)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> apply package-manager transform ([b28af67](https://github.com/movahedan/monobun/commit/b28af670c340fe3628702694db7ce9a705c3c7e3)) by **Turbobot**
###### <a href="https://github.com/movahedan/monobun/commit/0a38eef4b4ba92d692023ea28b6cd81664aaa570"><img src="https://img.shields.io/badge/feat-(create%20turbo)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> apply official-starter transform ([0a38eef](https://github.com/movahedan/monobun/commit/0a38eef4b4ba92d692023ea28b6cd81664aaa570)) by **Turbobot**