# Auto versioning

This repo versions packages through `tools/scripts/version/` (`bun run release …`). Logic for commits, tags, dependency-aware commit filtering, and changelog text lives in the **Intershell** library (`intershell` dependency). The upstream Intershell repo mirrors the same ideas under `src/` (entities) and `scripts/version/` (standalone scripts).

## Commands

| Command | Role |
|--------|------|
| `bun run release prepare` | Compute bump and changelog, bump `package.json` version, run `bun install`, write `CHANGELOG.md`, write `.git/COMMIT_EDITMSG`. |
| `bun run release apply` | `git add .`, commit using `.git/COMMIT_EDITMSG`, create the release **git** tag, `git push --follow-tags` (unless `--no-push`). |
| `bun run release ci` | For GitHub Actions: configure bot git remote when env vars exist, then `prepare` from a resolved base SHA and `apply` (see below). |

Run `bun run release` with no arguments for Ink help.

### `prepare` flags

- `-p` / `--package <name>` — Package to version (default: `root`). Must be a **versioned** workspace package (see [Package scope](#package-scope)).
- `-f` / `--from`, `-t` / `--to` — Git ref or tag for the changelog commit range (`to` defaults to `HEAD`).
- `--from-version`, `--to-version` — Semantic versions; resolved to tags using this package’s [tag prefix](#tagging).
- `--bump-type` — Force bump: `major`, `minor`, `patch`, `none`, `synced` (invalid values are rejected at parse time).
- `-q` / `--quiet` — Non-Ink / CI-friendly logging.

### `apply` flags

- `-p` / `--package` — Same as prepare (default `root`).
- `-m` / `--message` — Annotated tag message (default: `Release <package> version <version>`).
- `-n` / `--no-push` — Commit and tag locally only.
- `-d` / `--dry-run` — Print that apply would run; no git changes.
- `-q` / `--quiet` — Quiet mode for CI.

### `ci` flags

- `-n` / `--no-push`, `-d` / `--dry-run`, `-q` / `--quiet` — Forwarded conceptually: dry-run prints the `prepare` / `apply` commands instead of running them; `no-push` is passed through to `apply`.

## End-to-end flow

1. **Prepare** — Validates all packages (Intershell config), resolves the commit range for the chosen package, collects **dependency-scoped** commits, derives bump + changelog, writes files and the suggested release commit body to `.git/COMMIT_EDITMSG`.
2. **Review** — Inspect diff, `CHANGELOG.md`, and `.git/COMMIT_EDITMSG`.
3. **Apply** — One release commit and one annotated tag per run (for the selected package), then push unless disabled.

`ci` uses `EntityTag.getBaseCommitSha()` as `--from` for `prepare`, then runs `apply` with `--quiet` so Actions can ship without Ink.

## Package scope

- **Versioned packages** — `package.json` has `private !== true` and a semver `version`. Listed by `EntityPackage.getVersionedPackages()`; `prepare` rejects unknown or private-only names.
- **Paths** — `EntityPackage`: `root` → repo root; `@packages/foo` → `packages/foo`; `@tools/foo` → `tools/foo`; `@apps/express` → `apps/express` (name must match `package.json` `name`).

## Tagging

- **Prefix** — From `EntityPackage.getTagSeriesName()`: `root` → `v` (tags like `v0.2.0`); other packages → `<slug>-v` where `<slug>` is the scoped name without `@apps/`, `@packages/`, or `@tools/` (e.g. `express-v1.0.0`, `utils-v0.1.0`).
- **Range** — Default lower bound is the latest existing tag for that prefix, or the first commit that introduced the package if no tag exists yet (`EntityPackageTags` + `EntityPackageCommits`).
- **Apply** — Reads version from disk, skips creating a tag if it already exists, otherwise validates the prefix and creates an **annotated** tag via `EntityTag.createTag`, then pushes with `git push --follow-tags` unless `--no-push`.

## Dependency-aware commits (per package)

For each commit in the range, `EntityPackageCommits`:

1. Loads **internal** dependencies of the scoped package **at that commit** (`EntityDependencyAnalyzer.getPackageDependenciesAtRef`).
2. Resolves them from **workspace** `package.json` (`dependencies` / `devDependencies` / `peerDependencies` — `@packages/*`, `@tools/*`, `@apps/*`) and from **`tsconfig` path mappings** (including extended configs), intersected with `EntityPackage.getAllPackages()`.
3. Keeps a commit if it touches the package directory **or** any of those dependency paths. For `root`, any changed file counts as a direct hit.

Merge commits are folded so PR squash ranges do not duplicate individual commits.

## Auto changelog

- **Template** — `DefaultChangelogTemplate` (package display name + tag prefix).
- **Generator** — `EntityPackageChangelog.generateMergedChangelog()` merges new conventional-commit sections into the existing `CHANGELOG.md` next to that package’s `package.json` (`EntityPackage.getChangelogPath()`).
- **Inputs** — Parsed commits in range + `EntityPackageVersion.calculateVersionData()` (bump type and target version, optionally overridden by `--bump-type`).

If there are no commits in range, or the calculator says **no bump**, prepare stops before writing version/changelog (early exit).

## CI: compose deploy hint

After a successful prepare write, the script may append `packages-to-deploy=<name>` to `GITHUB_OUTPUT` when `docker-compose.yml` defines a **service** whose name equals the versioned package name (e.g. package `@apps/express` → compose service `express`). Downstream workflows can consume that output.

## Version checklist

Use this before and after a release.

**Before prepare**

- [ ] Conventional commits in range are correct (`feat`, `fix`, breaking changes as expected for the bump you want).
- [ ] You picked the right `--package` (`root` vs `@apps/...`, `@packages/...`, or `@tools/...`).
- [ ] Workspace validates (`EntityPackage.validateAllPackages()` must pass — fix `package.json` / Intershell package rules if prepare fails early).
- [ ] Private packages stay `private: true` without a conflicting version policy.

**After prepare**

- [ ] New semver on the target `package.json` looks right.
- [ ] `CHANGELOG.md` reads correctly and links/types match your template expectations.
- [ ] `.git/COMMIT_EDITMSG` matches what you want on the release commit.
- [ ] `bun install` side effects (lockfile) are acceptable to commit.

**Before apply**

- [ ] You are on the branch you intend to ship from.
- [ ] No stray staged files you did not mean to include (`apply` runs `git add .`).

**After apply**

- [ ] Release commit and tag exist locally; remote updated if you did not pass `--no-push`.
- [ ] Tag name matches the package prefix + version (see [Tagging](#tagging)).
- [ ] CI / deploy steps that read `GITHUB_OUTPUT` or tags are triggered if you rely on them.

## Reference code

| Area | In this repo | In Intershell (library / reference scripts) |
|------|----------------|---------------------------------------------|
| CLI entry | `tools/scripts/version/index.tsx` | `scripts/version/prepare.ts`, `apply.ts`, `publish.ts` |
| Prepare pipeline | `tools/scripts/version/prepare.tsx` | Overlapping flow; entities imported from `intershell` |
| Commits + deps | — | `src/package-commits/package-commits.ts`, `src/package-commits/dependency-analyzer.ts` |
| Tags / versions | — | `src/package-tags/package-tags.ts`, `src/package-version/`, `src/tag/tag.ts` |

For deeper behavior (conventional commit parsing, changelog sections, validation rules), read the matching modules under `node_modules/intershell/src/` or the Intershell source tree you have checked out locally.
