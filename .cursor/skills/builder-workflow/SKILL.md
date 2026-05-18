---
name: builder-workflow
description: Use when an approved plan phase should be built (code/config only) via subagents through checkup and review, stopping before documentation-sync and git-pr. Use as step 2 of initiative-workflow.
disable-model-invocation: true
---

# Builder workflow

## Overview

**Parent agent** runs an approved **`.cursor/plans/<slug>.plan.md`** in phases — **code and config only**. The plan is the spec for build and verify; chat is for gates and short status.

**This skill ends when the phase build is complete** (checkup PASS, critical review addressed). It does **not** edit documentation tiers, commit, or open PRs.

**After this skill:** [documentation-sync](../documentation-sync/SKILL.md) → [git-pr-workflow](../git-pr-workflow/SKILL.md). Full order: [initiative-workflow](../initiative-workflow/SKILL.md).

**REQUIRED:** [planning-workflow](../planning-workflow/SKILL.md); **verification-before-completion** (superpowers cache).

Read [`AGENTS.md`](../../../AGENTS.md) and [`.cursor/rules/agent.mdc`](../../../.cursor/rules/agent.mdc) by path — never paste into child prompts.

## Token discipline (non-negotiable)

| Rule | Parent | Subagent |
|------|--------|----------|
| Plan in `.cursor/plans/*.plan.md` | Path + phase excerpt ≤40 lines | Read phase section only |
| Every spawn | **Goal / Context / Constraints / Done-when / Output** | [subagent-output-contract.md](subagent-output-contract.md) |
| Rules & skills | `@` paths only | Same |
| Scout returns | Merge task board; not full tables to user | Table ≤40 rows, checklist ≤12 |
| Checkup | **`model: composer-2-fast`** (required) | PASS/FAIL; ≤80 lines failures |
| Implementers | **Disjoint** paths; **no doc-tier files** | ≤25 paths changed |
| User status | ≤12 lines per step | N/A |

Templates: [prompt-templates.md](prompt-templates.md)

## Build scope (in scope vs out)

| In scope (builder) | Out of scope — use later skills |
|--------------------|----------------------------------|
| `apps/`, `packages/`, `tools/` code, tests, configs | `docs/`, root `README.md`, `AGENTS.md` |
| CI/docker/tsconfig/package.json (non-doc) | `.cursor/skills/`, `.cursor/rules/` prose |
| Plan “Code/config surfaces” | Plan **Documentation before PR** → documentation-sync |

Exception: plan explicitly marks a **docs-only phase** — then builder skips code slices and user runs documentation-sync only.

## When to use

- Approved plan; user said execute / proceed.
- **2+ phases** or parallel slices with gates.

**Skip** for trivial single-file fixes (implement directly, then doc-sync if needed, then git-pr).

## Hard constraints (parent)

- **One phase per PR** when the plan says so.
- **Plan wins** over memory.
- **No documentation-sync** during steps A–E.
- **No commit** in this skill unless user explicitly overrides (default: git-pr after doc-sync).
- Subagents do not commit unless tasked.
- Never skip git hooks when committing.

## Subagent roster

| Role | `subagent_type` | `model` | `readonly` |
|------|-----------------|--------|------------|
| Scout | `explore` | default | `true` |
| Implementer | `generalPurpose` or `shell` | default | `false` |
| Checkup | `shell` or `generalPurpose` | **`composer-2-fast`** | `false` |
| Review | `code-reviewer` | default | `true` |

Scout count from plan **Scouts** table (default 2–4, one message). Scouts inventory **code/config** paths — not doc prose (doc list is for documentation-sync).

## Per-phase loop (A–E)

### A — Scout (parallel, readonly)

Tasks from plan phase: package names, `rg` patterns, config roots — **exclude** doc-tier paths unless plan says otherwise.

**Parent:** phase task board (slice → owner → files). No raw tables to user.

### B — Implement (parallel, disjoint slices)

- **No two agents on the same file.**
- **No** `docs/`, `AGENTS.md`, `README.md`, `.cursor/skills/` in slice file lists.

### C — Parent integration

Resolve conflicts; plan sanity `rg`; **no commit**.

### D — Checkup

`composer-2-fast`; commands from plan verify block only. Parent fixes; re-run until PASS.

### E — Review (readonly)

Code/config diff vs plan. Critical fixes only.

### Build complete (handoff)

When D = PASS and E has no open critical items, tell the user:

```text
Phase N build complete.
Next: documentation-sync (plan “Documentation before PR”), then git-pr-workflow.
```

**Do not** start documentation-sync or commit inside this skill.

## User status (≤12 lines)

```text
Phase N — Step {A–E}: {name}
Status: {done | blocked | in progress}
Evidence: {e.g. overall PASS}
Blockers: {none | …}
Next: {A–E step, or “documentation-sync” after E}
```

## Parallelism

| Step | Parallel? |
|------|-----------|
| Scouts | Yes |
| Implementers | Yes, disjoint paths only |
| Checkup / Review | No |

## Anti-patterns

- Editing docs during implement slices
- documentation-sync before checkup PASS
- Commit/PR inside builder (unless user override)
- Pasting rule bodies into child prompts
- Overlapping implementer slices
- Checkup without `composer-2-fast`

## References

- [prompt-templates.md](prompt-templates.md)
- [subagent-output-contract.md](subagent-output-contract.md)
- [initiative-workflow](../initiative-workflow/SKILL.md)
