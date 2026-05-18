# Agent-executable plan template

Copy into `.cursor/plans/<slug>.plan.md`. Replace bracketed placeholders. Delete sections that do not apply.

```markdown
---
name: [Short initiative title]
overview: "[One sentence: phases + outcome]"
todos:
  - id: phase-1-[slug]
    content: "Phase 1: [deliverable in one line]"
    status: pending
  - id: phase-1-verify
    content: "Phase 1 gate: [exact commands]"
    status: pending
  - id: phase-1-docs
    content: "Phase 1: documentation-sync (after build, before PR)"
    status: pending
  - id: phase-1-pr
    content: "Phase 1: git-pr-workflow"
    status: pending
  - id: phase-2-[slug]
    content: "Phase 2: …"
    status: pending
  - id: phase-2-verify
    content: "Phase 2 gate: …"
    status: pending
isProject: false
---

# [Initiative title]

## Target architecture

\`\`\`mermaid
flowchart TB
  [nodes and edges — optional but valuable for cross-package work]
\`\`\`

**Naming / invariants:** [rules that must hold across phases]

| Current | After | Notes |
|---------|-------|-------|
| … | … | … |

**Dependency / policy rules:**
- [what may depend on what]
- [what must NOT be added everywhere]

---

## Phase 1 — [title]

**Goal:** [one sentence — why this phase exists alone]

**Hard constraints (phase 1 only):**
- [must do]
- [must not do]

### Mechanical changes

| From | To | Notes |
|------|-----|-------|
| … | … | git mv / rename / new file |

### Code/config surfaces (builder-workflow)

- [apps/packages/tools paths, configs, CI — no docs/ or AGENTS.md here]
- …

### Scouts (parallel inventory — code/config only)

| Scout | Task | Patterns / paths | Row budget |
|-------|------|------------------|------------|
| 1 | … | `rg '…'` or globs | ≤40 |
| 2 | … | … | ≤40 |

### Verification (phase 1 gate)

\`\`\`bash
[commands in order — copy from AGENTS.md / package docs]
\`\`\`

### Documentation before PR (documentation-sync)

**When:** After verification passes and builder finishes — **not** during implement.

- [AGENTS.md / docs/ / package AGENTS.md / skills — what to update]

---

## Phase 2 — [title]

[Same structure as phase 1]

---

## What stays out of scope

- [explicit non-goals]

---

## Suggested PR sequence

| PR | Content | Merge gate |
|----|---------|------------|
| PR1 | Phase 1 only | [merge gate from phase 1 verify block] |
| PR2 | Phase 2 only | … |

---

## Risk summary

| Risk | Mitigation |
|------|------------|
| … | grep gate / dry-run / smoke command |
```

## Quality bar

A plan is **ready for [initiative-workflow](../initiative-workflow/SKILL.md)** when:

- Each phase has **goal**, **constraints**, **code/config surfaces**, **scouts**, **verification commands**, and **documentation before PR** list.
- Phases are **independently mergeable** (or PR sequence explains coupling).
- Frontmatter `todos` match phase ids and verification todos.
- **No** vague “update references” without grep patterns or file categories.
