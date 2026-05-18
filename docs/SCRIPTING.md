# Scripting in this repo

Root automation lives under `tools/scripts/` and is run with **Bun** (`bun tools/scripts/<area>/index.tsx`, wired from root `package.json`). This page lists the **libraries and patterns** those scripts use—not an API reference for every command.

## Stack used by `tools/scripts/`

| Piece | Role |
|--------|------|
| **Bun** | Executes `.tsx` entrypoints; **`$`** from `bun` runs subprocesses with tagged templates (compose, turbo, `bun run …`). |
| **`node:util` `parseArgs`** | Subcommand CLIs and flags (`--help`, `--quiet`, etc.). |
| **`node:fs` / `node:path`** | Filesystem steps where needed (e.g. listing dirs, paths). |
| **React** | Ink is React-based; hooks and small components drive terminals. |
| **[Ink](https://github.com/vadimdemedes/ink)** | Renders TUI output: help screens (`Box`, `Text`, `render`, `useApp`) and the shared step UI (`Static`, animations). `tools/scripts/shared/render-and-exit.tsx` wraps `ink`’s `render` so scripts exit with a consistent code after the tree unmounts. |
| **`tools/scripts/shared/colorify.ts`** | Lightweight ANSI helpers for non-Ink log lines (similar idea to chalk, no extra dependency). |
| **`tools/scripts/shared/step-progress.tsx`** | Reusable multi-step flows (spinner + finished steps) built on Ink. |
| **`tools/scripts/shared/format-cli-error.ts`** | Prints `Error.message` only (no Bun stack trace) for script failures. |
| **Intershell (`intershell`)** | Typed **entities** for monorepo facts: affected packages, compose, git/commits/branches, package metadata, tags, versioning—so scripts stay thin orchestration instead of re-parsing YAML, `package.json`, or git by hand. |
| **Turbo / Biome** | Invoked from scripts via shell (`bun run lint`, `turbo run …`); not imported as libraries in every script. |

## Why Intershell helps in scripting

Intershell is organized around **entities**: plain TypeScript modules, each exposing an `Entity*` surface for one concern (git, tags, conventional commits, workspace packages, changelogs, Turbo affected graphs, Docker Compose, config). They are meant to be **imported from apps, internal CLIs, or CI scripts**—the same work your shell one-liners do, but with shared, tested logic and types.

That matches this monorepo’s scripts:

- **CI** (`tools/scripts/ci/`) uses `EntityAffected` and `EntityCompose` to attach GitHub Actions outputs from the same rules as local dev.
- **Dev / prod** helpers use `EntityCompose` (and related types) for health and compose-aware flows.
- **Version** and **precommit** scripts use `EntityPackage*`, `EntityTag`, `EntityCommit`, `EntityBranch`, etc., so versioning and branch/commit checks stay aligned with config instead of duplicating parsers.

Import from the package root so you stay on the supported public surface:

```typescript
import { EntityAffected, EntityCompose, EntityPackage } from "intershell";
```

The authoritative catalog of entities (what each one is responsible for) is `docs/1_ENTITIES.md` in the **Intershell** package repository. In a local clone of that repo, open `docs/1_ENTITIES.md` for the full `Entity*` list (for example `EntityAffected`, `EntityBranch`, `EntityCommit`, `EntityCompose`, `EntityIntershellConfig`, `EntityPackage`, changelog/commits/tags/version entities, `EntityTag`) and notes on **testing**: entities that touch git or Turbo delegate through a shell abstraction you can mock in unit tests.

## Ink in practice here

- **Help UIs**: Several `*/help.tsx` files render a static Ink tree and exit—readable command summaries without maintaining separate string templates.
- **Long-running steps**: `StepProgressApp` composes Ink primitives so users see one line update for the active step and a stable list of completed steps (`Static` for finished lines, animated/spinner region for the current one).

When adding a new script, prefer the existing helpers (`renderAndExit`, `StepProgressApp`, `parseArgs` pattern) so behavior and exit codes stay consistent with the rest of `tools/scripts/`.

## Where to go next

- Commands: [`docs/CHEATSHEET.md`](./CHEATSHEET.md). Setup: [README § Quick start](../README.md#quick-start). Map: [`AGENTS.md`](../AGENTS.md).
- Conventions for Bun subcommand CLIs and Ink step progress: `.cursor/skills/monorepo-script-commands/SKILL.md` in this repo.
