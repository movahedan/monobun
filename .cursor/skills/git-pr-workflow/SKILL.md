---
name: git-pr-workflow
description: Monobun ship path — bun overall, working tree, branch gate, staged diff, context-aware conventional commit, precommit, push, and PR body from .github/pull_request_template.md (not fill-only). Use when the user asks to commit, push, open a PR, or finish a branch.
---

# Git + PR (monobun)

## 1. Verify

```bash
bun overall
```

## 2. Working tree

```bash
git status
```

Use this **before** branching to see what is modified, untracked, renamed, or deleted—enough to pick a branch prefix/slug and to spot unrelated changes that should stay out of the first commit.

## 3. Branch

Run **after** working tree observation and **before** staging so the first commit does not land on `main` and the branch name matches the actual change.

```bash
git branch --show-current
```

Before naming or validating the branch, read the **full** patch of what you are about to land (not `--stat` alone)—so the prefix/slug matches renames, deletes, and config churn, not a vague guess:

```bash
git diff HEAD
```

If the diff is huge, still scan paths, renames, deletes, and config keys (workflows, `package.json`, `turbo.json`, `scripts/`, etc.). Fold **untracked** paths from `git status` (§2) into the same picture; they are not in `git diff HEAD`.

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

## 4. Stage

Stage coherent slices (one logical change per commit). Prefer `git add -p` or path-scoped `git add` so unrelated files stay out.

**Large diffs:** split into several commits instead of one mega-commit. Order commits so each slice is reviewable on its own: put **independent** work first (changes that do not need later commits in the stack to compile or make sense), then layers that build on them. Group by **kind of work** when it helps reviewers—e.g. mechanical moves/formatting, dependency bumps, refactors with no behavior change, then behavior or API changes, then tests or docs that describe the new behavior—so history reads as a clear sequence rather than a mixed grab bag.

## 5. Commit message — derive from context (required)

Do **not** pick a generic subject before reading the change. Build the message from evidence.

1. **Inspect the staged slice**
   ```bash
   git diff --cached
   ```
   Use the same discipline as §3: **full** patch, not `git diff --cached --stat` alone. Refine type, scopes, and description from what is staged for **this** commit only.

2. **Map touched workspaces to scopes**
   - For each path under `apps/<dir>/`, read `apps/<dir>/package.json` → `name` (e.g. `admin`, `api`, `storefront`, `docs-astro`).
   - For each path under `packages/<dir>/`, read `packages/<dir>/package.json` → `name` (e.g. `@repo/ui`).
   - Root-only files (`.github/`, `docs/`, `scripts/`, root `package.json`, `turbo.json`, `.cursor/`, etc.) → scope **`root`**.
   - If many scopes fit, prefer a **comma-separated** list (no spaces after commas) when the subject stays ≤ 72 chars; otherwise use the narrowest scope that matches the **primary** intent and validate with precommit.

3. **Choose `type` from behavior, not habit**
   - Workflows / Actions only → `ci(root)` (or the app scope if the workflow is clearly owned by one app).
   - User-facing app or package behavior → `feat` / `fix` with the right scope(s).
   - Docs-only under `docs/` or `*.md` → `docs` (scope the package or `root` if repo-wide).
   - Dependency / lockfile bumps → `deps`.
   - Refactor with no intended behavior change → `refactor`.
   - If two unrelated concerns are staged together, **split the commit** instead of blending types.

4. **Policy gotchas (avoid failed commits)**
   - Do not stage manual edits to **`CHANGELOG.md`** / per-package changelogs or ad-hoc **`version`** bumps unless they come from the version flow; Intershell’s staged rules reject them. Narrative-only changelog edits: omit from the same commit or handle via release tooling.
   - Root `package.json` must not add a **script** whose key is literally `"version"` with a string value — the staged diff matcher treats `+"version": "..."` like a semver edit. Use another script name (e.g. `release`) for the version CLI entrypoint.

5. **Draft the subject last**
   - Imperative mood (`add`, `fix`, `align`), lowercase description, no trailing period, ≤ 72 characters, type lowercase, description must **not** repeat the type as its first word.
   - The subject should be what a reviewer would say changed in **one** accurate line after reading the same diff.

## 6. Commit subject format

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

**Practices:** imperative description; lowercase type; subject ≤ 72 chars; no trailing `.`; do not repeat the type as the first word of the description; `BREAKING CHANGE:` in body when needed.

## 7. Validate message

```bash
bun run precommit -- --message 'type(scope): description'
```

Fix the message until this passes (then commit with the **same** string).

## 8. Push

```bash
git push -u origin HEAD
```

## 9. PR — use the repo template (required)

**Read first:** `.github/pull_request_template.md` — the PR body must follow that structure (headings and sections), written for humans: short, scannable, no boilerplate HTML comments in the final text.

**Do not rely on `gh pr create --fill` alone.** `--fill` uses commit titles/bodies and often **does not** populate the template sections the way reviewers expect; `--fill` combined with `--template` is **version-dependent** and easy to get wrong.

**Process:**

1. Read `.github/pull_request_template.md`.
2. Write a PR body (in chat or a temp file) that includes:
   - **Summary** — goal/problem and outcome (1–2 sentences), grounded in what the branch actually does.
   - **What has changed?** — bullets tied to real paths/packages (workflows, apps, `scripts/`, etc.), user-visible behavior, breaking changes if any.
   - **How to test it?** — concrete steps; keep the `bun overall` checkbox if present; add compose/URLs only when relevant.
3. Strip `<!-- ... -->` comments from what you submit.
4. Open the PR with an explicit body, for example:
   ```bash
   gh pr create --title "Same as best commit subject or a concise PR title" --body-file /path/to/pr-body.md
   ```
   If you prefer one shot without a file:
   ```bash
   gh pr create --title "…" --body "$(cat <<'EOF'
   …markdown body…
   EOF
   )"
   ```
5. If the user uses `gh pr create --web`, paste the filled template into the browser; still **author** the sections first—do not submit empty template placeholders.

## 10. Reply

Branch, PR URL, `bun overall` pass/fail — keep it short.
