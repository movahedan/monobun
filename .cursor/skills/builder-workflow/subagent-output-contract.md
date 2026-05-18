# Subagent output contract

Parent enforces these limits. Subagents that exceed them should truncate and point to paths (`rg`, plan, scout table) instead of dumping content.

## Universal

- **No** pasting `AGENTS.md`, `.cursor/rules/*`, or skill bodies — cite paths only.
- **No** full file contents unless one blocking snippet (≤15 lines) for a fix.
- **Prose** (outside tables/lists): ≤20 lines per section.

## Scout (`explore`, readonly)

| Block | Limit |
|-------|--------|
| Summary | ≤3 sentences at top |
| Table `path \| current \| change \| count` | ≤40 rows; if more: top 40 + note “+N more — run `rg 'pattern' path`” |
| Checklist | ≤12 items, `- [ ]` or `- [x]` |
| Sample paths | ≤5 per pattern, not full `rg` output |

**Do not:** narrate exploration steps, paste `package.json` bodies, or list every match.

## Implementer (`generalPurpose` / `shell`)

| Block | Limit |
|-------|--------|
| Summary | ≤2 sentences |
| Files changed | Bulleted paths only, ≤25 entries |
| Blockers | ≤5 bullets |

**Do not:** paste `git diff`, commit, or edit out-of-scope files.

## Checkup (`shell` / `generalPurpose`, **`model: composer-2-fast`**)

| Block | Limit |
|-------|--------|
| Per command | One line: `PASS` or `FAIL` + exit code |
| Failure output | ≤80 lines total across all failures; prefer last 30 lines per command |
| Root cause | ≤1 sentence per failure |
| Fix list | ≤8 bullets, each with exact file path |

**Do not:** re-run gates after parent fixes; do not refactor.

## Reviewer (`code-reviewer`, readonly)

| Block | Limit |
|-------|--------|
| Critical | ≤8 bullets, path + one-line why |
| Warnings | ≤5 bullets |
| Pass | ≤5 bullets |

**Do not:** full diff walkthrough; cite path:line only for critical items.
