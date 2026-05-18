# Builder workflow — subagent prompts

Every spawn uses **Goal / Context / Constraints / Done-when / Output** (see [subagent-output-contract.md](subagent-output-contract.md)).

**Context** always includes: plan path `.cursor/plans/<file>.plan.md`, phase number, and “read only that phase section unless noted.”

**Never** paste rule or skill bodies — reference `@AGENTS.md`, `@.cursor/rules/…`, or skill names only.

---

## Mandatory prompt skeleton

```text
Goal: …
Context: Plan @.cursor/plans/[file].plan.md — Phase {N} only. Repo: [root].
Constraints: …
Done when: …
Output: Follow .cursor/skills/builder-workflow/subagent-output-contract.md (hard caps).
```

---

## Explore scout

```text
Readonly explore. Phase {N}.

Goal: {scout task from plan — one slice}
Context: @.cursor/plans/[file].plan.md — read Phase {N} scout hints only.
Constraints: Do not edit. Do not load full plan into reply.
Done when: Table + checklist complete for this slice.

Output (required shape):
1. Summary (≤3 sentences)
2. Table: path | current | required change | grep count (max 40 rows)
3. Checklist (max 12 items)

If truncated, say what rg command parent should run next.
```

---

## Implementer (disjoint slice)

```text
Phase {N} slice: {name}

Goal: {one slice from task board}
Context: @.cursor/plans/[file].plan.md — Phase {N} constraints only.
Constraints: {phase must/must-not from plan}
Do not edit: docs/, AGENTS.md, README.md, .cursor/skills/, .cursor/rules/ (documentation-sync runs later).
Files in scope ONLY:
- {path}
- …
Done when: Edits done; paths listed; no commit.

Output:
- Summary (≤2 sentences)
- Files changed (bulleted, max 25 paths)
- Blockers (if any, max 5)

Do not touch files outside the list. No diff paste.
```

---

## Checkup

Use **`model: composer-2-fast`** on the Task tool.

```text
Phase {N} verification only.

Goal: Run phase gate from plan; report PASS/FAIL with evidence.
Context: @.cursor/plans/[file].plan.md — Phase {N} verification block.
Constraints: Commands from plan only, in order. Do not commit. No refactors.
Done when: Every command labeled PASS or FAIL.

Run sequentially:
{paste exact commands from plan — from AGENTS.md, not invented}

Output:
| Command | Result |
| FAIL details (≤80 lines total)
| Root cause (≤1 line per failure)
| Fix list (≤8 bullets with paths)
```

---

## Code reviewer

```text
Readonly. Phase {N}.

Goal: Find missed plan violations and critical gaps.
Context: Plan phase excerpt below. Scout checklist summary (not full tables).
Constraints: Readonly. Critical = must fix before commit.
Done when: Critical / warnings / pass lists complete.

Plan excerpt:
{goal + constraints + verify — paste from plan, ≤30 lines}

Output (caps per subagent-output-contract.md):
- Critical (≤8)
- Warnings (≤5)
- Pass (≤5)
```
