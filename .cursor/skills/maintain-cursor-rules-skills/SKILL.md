---
name: maintain-cursor-rules-skills
description: Creates or edits Cursor project rules (.cursor/rules/*.mdc) and project skills (.cursor/skills/*/SKILL.md) from the user’s prompt. Use when the user asks to add, change, remove, or split a rule or skill, adjust frontmatter, globs, or migrate content between rules and skills.
---

# Maintain Cursor rules & skills

## When to use

- User wants a **new rule**, **new skill**, or to **edit / rename / delete** existing ones under `.cursor/`.
- User asks to tune **`description`**, **`globs`**, **`alwaysApply`**, or move procedural steps between a rule and a skill.

## Rule vs skill (pick one home)

| Use **`.cursor/rules/*.mdc`** | Use **`.cursor/skills/<name>/SKILL.md`** |
|------------------------------|------------------------------------------|
| Constraints on **how code/docs are written** (style, security, testing, DOM) | **Step-by-step workflows** (commit, plan, multi-phase checklists) |
| Should attach via **`globs`** when possible; **avoid** huge always-on bodies | Long procedures, templates; loaded when **`description`** matches the task |
| Imperative **must / do not**, short examples | Checklists, bash blocks, “do these steps in order” |

**Do not** duplicate the same long procedure in both a rule and a skill — **one canonical file**, the other links in one line.

## Rule file (`.mdc`)

1. Path: `.cursor/rules/<topic>.mdc`
2. Frontmatter (YAML):
   - **`description`**: third person; **Keywords:** line with trigger tokens (see existing rules in this repo).
   - **`globs`**: array of patterns when the rule should auto-attach; omit or set `alwaysApply: true` only for tiny, high-value rules (most content belongs in **scoped** rules).
   - **`alwaysApply`**: `true` only if it must run every chat — keep **agent-context** as the main always-on; don’t add more always-on without strong reason.
3. Body: concise; **reference** `AGENTS.md` / codebase instead of pasting command matrices; stay **under ~500 lines**; prefer tables + short examples.

## Skill file

1. Path: `.cursor/skills/<skill-name>/SKILL.md` (kebab-case `skill-name`).
2. Frontmatter:
   - **`name`**: matches folder, lowercase, hyphens, ≤64 chars.
   - **`description`**: third person; **what** + **when** (trigger phrases).
3. Body: sections **When to use**, **Steps**, **Principles**; optional `reference.md` **one level deep** if the skill grows.

## After you add or change something

| Change | Also update (if applicable) |
|--------|-----------------------------|
| New/changed **skill** or rule that agents should discover | Root [`AGENTS.md`](../../../AGENTS.md) **Cursor skills** / standards bullets so the next session finds it |
| Touches **docs ownership** / when-to-update / discovery commands | [`.cursor/skills/documentation-sync/SKILL.md`](../../skills/documentation-sync/SKILL.md) (canonical) |
| New **commands** / scripts for humans | [`AGENTS.md`](../../../AGENTS.md) and [`docs/GETTING_STARTED.md`](../../../docs/GETTING_STARTED.md) — **not** duplicated inside rule bodies |

**Default:** If you add a **skill**, add a **single bullet** under **Cursor skills** in root `AGENTS.md` so the next session finds it. Skip if the change is a minor tweak to an existing file only.

## Checklist

- [ ] Right **tier**: rule vs skill; no duplicate mega-content.
- [ ] **`description`** keyword-rich for agent routing.
- [ ] **`globs`** / **`alwaysApply`** appropriate; YAML valid.
- [ ] Linked from root **AGENTS.md** when it’s a **new** entry agents need to see.
- [ ] Run **`bun run lint`** or spot-check if you touched TS/JS elsewhere in the same task.
