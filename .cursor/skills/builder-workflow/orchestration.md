# Agent orchestration (builder parent)

Use with [builder-workflow/SKILL.md](SKILL.md) and [initiative-workflow](../initiative-workflow/SKILL.md). **Not** a project rule — loaded via skill paths only.

## Delegation shape

Every Task spawn: **goal**, **context** (paths, errors, decisions), **constraints** (rules by `@` path, “do not”), **done-when** (commands, evidence). Reference `@AGENTS.md` and skills — never paste rule or skill bodies.

Prefer bounded parallel work when slices are independent. Parent synthesizes, decides, and integrates unless a child owns a disjoint slice.

## Model tiers (Task tool)

| Tier | Model slug | Use for |
|------|------------|---------|
| **High** | `claude-opus-4-7-thinking-xhigh` or `claude-4.6-sonnet-medium-thinking` | Ambiguous planning, post-checkup diagnosis, hard debugging, trade-offs |
| **Low** | `composer-2-fast` | Mechanical checkup, doc discovery (readonly) |
| **Normal** | Omit `model` | Routine implement, scouts, review |

Checkup in builder **requires** `composer-2-fast`.

## Which skill when spawning

| Job | Skill / type |
|-----|----------------|
| Write / approve plan | planning-workflow (High) |
| Execute plan phase (code) | builder-workflow |
| Sync plan doc list | documentation-sync (Low, after build) |
| Commit / PR | git-pr-workflow |
| Full pipeline order | initiative-workflow |
| Product design (fuzzy) | brainstorming (superpowers cache) |
| Verify before “done” | verification-before-completion (superpowers cache) |
| Debug after failed checkup | systematic-debugging (High) |

## Subagent types (Cursor Task)

| `subagent_type` | Use |
|-----------------|-----|
| `explore` | Read-only search |
| `shell` | Commands, git |
| `ci-investigator` | One failing CI check |
| `code-reviewer` | Review vs plan/standards |
| `generalPurpose` | Multi-step writes |

Launch multiple agents in **one message** only when paths do not overlap.

## Anti-patterns

- One spawn with “do everything” and no done-when
- Pasting rule/skill bodies into child prompts
- High-tier model for trivial edits; Low-tier for ambiguous architecture without a plan
- documentation-sync or commit inside builder implement slices
