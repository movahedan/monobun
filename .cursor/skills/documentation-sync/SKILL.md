---
name: documentation-sync
description: Documentation tiers (rules, AGENTS, README, docs), relationships, sync with package.json/tsconfig, when to update what, rg/git discovery commands, and update checklist. Use when updating docs, finding stale references, or aligning README and AGENTS with code.
---

# Documentation sync

## When to use

- Scripts, workspaces, Docker, CI, or public commands changed and docs may drift.
- Editing or reviewing `README.md`, `AGENTS.md`, `docs/**`, or `.cursor/rules/*.mdc`.
- User asks which docs to update or to refresh onboarding and command references.

## Four-tier documentation structure

1. **`.cursor/rules/`** — Code standards, patterns, workflows (AI-focused)
2. **`AGENTS.md`** — Project context, commands, architecture (AI-focused)
3. **`README.md`** — Project description, architecture ideas, development tips (Human-focused)
4. **`docs/`** — Developer guides, setup, technical details (Human-focused)

## Documentation relationships

### Connection graph

```
README.md ──────┐
                ├─→ Complementary pair (different audiences, same project)
AGENTS.md ──────┘
      │
      ├─→ References → .cursor/rules/ (for standards)
      │
      └─→ Points to → docs/ (for detailed guides)

.cursor/rules/ ──→ AI uses → AGENTS.md (for project context)

docs/ ──→ Human reads → README.md (for overview)
```

### README.md ↔ AGENTS.md

**README.md and AGENTS.md are complementary and should be kept in sync:**

- **README.md**: Human-first overview, what the project is, architectural ideas, development mindset
- **AGENTS.md**: AI-first context, detailed commands, package structure, how to work in the project
- Both cover the same project from different angles
- When architecture changes, update **both**
- README has tips → AGENTS.md has detailed usage

## Best practices by document type

### .cursor/rules/ (AI-focused rules)

```markdown
# Code-first, compact, scannable
- Focus on patterns, not explanations
- Show ✅ good vs ❌ bad code examples
- Keep under 300 lines per rule
- Use globs/alwaysApply metadata correctly
- Reference files with @filename when needed
- Remove explanations, trust linter
```

### AGENTS.md (AI-focused context)

```markdown
# Project context and commands
- List essential commands with examples
- Document package/app structure
- Reference .cursor/rules/ for standards
- Include key files and their purposes
- Document project-specific workflows
- Keep commands grouped by purpose
- Link to nested AGENTS.md files in packages/apps
- Sync commands with package.json scripts
```

### README.md (Human-focused overview)

```markdown
# Project description and architecture
- What the project is and why it exists
- Architectural ideas and design decisions
- Development mindset and philosophy
- Quick start tips (detailed usage in AGENTS.md)
- Visual badges and emojis for scannability
- High-level overview, not implementation details
- Keep in sync with AGENTS.md for same project context
```

### docs/ (Human-focused guides)

```markdown
# Brief, summarized developer guides (NOT exhaustive)
- Friendly, enjoyable to read
- Examples that actually work
- Table of contents with anchor links
- Troubleshooting guides (concise)
- Technical summaries (not deep-dives)
- Workflow overviews (brief)
- Keep it summarized - developers want quick answers, not novels
```

## Syncing with package.json and tsconfig.json

**Keep documentation in sync with `package.json` and `tsconfig.json`:**

### package.json

- **Scripts**: Sync AGENTS.md commands with `package.json` scripts (root and workspace packages you mention)
- **Dependencies**: Reference actual dependencies from `package.json` when documenting installs
- **When scripts change**: Update AGENTS.md and `docs/` to match
- **Verification**: Open `package.json` when documenting commands

### tsconfig.json

- **Package relationships**: Use `tsconfig.json` references to describe how packages relate
- **Module resolution**: Document import paths based on actual tsconfig paths and workspace names
- **Cross-package dependencies**: Trace through tsconfig references before documenting imports

### Documentation sync principles

1. Check `package.json` when documenting commands or scripts
2. Check `tsconfig.json` to understand package relationships
3. Keep docs in sync when those files change
4. Documentation should reflect actual configuration

## When to update what

- **`.cursor/rules/`**: Code standards, patterns, workflows change
- **`AGENTS.md`**: Project structure, commands, scripts, package/app context change
- **`README.md`**: Architecture changes, project description, development philosophy change
- **`docs/`**: Workflows, processes, setup instructions, technical details change

**Important**: When architecture or project structure changes, update **both** README.md and AGENTS.md.

## Discovery commands

Run from the **repository root**. Prefer `rg` (ripgrep); if it is missing, use `grep -RIn "TERM" <dir>` over the same paths.

Replace `TERM` with concrete strings from the change: path segments (`apps/api`, `packages/ui`), script names, env vars, service names, CLI flags, feature names.

### Search prose and rules by keyword

```bash
rg -n "TERM" docs/
rg -n "TERM" --glob "AGENTS.md" .
rg -n "TERM" --glob "README.md" .
rg -n "TERM" .cursor/rules/
```

### Git history on documentation

```bash
git log --oneline -30 -- docs/ README.md AGENTS.md .cursor/rules/
git log --oneline -20 -- docs/ | rg -i "TERM"
```

### Blast radius by kind of change

**Workspace / app / package paths** (example: UI package):

```bash
rg -n "packages/ui|@repo/ui|repo/ui" docs/ AGENTS.md README.md .cursor/rules/
```

**API app** (adjust `TERM` to your area):

```bash
rg -n "apps/api|api\b|3003" docs/ AGENTS.md README.md
```

**Docker / Compose**:

```bash
rg -n "docker|compose|container|Dockerfile" docs/ AGENTS.md README.md
```

**Scripts and documented commands**:

```bash
rg -n "bun run|npm run|turbo run" AGENTS.md README.md docs/
```

**CI / GitHub Actions**:

```bash
rg -n "github|actions|workflow|CI" docs/ AGENTS.md README.md .github/
```

**Technology names** (narrow with `TERM`):

```bash
rg -n "TERM" docs/ README.md AGENTS.md
```

### Cross-links between guides

```bash
rg -n "GETTING_STARTED|SCRIPTING|AUTO_VERSIONING|AGENTS\.md|README\.md" docs/
```

### List documentation surfaces (audit)

```bash
find docs -name "*.md" -type f 2>/dev/null | sort
find . \( -path "./node_modules" -o -path "./.git" \) -prune -o -name "README.md" -print | sort
find . \( -path "./node_modules" -o -path "./.git" \) -prune -o -name "AGENTS.md" -print | sort
find .cursor/rules -name "*.mdc" -type f | sort
```

### Broad search across doc types

```bash
rg -n "TERM" docs/ .cursor/rules/ --glob "*.md" --glob "*.mdc"
rg -n "TERM" --glob "README.md" --glob "AGENTS.md" .
```

Use **multiple passes** with different `TERM`s (symbol, path, old filename) if the first pass is empty.

## Update checklist

1. Map the change to **When to update what** above (rules vs AGENTS vs README vs docs).
2. Open the **smallest** set of files that still covers every surface users and agents hit (nested `AGENTS.md` / README under `apps/` and `packages/` when behavior is local).
3. Align **commands** with `package.json` and **paths** with workspace layout and tsconfig; remove dead links.
4. Run or sanity-check shell examples when practical.
5. Skim related sections so terminology stays consistent across README and AGENTS.

## Verification

- Examples and command lines match current scripts and paths.
- No contradictory instructions between README and AGENTS for the same workflow.
- New recurring workflows: consider one discoverable line in root or nested `AGENTS.md`.
