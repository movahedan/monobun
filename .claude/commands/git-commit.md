---
allowed-tools: Bash(git add:*), Bash(git diff:*), Bash(find:*), Bash(grep:*), Bash(gh pr create:*), Read, Edit, MultiEdit
description: Complete interactive commit workflow with documentation updates, branch management, and PR creation
---

## Context

- Current git status: !`git status`
- Staged changes: !`git diff --cached`
- Unstaged changes: !`git diff`
- All changes: !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline 10`

**Follow the comprehensive workflow defined in:** `.cursor/rules/contribute-workflow.mdc`

This command implements the complete 6-step interactive workflow for commits, documentation updates, pushing, and PR creation as specified in the cursor rules.
