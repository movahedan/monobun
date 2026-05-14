---
name: git-pr-workflow
description: Monobun ship path — bun overall, branch gate, working tree, staged diff, conventional commit, precommit checks, push/PR. Use when the user asks to commit, push, open a PR, or finish a branch.
---

# Git + PR (monobun)

## 1. Verify

```bash
bun overall
```

## 2. Branch

Run **before** `git status` / staging so work lands on a valid head.

```bash
git branch --show-current
```

- **`main`** — do not build a feature/fix commit stack here. Create and switch: `git checkout -b <prefix>/<short-slug>` (prefix + slug from the change; ask the user if the intent is ambiguous).
- **Any other branch** — validate: `bun run precommit -- --branch` (add `--quiet` if you want no Ink UI). If it fails, move to a valid name: prefer `git branch -m <prefix>/<short-slug>` when the branch is **not** pushed yet; otherwise `git checkout -b <prefix>/<short-slug>` from the current tip so uncommitted work follows.

**Shape:** `prefix/rest-of-name` — first `/`-segment must be an allowed **prefix** (commit `feat` ≠ branch `feature`).

**Name rules:** length 1–100; only `[a-zA-Z0-9\-_/.]`; no doubled `-`, `_`, or `/`; no leading or trailing separator; `main` skips prefix rules.

**Prefixes** (first segment; repo extends defaults in `intershell.config.ts`):

| Prefix |
|--------|
| `feature` |
| `fix` |
| `hotfix` |
| `release` |
| `docs` |
| `refactor` |
| `ci` |
| `chore` |
| `wip` |
| `renovate` |
| `codex` |
| `cursor` |
| `agent` |

## 3. Working tree

```bash
git status
```

## 4. Stage

Stage coherent slices (one logical change per commit). Prefer `git add -p` or path-scoped `git add` so unrelated files stay out.

**Large diffs:** split into several commits instead of one mega-commit. Order commits so each slice is reviewable on its own: put **independent** work first (changes that do not need later commits in the stack to compile or make sense), then layers that build on them. Group by **kind of work** when it helps reviewers—e.g. mechanical moves/formatting, dependency bumps, refactors with no behavior change, then behavior or API changes, then tests or docs that describe the new behavior—so history reads as a clear sequence rather than a mixed grab bag.

## 5. Message input

```bash
git diff --cached
```

Use the full staged patch to draft the subject (not `--stat` alone).

## 6. Commit subject

Format: `type(scope1,scope2): description` (multiple scopes comma-separated, no space after commas).

**Types** (pick one; merge commits use `merge` as usual):

| Type | Note |
|------|------|
| `feat`, `fix`, `docs` | Features, fixes, documentation |
| `style` | Formatting / whitespace-only |
| `refactor` | Behavior-preserving structure |
| `perf` | ⚡ Performance |
| `test` | 🧪 Testing |
| `ci` | 👷 CI/CD |
| `chore` | 🔨 Maintenance |
| `deps` | 📦 Dependency updates |
| `revert` | ⏪ Revert commits |
| `merge` | Merge commits |

**Scopes:** every scope token must equal the **`name`** field of a workspace `package.json` you touched (e.g. `root`, `admin`, `api`, `storefront`, `docs-astro`, `@repo/ui`, `@repo/utils`). Omit scope only when it truly spans names awkwardly—then validate with precommit anyway. Intershell’s validator only knows names under `apps/`, `packages/`, and `root` today—if `precommit` rejects a scope, align with that list or adjust `intershell` config.

**Practices:** imperative description (`add`, `fix`, not `added`/`fixed`); lowercase type; subject ≤ 72 chars; no trailing `.`; do not repeat the type as the first word of the description; `BREAKING CHANGE:` in body when needed.

## 7. Validate message

```bash
bun run precommit -- --message 'type(scope): description'
```

Fix the message until this passes (then commit with the same string).

## 8. Push

```bash
git push -u origin HEAD
```

## 9. PR

`.github/pull_request_template.md` — fill it for **humans**: short, scannable, no noise (drop HTML comments before submit). Summary + what changed + how to test; skip essays and pasted logs unless they are the point.

```bash
gh pr create --fill --template .github/pull_request_template.md
```

If flags clash on your `gh`, use `--fill` and paste the template, or `gh pr create --web`.

## 10. Reply

Branch, PR URL, `bun overall` pass/fail — keep it short.
