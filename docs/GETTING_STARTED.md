# Getting started

One-page guide: install tooling, wire the repo locally, run the stack, and use the quality gate.

**Recommended for day-to-day development:** run the **dev Docker Compose stack on your host** with `bun run container …` (see [Fast path: dev Docker Compose (host)](#fast-path-dev-docker-compose-host)). That starts the same multi-service layout the repo is built around—apps, API, Storybook, shared ports—without hand-wiring each process. Compose filenames and services live in `docker-compose.dev.yml` (and related compose files at the repo root). For how scripts use Intershell entities, see [SCRIPTING.md](./SCRIPTING.md).

## Prerequisites

- [Git](https://git-scm.com/), [Bun](https://bun.sh/) (`curl -fsSL https://bun.sh/install | bash`), [Docker Desktop](https://docs.docker.com/desktop/) (or compatible engine + compose)
- Sensible machine: ~8GB+ RAM for full stack

## Fast path: local machine

```bash
git clone https://github.com/movahedan/monobun.git
cd monobun
bun install
bun run local setup
```

`local setup` runs `bun install`, `lefthook install`, lint (`--write`), typecheck, tests (unless skipped), then `turbo` build. VS Code sync is separate: `bun run local vscode`. Skip tests when iterating: `bun run local setup -- --skip-tests`. Run `bun run local` with no args for Ink help.

Verify the tree: `bun run overall` (lint write + affected typecheck, test, build). CI-friendly: `bun run overall -- --quiet`.

## Fast path: dev Docker Compose (host)

This path uses the repo’s **dev** Compose definition (`docker-compose.dev.yml` and the `bun run container` CLI). The `container` CLI wraps `docker compose` so you get consistent commands (`setup`, `up`, `check`, `health`, …) instead of memorizing long invocations. Use `bun run container --prod …` for `docker-compose.yml` (production-shaped stack, `COMPOSE_PROJECT_NAME=repo-prod`).

You do **not** need “Reopen in Container” for this path—Docker Desktop (or engine + compose) runs on your machine, and you drive the stack from your normal terminal.

```bash
bun run container setup
bun run container up
bun run container check
```

Common follow-ups: `bun run container health`, `bun run container compose -- ps`, `bun run container down`, `bun run container cleanup` (stops dev stack and drops volumes—destructive). Extra compose flags go after `--`, e.g. `bun run container up -- --build`.

Production-shaped stack: pass **`--prod` before the subcommand** (same CLI, different compose file), e.g. `bun run container --prod up`, `bun run container --prod health`, `bun run container --prod down`, or in CI `bun run container --prod compose build …` (see `bun run container` with no args for Ink help).

## Repo layout (cheat sheet)

| Path | Role |
|------|------|
| `apps/` | Runnables: `@apps/vite-spa`, `@apps/express`, `@apps/astro-ssg`, `@apps/nextjs` |
| `packages/` | Shared libs (`ui`, `utils`, …) |
| `tools/` | `typescript`, `tests-preset`, and Bun CLIs under `tools/scripts/` |
| `docs/` | Human guides + planning notes |
| `turbo.json` | Turborepo pipelines (`build`, `test`, `typecheck`, …) |
| `biome.json` | Lint/format (`bun run lint`, `bun run lint -- --write`) |

## Commands (cheat sheet)

Root scripts delegate to `tools/scripts/**` (Ink UI unless `--quiet` where supported). Patterns: `bun run <group> <subcommand> [-- flags]`.

**Local**

| Command | Purpose |
|---------|---------|
| `bun run local setup` | Full local bootstrap |
| `bun run local cleanup` | Remove artifacts / `node_modules` |
| `bun run local vscode` | Regenerate `.vscode/settings.json` / `extensions.json` from workspace packages |

**Turborepo (apps on host)**

There is no root `dev` script. From the repo root use the **`turbo`** script plus the task name, or call `turbo` via `bunx`:

| Command | Purpose |
|---------|---------|
| `bun run turbo run dev --filter=@apps/vite-spa` | One app’s dev server (repeat `--filter` for `@apps/nextjs`, `@apps/express`, …) |
| `bun run turbo run dev` | All workspaces that define a `dev` task (often noisy) |

**Compose (`container`)**

| Command | Purpose |
|---------|---------|
| `bun run container setup` | Build/start dev stack, optional health |
| `bun run container up` / `down` / `build` | Compose lifecycle (dev file by default) |
| `bun run container check` | Up, wait for health, optional teardown |
| `bun run container health` / `compose` / `logs` | Inspect / raw compose / logs |
| `bun run container cleanup` | Stop stack for current mode + volumes |
| `bun run container --prod …` | Same subcommands against `docker-compose.yml` |

**Quality**

| Command | Purpose |
|---------|---------|
| `bun run overall` | Lint write + affected typecheck, test, build |
| `bun run lint` / `lint -- --write` | Biome check / fix |
| `bun run typecheck` | `turbo run typecheck` |
| `bun test` | Bun test runner |
| `bun run build` | `turbo run build` |

**Shipping / hygiene**

| Command | Purpose |
|---------|---------|
| `bun run release prepare` / `apply` / `ci` | Version + changelog flow |
| `bun run precommit` | Branch/message/staged checks (`--help` for flags) |
| `bun run ci attach-affected` | CI helper for affected turbo/docker sets |
| `bun run ci attach-service-ports` | CI helper for compose port JSON |

**Turborepo filters**

```bash
bun run build --filter=@packages/ui
bun run test --filter=@packages/utils
```

## `tools/scripts/` map

| Directory | Entry (from root) | Notes |
|-----------|-------------------|-------|
| `tools/scripts/local/` | `bun run local …` | Host bootstrap |
| `tools/scripts/container/` | `bun run container …` | Compose (dev file default; `--prod` for prod file) |
| `tools/scripts/overall/` | `bun run overall` | Quality gate |
| `tools/scripts/version/` | `bun run release …` | Releases |
| `tools/scripts/precommit/` | `bun run precommit` | Hooks / manual checks |
| `tools/scripts/ci/` | `bun run ci …` | GitHub Actions helpers |
| `tools/scripts/export-modules/` | `bun run export-modules update` | Package export graph |

Shared helpers live beside these (for example `tools/scripts/shared/render-and-exit.tsx`, `tools/scripts/shared/step-progress.tsx`).

## Intershell (what it is here)

The repo depends on the [`intershell`](https://www.npmjs.com/package/intershell) package and uses it to structure interactive CLIs (Ink progress, subcommands, shared exit handling). Business logic for versioning, compose, and workspace discovery lives in the scripts above—not inside this doc. See [SCRIPTING.md](./SCRIPTING.md) for patterns and [AUTO_VERSIONING.md](./AUTO_VERSIONING.md) for the release flow.

## When something fails

- **Docker errors**: ensure the daemon is running; try `bun run container compose -- ps`.
- **`bun install` / lockfile issues**: remove `node_modules`, rerun `bun install`.
- **Flaky tests / isolation**: prefer targeted folders (`bun test packages/<pkg>/src/…`); see `tools/tests-preset/AGENTS.md`.
- **Type/lint drift**: `bun run lint -- --write` then `bun run typecheck`.

For deeper topics (Renovate policy, auto-versioning details), read [`renovate.json`](../renovate.json) plus [AUTO_VERSIONING.md](./AUTO_VERSIONING.md); upstream Renovate docs are at [renovatebot.com](https://docs.renovatebot.com/).
