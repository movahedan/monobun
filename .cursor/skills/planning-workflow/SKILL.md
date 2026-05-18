---
name: planning-workflow
description: Use when multi-step or cross-package work needs a written plan before coding, when the user asks for phases/PRs/impact map, or when producing `.cursor/plans/*.plan.md` with code and doc-before-PR sections. Use as step 1 of initiative-workflow.
disable-model-invocation: true
---

# Planning workflow

## When to use

- Work spans **multiple packages/apps**, **repo layout**, **renames**, or **non-trivial tradeoffs**.
- User wants **plan first**, **phases**, **one PR per phase**, or **agent orchestration** later.
- Requirements need **testable gates** and explicit **out-of-scope** before edits.

**When not to use:** single-file fix with obvious AC — state AC + one verify command in chat only.

**Next step after approval:** [initiative-workflow](../initiative-workflow/SKILL.md) — **builder-workflow** → **documentation-sync** → **git-pr-workflow** per phase.

## Principles

1. **Repo-grounded** — `Read` / `rg` / `Glob` before inventing paths; list assumptions and open questions.
2. **Planning gate** — no bulk implementation until the user approves the plan (or says execute).
3. **Phased increments** — each phase = one mergeable unit with its own verification block.
4. **Hard constraints per phase** — what must / must not change in that phase only (defers later renames).
5. **Explicit non-goals** — limit scope creep; optional work labeled optional.

## Phase 0 — Orient

Read root [`AGENTS.md`](../../../AGENTS.md), relevant package `AGENTS.md`, and [`.cursor/rules/`](../../../.cursor/rules/) that apply.

Produce a short **impact sketch**: workspaces, config roots (`package.json`, `turbo.json`, CI, docker, `bunfig.toml`), docs/skills, tests.

## Phase 1 — Design agreement (chat or short doc)

Align with the user:

| Topic | Capture |
|--------|---------|
| Outcome | What is true when done? |
| Phases | Count, order, one PR per phase? |
| Constraints | Policies that must hold every phase |
| Acceptance | Pass/fail checks per phase |
| Non-goals | Directories, renames, features **off** |
| Risks | What breaks first; grep/command mitigations |

## Phase 2 — Write the plan file

**Primary artifact:** `.cursor/plans/<kebab-slug>.plan.md`

Use the structure in [plan-template.md](plan-template.md). Strong plans include:

| Section | Purpose |
|---------|---------|
| YAML frontmatter + `todos` | Cursor plan UI; tracks phase + verify items |
| Target architecture | Mermaid + naming/dependency rules |
| Per-phase blocks | Goal, constraints, **code/config surfaces**, scouts, verify commands, **documentation before PR** (path list) |
| PR sequence | Which phases ship together; doc sync **after build, before PR** |
| Risk table | Risk → mitigation (often `rg` gates) |
| Out of scope | Frozen boundaries |

**Optional human spec:** `docs/planning/<topic>.md` for product narrative — link from the plan; do not duplicate long prose in both.

### Rename / move plans

Add a **master mapping table** (current path | current `name` | final `name`) and split:

- **Phase A:** physical paths only, keep `package.json` names stable if it reduces breakage.
- **Phase B:** scope renames + imports + turbo/docker filters.
- **Phase C:** extract new packages / wire consumers.

Document **dependency policy** (who may depend on whom; what must not become a blanket devDep).

### Verification commands

Pull gates from [`AGENTS.md`](../../../AGENTS.md) (repo default quality commands). Per phase, list **ordered** commands; add phase-specific extras (`rg` gates, smoke filters, dry-runs).

### Scout hints (for builder-workflow)

End each phase with a **Scouts** subsection: named slices the parent can spawn in parallel (2–4 typical). Derive paths from [`AGENTS.md`](../../../AGENTS.md) — do not copy a fixed layout.

Per scout, specify:

- **Task** (code/config inventory only: `package.json`, `rg` patterns, config roots, CI/docker)
- **Patterns** (exact `rg` strings or globs)
- **Row budget** (≤40; [builder output contract](../builder-workflow/subagent-output-contract.md))

Do **not** list doc prose scouts here — use **Documentation before PR** for [documentation-sync](../documentation-sync/SKILL.md).

### Documentation before PR (per phase)

Separate subsection — **not** part of builder implement slices:

```markdown
### Documentation before PR (documentation-sync — after build, before commit)

- AGENTS.md: …
- docs/…: …
- packages/*/AGENTS.md: …
- .cursor/skills/…: … (if commands or paths changed)
```

Run only after phase checkup PASS. See [initiative-workflow](../initiative-workflow/SKILL.md).

Verification commands must be **copy-paste** from `AGENTS.md` / package docs.

## Phase 3 — Planning gate output

Before implementation, post for user approval:

```text
Plan: .cursor/plans/<file>.plan.md
Phases: N (PR1 … PRn)
Phase 1 gate: [commands]
Assumptions: …
Open questions: …
Proceed with Phase 1? (unless user already said execute)
```

**Stop** if the plan conflicts with `AGENTS.md` or `.cursor/rules/` — fix the plan first.

## Optional orchestrator companion

For large initiatives, add `.cursor/plans/<slug>-orchestrator.md` with phase-specific scout slices and subagent roles — or rely on **builder-workflow** defaults.

## Agent failure modes

| Failure | Fix |
|---------|-----|
| Hallucinated paths | Re-run `rg` / `Glob`; update plan tables |
| Mega-phase | Split until each phase has a single verify block |
| Vague “update refs” | Add patterns, file lists, or scout categories |
| Missing constraints | Add per-phase must / must-not |
| No PR sequence | Add table: PR → phase → merge gate |

## Human gates (explicit OK)

Dependency adds, auth/security, CI/deploy, destructive migrations, or deviation from approved plan.

## References

- Full pipeline: [initiative-workflow](../initiative-workflow/SKILL.md)
- Plan skeleton: [plan-template.md](plan-template.md)
- Build: [builder-workflow](../builder-workflow/SKILL.md)
- Docs: [documentation-sync](../documentation-sync/SKILL.md)
- Ship: [git-pr-workflow](../git-pr-workflow/SKILL.md)
