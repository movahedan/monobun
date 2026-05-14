---
name: planning-workflow
description: Structured planning for multi-step work and AI agents — impact map, spec in docs/superpowers/specs, planning gate before code, testable acceptance criteria, incremental slices, verification. Use for new features, cross-package refactors, ambiguous requirements, or when the user wants a plan before implementation.
---

# Planning workflow

## When to use

- Work spans **multiple packages/apps**, touches **API + client + OpenAPI**, or has **non-trivial tradeoffs**.
- Requirements are **fuzzy** — need acceptance criteria and **out-of-scope** boundaries before coding.
- User asks for a **spec**, **phases**, **impact map**, or **plan first** (common for reliable agent output).

## Principles (agent + human)

1. **Ground in the repo first** — read/navigation/`rg` before inventing files or APIs; wrong assumptions are cheapest to fix **before** edits ([impact map](https://www.verdent.ai/guides/harness-engineering-ai-coding-workflow) style).
2. **Separate planning from execution** — do not bulk-edit until the user approves a written **plan** or **spec** (planning gate).
3. **Testable success** — “done” means **pass/fail checks** (commands, behaviors), not vibes ([acceptance criteria practice](https://resources.scrumalliance.org/Article/need-know-acceptance-criteria)).
4. **Small increments** — each slice delivers a coherent unit with its own verification; reduces context loss and bad mega-diffs ([incremental delivery](https://en.wikipedia.org/wiki/Iterative_and_incremental_development)).
5. **Explicit non-goals** — list what **not** to change to limit scope creep ([spec discipline](https://codegen.com/blog/how-to-build-agentic-coding-workflows/)).

## Phase 0 — Orient (before any plan)

- Root [`AGENT.MD`](../../../AGENT.MD) + every nested **`AGENT.MD`** for areas involved.
- **Impact sketch** (bullet list): packages, main files/modules, data/API direction, tests likely touched.
- List **assumptions** and **open questions**; flag **high-risk** areas (auth, payments, migrations, public API).

## Phase 1 — Design agreement

Align with the user on:

| Topic | Capture |
|--------|---------|
| **Problem / outcome** | What changes for the user or system? |
| **Scope** | In-scope paths and behaviors |
| **Non-goals** | Directories, refactors, or features **explicitly off** |
| **Constraints** | Version, pattern, or policy (e.g. static export, OpenAPI-first SDK) |
| **Acceptance criteria** | **Pass/fail** bullets — each verifiable (manual step or command) |
| **Risks / rollback** | What fails first; how to revert |

Small fixes can skip a long doc but still need **AC + verification** in chat.

## Phase 2 — Spec file (larger work)

Write to [`docs/superpowers/specs/`](../../../docs/superpowers/specs/) as **`YYYY-MM-DD-<topic>-design.md`** (or team convention). Suggested sections:

1. **Summary** — 2–4 sentences.
2. **Context** — links to code paths, tickets, related specs.
3. **Design** — architecture, data flow, key decisions (short).
4. **Scope / non-goals** — table or bullets.
5. **Acceptance criteria** — numbered, testable.
6. **Plan of attack** — phased increments (see below).
7. **Verification** — exact commands from **`AGENT.MD`** (`bun run lint`, `typecheck`, `php artisan test`, targeted tests).
8. **Open questions** — unresolved before implementation.

Keep the spec **dense**; long prose belongs in chat only during Q&A.

## Phase 3 — Planning gate (before `apply` / big diffs)

Output for **user approval** (in chat or appended to spec):

```text
1. Files/modules to touch: [list]
2. Change per file (1 sentence each): …
3. Order of work (increments): …
4. Verification after each increment: [commands]
5. Assumptions still in play: …
6. Rollback: …
```

**Stop** if assumptions conflict with **`AGENT.MD`**, **`.cursor/rules`**, or the spec — resolve in text first.

## Phase 4 — Implementation

- **Minimal diffs** per increment; one logical theme per commit when possible.
- API/client: [`packages/api-sdk/AGENT.MD`](../../../packages/api-sdk/AGENT.MD); backend OpenAPI: `apps/backend/AGENT.MD`.
- **Evidence:** `.cursor/rules/agent-context.mdc` — no claiming “done” without running listed checks.

## Phase 5 — Verify

- Run **smallest** meaningful check after each increment; full **`bun run lint`** / **`bun run typecheck`** when TS-wide.
- If verification fails, **update the spec or AC** so the same gap cannot recur unnoticed (harness feedback loop).

## Increment template (repeat per slice)

| Increment | Delivers | Verify |
|-----------|----------|--------|
| 1 | … | `command(s)` |
| 2 | … | `command(s)` |

## Agent failure modes (watch for)

- **Hallucinated paths/APIs** — re-check with `Read` / `rg` / package exports.
- **Context drift** — long thread: put decisions in the **spec file**; consider a **fresh chat** for implementation with spec path attached.
- **Tests weakened to pass** — do not strip assertions; fix production code or fix the test intentionally with user alignment.
- **Scope creep** — if new work appears, **update non-goals or open a follow-up**, don’t silently expand.

## Human gates (get explicit OK)

Dependency adds, auth/payment/security behavior, CI/deploy config, destructive migrations, or anything that contradicts the approved plan.

## Token habits

- **Bulk detail in spec/plan files**, not endless chat.
- Attach **entry points** only: `AGENT.MD`, spec path, one or two key files; agent searches the rest.
- Prefer **new chat** for implementation when planning thread is long.

## Further reading

- [Harness / planning gate & impact thinking](https://www.verdent.ai/guides/harness-engineering-ai-coding-workflow) — plan before edits, assumptions explicit.
- [Agentic workflows — task input & scope](https://codegen.com/blog/how-to-build-agentic-coding-workflows/) — acceptance criteria, bounded tasks.
- [Spec-first & verification discipline](https://gogloby.com/insights/ai-coding-workflow-optimization/) — micro-scope, concrete checks.
