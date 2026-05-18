---
name: AI rules, skills, and AGENTS deduplication
overview: "Reshape .cursor/rules for correct scoping and minimal always-on context; delete agent.mdc in favor of skills; slim AGENTS.md; tighten documentation-sync so it only syncs plan-listed paths without redoing other workflows."
todos:
  - id: phase-1-rules-reshape
    content: "Phase 1: Reshape rules — repo-invariants, typescript.mdc, fix alwaysApply/globs, delete agent.mdc"
    status: pending
  - id: phase-1-verify
    content: "Phase 1 gate: rg agent.mdc; always-on line budget; precommit --branch"
    status: pending
  - id: phase-1-docs
    content: "Phase 1: documentation-sync (after build, before PR)"
    status: pending
  - id: phase-1-pr
    content: "Phase 1: git-pr-workflow"
    status: pending
  - id: phase-2-skills-orchestration
    content: "Phase 2: Move agent orchestration into builder/initiative skills; trim documentation-sync ownership"
    status: pending
  - id: phase-2-verify
    content: "Phase 2 gate: rg references; read builder-workflow orchestration section"
    status: pending
  - id: phase-2-docs
    content: "Phase 2: documentation-sync (after build, before PR)"
    status: pending
  - id: phase-2-pr
    content: "Phase 2: git-pr-workflow"
    status: pending
  - id: phase-3-agents-slim
    content: "Phase 3: Slim AGENTS.md; fix README badges and stale rule links"
    status: pending
  - id: phase-3-verify
    content: "Phase 3 gate: rg duplication gates; bun run lint (if TS touched)"
    status: pending
  - id: phase-3-docs
    content: "Phase 3: documentation-sync (after build, before PR)"
    status: pending
  - id: phase-3-pr
    content: "Phase 3: git-pr-workflow"
    status: pending
isProject: false
---

# AI rules, skills, and AGENTS deduplication

## Target architecture

```mermaid
flowchart TB
  subgraph always_on [Always apply — minimal]
    R[repo-invariants.mdc]
  end
  subgraph scoped [Apply via globs or intelligent description]
    T[typescript.mdc]
    S[security.mdc]
    X[testing.mdc]
    D[clean-dom.mdc]
    A[advisor.mdc]
  end
  subgraph skills [Skills — procedures only]
    I[initiative-workflow]
    B[builder-workflow + orchestration]
    P[planning-workflow]
    DS[documentation-sync]
    G[git-pr-workflow]
  end
  subgraph map [Map — no standards prose]
    AG[AGENTS.md]
  end
  AG --> R
  AG --> scoped
  AG --> skills
  I --> P --> B --> DS --> G
  B -.->|@ paths only| scoped
```

**Content ownership (single source of truth):**

| Topic | Owner | Others may only… |
|-------|--------|------------------|
| TS strict / `noExplicitAny` | `packages/config-typescript/base.json` + `biome.json` | Reference `@packages/config-typescript/base.json`, `@biome.json` |
| TS/React patterns Biome cannot enforce | `typescript.mdc` (globs) | Short deltas only (unions, intersections policy, self-doc naming) |
| Security invariants (ReDoS, input length) | `security.mdc` (globs) | Link OWASP / `safe-regex`; no duplicate essay in AGENTS |
| Test runner / preset | `bunfig.toml` + `packages/config-tests` | `testing.mdc` = repo-specific test *style* only |
| Multi-agent spawn, model tiers, Task tool | **builder-workflow** (+ initiative context table) | **No** `agent.mdc` |
| Plan → build → docs → PR order | **initiative-workflow** | One-line pointer in AGENTS skills list |
| Commit / branch / PR | **git-pr-workflow** | Not in rules or AGENTS prose |
| Commands cheat sheet | **docs/CHEATSHEET.md** | AGENTS: link + ≤5 commands agents need daily |
| Human onboarding / philosophy | **README.md** | doc-sync updates when architecture changes |
| Doc path list for a phase | **plan file** “Documentation before PR” | documentation-sync executes **only that list** |

**Naming / invariants after refactor:**

| Current | After | Notes |
|---------|-------|-------|
| `coding.mdc` (368 lines, `alwaysApply: true`) | `typescript.mdc` (~80–120 lines, `alwaysApply: false`, globs) | Reference configs; drop linter-duplicated rules |
| `agent.mdc` (46 lines, `alwaysApply: true`) | **deleted** | Content → `builder-workflow` (+ optional `orchestration.md`) |
| (none) | `repo-invariants.mdc` (~40–60 lines, `alwaysApply: true`) | Monorepo roots, secrets, “read package AGENTS first”, no spawn tables |
| `security/testing/clean-dom` + `alwaysApply: true` | Same files, **`alwaysApply: false`** + globs | Fixes Cursor bug: globs ignored when always true |
| AGENTS § TypeScript/Testing/Security/Components | **removed** | Pointers only |
| documentation-sync “four tiers” + workflow prose | **trimmed** | Ownership matrix; no replanning/rebuilding/git steps |

**Dependency policy:**

- Rules must not describe multi-step workflows (skills own those).
- documentation-sync must not edit `.cursor/skills/` or `.cursor/rules/` unless the **approved plan’s doc list** explicitly includes them (meta-initiatives like this plan are the exception).
- builder-workflow must not reference `agent.mdc` after Phase 2.

---

## Phase 1 — Rules reshape (delete agent.mdc)

**Goal:** Cut always-on context from ~1,200 lines to **&lt;80 lines**; fix frontmatter; establish `typescript.mdc` that defers to repo tooling.

**Hard constraints (phase 1 only):**

- **Must** delete `.cursor/rules/agent.mdc` (no replacement rule file).
- **Must** set `alwaysApply: false` on `security`, `testing`, `clean-dom`, and new `typescript.mdc`.
- **Must** add `repo-invariants.mdc` as the **only** `alwaysApply: true` rule besides nothing else always-on.
- **Must not** change application/runtime code, `biome.json`, or tsconfig presets in this phase (reference only).
- **Must not** edit `AGENTS.md`, `README.md`, or skills yet (Phase 2–3).

### Mechanical changes

| From | To | Notes |
|------|-----|-------|
| `coding.mdc` | `typescript.mdc` | `git mv`; rewrite body |
| `agent.mdc` | *(delete)* | Orchestration deferred to Phase 2 skills |
| *(new)* | `repo-invariants.mdc` | Always-on map + invariants |

### `repo-invariants.mdc` (sketch)

- Read nested `AGENTS.md` for the area you touch.
- Quality gate before commit: `bun run overall` (pointer — not full command matrix).
- Do not commit secrets; validate required env vars at use site.
- Initiative work: use **initiative-workflow** skill (one line + path).

### `typescript.mdc` (sketch)

Frontmatter:

```yaml
description: TypeScript and React conventions not enforced by Biome or tsconfig — naming, unions, self-documenting structure
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
```

Body principles:

- **Enforced elsewhere — do not restate:** open `@packages/config-typescript/base.json` (`strict`, unused locals) and `@biome.json` (`noExplicitAny`, style rules).
- **Agent-only deltas:** discriminated unions over bag-of-optionals; prefer `interface` extension over intersection types; explicit return types on non-component functions; import order; self-documenting code (no inline comments); naming table (kebab/Pascal/camel) — **short**, minimal examples.
- Use `@packages/config-typescript/AGENTS.md` for which preset to extend per package type.

### `security.mdc` / `testing.mdc` / `clean-dom.mdc`

- Set `alwaysApply: false`; keep or tighten globs.
- Cut duplicate code blocks; keep ReDoS / validation / a11y items Biome does **not** cover.
- `testing.mdc`: point to `@packages/config-tests` preset and `bunfig.toml`; keep describe/it naming and mock-boundary guidance only (~80–100 lines target).

### Code/config surfaces (builder-workflow)

- `.cursor/rules/*.mdc` (create, mv, delete)
- `README.md` badge links **only if** `coding.mdc` rename breaks URLs (optional defer to Phase 3)

### Scouts (parallel inventory — code/config only)

| Scout | Task | Patterns / paths | Row budget |
|-------|------|------------------|------------|
| 1 | References to `agent.mdc`, `coding.mdc` | `rg -n 'agent\.mdc|coding\.mdc' --glob '*.{md,mdc,ts,tsx}'` | ≤40 |
| 2 | `alwaysApply: true` audit | `rg -n 'alwaysApply:\s*true' .cursor/rules/` | ≤40 |
| 3 | Always-on line count | `wc -l` on rules with `alwaysApply: true` | ≤40 |
| 4 | Biome vs rule overlap | `rg -n 'noExplicitAny|no any|strict' .cursor/rules/ AGENTS.md` | ≤40 |

### Verification (phase 1 gate)

```bash
rg -n 'agent\.mdc' . && test $? -ne 0 || exit 1
rg -n 'alwaysApply:\s*true' .cursor/rules/
wc -l .cursor/rules/repo-invariants.mdc
# Expect: only repo-invariants.mdc has alwaysApply true; always-on total lines < 80
bun run precommit -- --branch
```

### Documentation before PR (documentation-sync — after build, before commit)

- `README.md`: badge href if still pointing at `coding.mdc` (or defer to Phase 3)
- **Do not** slim `AGENTS.md` in this PR

---

## Phase 2 — Skills absorb orchestration; documentation-sync boundaries

**Goal:** Replace `agent.mdc` with skill-owned orchestration; prevent documentation-sync from duplicating planning/builder/git-pr work.

**Hard constraints (phase 2 only):**

- **Must** move model tiers, subagent types, spawn anti-patterns from deleted `agent.mdc` into **builder-workflow** (new section or `orchestration.md` sibling referenced from builder + initiative).
- **Must** update `builder-workflow/SKILL.md` to drop `agent.mdc` reference; parent reads `@.cursor/skills/builder-workflow/SKILL.md` + `@initiative-workflow` only.
- **Must** trim `documentation-sync/SKILL.md`: add **ownership matrix** (table above); remove steps that repeat initiative/planning/builder/git-pr; clarify **“sync only plan-listed paths”** and **“do not update skills/rules unless plan doc list says so”**.
- **Must not** re-expand rules in this phase.

### Mechanical changes

| From | To | Notes |
|------|-----|-------|
| `agent.mdc` content (from git history) | `builder-workflow/orchestration.md` or section in `SKILL.md` | Model tiers, Task subagent_type, anti-patterns |
| `documentation-sync` long workflow prose | Short pointer to initiative-workflow | Keep discovery commands + checklist |

### Code/config surfaces (builder-workflow)

- `.cursor/skills/builder-workflow/SKILL.md`
- `.cursor/skills/builder-workflow/prompt-templates.md` (if spawn templates mention agent.mdc)
- `.cursor/skills/builder-workflow/subagent-output-contract.md`
- `.cursor/skills/initiative-workflow/SKILL.md` (context budget table: remove agent.mdc row)
- `.cursor/skills/documentation-sync/SKILL.md`
- `.cursor/skills/planning-workflow/SKILL.md` (orient: rules are standards only)
- `.cursor/rules/agent.mdc` | confirm absent |

### Scouts

| Scout | Task | Patterns | Row budget |
|-------|------|----------|------------|
| 1 | Stale agent.mdc refs | `rg -n 'agent\.mdc'` | ≤40 |
| 2 | Doc-sync workflow duplication | Read `documentation-sync/SKILL.md` sections vs initiative/builder/git-pr | checklist ≤12 |
| 3 | Spawn guidance location | `rg -n 'Task tool|subagent_type|composer-2-fast' .cursor/skills/` | ≤40 |

### Verification (phase 2 gate)

```bash
rg -n 'agent\.mdc' . && test $? -ne 0 || exit 1
rg -n 'model tiers|subagent_type' .cursor/skills/builder-workflow/
rg -n 'initiative-workflow' .cursor/skills/documentation-sync/SKILL.md
bun run precommit -- --branch
```

### Documentation before PR (documentation-sync)

- `.cursor/skills/planning-workflow/SKILL.md` — if orient section still says “read agent.mdc”
- `AGENTS.md` — **only** skills bullet wording if Phase 3 deferred (prefer Phase 3)

---

## Phase 3 — Slim AGENTS.md and cross-links

**Goal:** `AGENTS.md` becomes a **map** (architecture, package index, pointers) — not a second copy of rules/skills/CHEATSHEET.

**Hard constraints (phase 3 only):**

- **Must remove** duplicated sections: `### TypeScript Configuration`, `### Testing Conventions`, `### Security Guidelines`, `### Component Development` (content lives in rules + package AGENTS + biome/tsconfig).
- **Must** replace `Development Rules & Standards` with a **compact index** (rule filename + one line each; link CHEATSHEET for commands).
- **Must** keep: architecture overview, package/app `AGENTS.md` links, Cursor skills index (one line per skill), single quality-gate line.
- **Must** update `README.md` rule badges to `typescript.mdc` and drop agent badge if any.
- **Must not** paste skill bodies into AGENTS.

### Code/config surfaces (builder-workflow)

- `AGENTS.md`
- `README.md` (badges + four-tier blurb — align names with ownership table)
- `apps/astro-ssg/PROJECT_SUMMARY.md` (placeholder paths to `testing.mdc` / `typescript.mdc`)
- `.cursor/skills/documentation-sync/SKILL.md` — AGENTS/README relationship bullets (no duplicate command lists)

### Scouts

| Scout | Task | Patterns | Row budget |
|-------|------|----------|------------|
| 1 | AGENTS duplication | `rg -n 'no .any|AAA pattern|JWT|explicit return' AGENTS.md` | ≤40 |
| 2 | README rule links | `rg -n 'coding\.mdc|agent\.mdc' README.md` | ≤40 |
| 3 | Line budget | `wc -l AGENTS.md` (target: cut ≥40% vs current ~169) | ≤5 |

### Verification (phase 3 gate)

```bash
rg -n 'no .any types|AAA pattern|JWT tokens' AGENTS.md && test $? -ne 0 || exit 1
rg -n 'coding\.mdc|agent\.mdc' .
wc -l AGENTS.md
bun run lint
bun run precommit -- --branch
```

### Documentation before PR (documentation-sync)

- `docs/CHEATSHEET.md` — when root `package.json` scripts change
- Root `README.md` — four-tier wording matches ownership table
- Optional: `docs/planning/ai-context.md` one-pager for humans (only if team wants; **optional**, label out of scope if skipped)

---

## What stays out of scope

- Changing Biome rules or tsconfig strictness (only reference them).
- Rewriting package-level `AGENTS.md` bodies (unless a scout finds broken paths).
- Monorepo `tools/` vs `scripts/` path migration (separate initiative; plans on other branches must not be conflated).
- Team Rules / User Rules in Cursor settings.
- Auto-generating rules from Biome (future idea; not this initiative).
- Editing `.cursor/plans/monorepo_tools_restructure_*.plan.md`.

---

## Suggested PR sequence

| PR | Content | Merge gate |
|----|---------|------------|
| PR1 | Phase 1 — rules reshape, delete `agent.mdc` | Phase 1 verify block; review always-on &lt;80 lines |
| PR2 | Phase 2 — skills orchestration + doc-sync boundaries | `rg` no `agent.mdc`; builder contains orchestration |
| PR3 | Phase 3 — slim AGENTS + README badges | AGENTS duplication `rg` gates; `wc -l` budget |

**Base branch:** `main` (after [#296](https://github.com/movahedan/monobun/pull/296) merges) or stack on `docs/cursor-agent-workflows` if still open.

---

## Risk summary

| Risk | Mitigation |
|------|------------|
| Agents lose spawn guidance without `agent.mdc` | Phase 2 adds orchestration to builder-workflow before PR1 merges to main, or merge PR1+2 same day |
| `alwaysApply: false` → rule not loaded | Strong `description` + test chat with `@typescript.mdc`; verify in Cursor Rules UI |
| README/AGENTS badges 404 | Scout 2 Phase 3; `rg coding\.mdc` gate |
| documentation-sync still “updates everything” | Ownership matrix + plan-list-only rule in skill |
| Over-trimming security rule | Keep ReDoS / user-regex / length-cap content; drop only duplicate TS style |
| PR #296 conflict on AGENTS skills section | Rebase; Phase 3 reconciles skills list once |

---

## Planning gate (approval)

**Plan:** `.cursor/plans/ai-rules-agents-dedup.plan.md`

**Phases:** 3 (PR1 rules → PR2 skills → PR3 AGENTS)

**Phase 1 gate:** no `agent.mdc`; only `repo-invariants.mdc` always-on; always-on &lt;80 lines; `precommit --branch`

**Assumptions:**

- `noExplicitAny` and `strict` remain authoritative in biome/tsconfig; agents comply via tooling + short rule deltas.
- Orchestration belongs in **builder-workflow**, not a new always-on rule.
- documentation-sync is a **narrow executor** of plan doc lists, not a second initiative-workflow.

**Open questions:**

1. Merge PR1+2 into one PR for fewer rebases, or keep three PRs for reviewability?
2. Add optional `docs/planning/ai-context.md` for humans, or keep meta docs only in skills?
3. Split `clean-dom.mdc` globs to `apps/**` + `packages/ui/**` only (exclude `apps/express`)?

**Proceed with Phase 1?**
