# AGENTS.md

Guidance for agents working in this monorepo. **Map and pointers** — standards in rules; procedures in skills; human setup in [README.md](README.md#quick-start); commands in [docs/CHEATSHEET.md](docs/CHEATSHEET.md).

## Standards (`.cursor/rules/`)

| Rule | When |
|------|------|
| [repo-invariants.mdc](.cursor/rules/repo-invariants.mdc) | Every session (always) |
| [typescript.mdc](.cursor/rules/typescript.mdc) | `.ts` / `.tsx` edits |
| [security.mdc](.cursor/rules/security.mdc) | `.ts` / `.js` (ReDoS, validation, auth) |
| [testing.mdc](.cursor/rules/testing.mdc) | `*.test.ts` / `*.spec.ts` |
| [clean-dom.mdc](.cursor/rules/clean-dom.mdc) | UI apps + `packages/ui` |
| [advisor.mdc](.cursor/rules/advisor.mdc) | Review / trade-offs (`@advisor` or intelligent apply) |

Enforced by tooling: [`tools/typescript/base.json`](tools/typescript/base.json), [`biome.json`](biome.json).

## Cursor skills

| Skill | Role |
|-------|------|
| [initiative-workflow](.cursor/skills/initiative-workflow/SKILL.md) | plan → build → docs → PR (per phase) |
| [planning-workflow](.cursor/skills/planning-workflow/SKILL.md) | `.cursor/plans/*.plan.md` |
| [builder-workflow](.cursor/skills/builder-workflow/SKILL.md) | Code/config execution; [orchestration](.cursor/skills/builder-workflow/orchestration.md) for Task spawn |
| [documentation-sync](.cursor/skills/documentation-sync/SKILL.md) | Plan doc list after build, before PR |
| [git-pr-workflow](.cursor/skills/git-pr-workflow/SKILL.md) | Commit, push, PR |
| [monorepo-script-commands](.cursor/skills/monorepo-script-commands/SKILL.md) | Ink CLIs under `tools/scripts/` |

## Essential commands

Setup: [README.md](README.md#quick-start) · Commands: [docs/CHEATSHEET.md](docs/CHEATSHEET.md).

- `bun run overall` — quality gate before commit/PR
- `bun test` — tests (`bunfig.toml` + `tools/tests-preset`)
- `bun run turbo run dev --filter=@apps/vite-spa` — one app dev server
- `bun run precommit` — staged files, branch name, commit message

## Architecture overview

**Turborepo** monorepo, **Bun** package manager and runtime.

**Prerequisites:** Git, [Bun](https://bun.sh/) 1.3.x, [Docker](https://docs.docker.com/desktop/) (full stack), Node **≥ 25**, ~8GB+ RAM.

**Day-to-day:** dev stack on the host with `bun run container …` — `docker-compose.dev.yml` at repo root ([Docker Compose](#docker-compose-host)).

### Workspace names

Use each workspace’s `package.json#name` in Turbo `--filter`, compose, and commit scopes.

| Area | Examples |
|------|----------|
| `apps/*` | `@apps/vite-spa`, `@apps/nextjs`, `@apps/express`, `@apps/astro-ssg` |
| `packages/*` | `@packages/ui`, `@packages/utils`, `@packages/shared-react`, `@packages/shared-tanstack` |
| `tools/*` | `@tools/scripts`, `@tools/typescript`, `@tools/tests-preset` |

### Repo layout

| Path | Role |
|------|------|
| `apps/`, `packages/` | Applications and shared libraries |
| `tools/` | TS presets (`typescript/`), test preset (`tests-preset/`), Bun CLIs (`scripts/`) |
| `docs/` | Guides — [CHEATSHEET](docs/CHEATSHEET.md), [SCRIPTING](docs/SCRIPTING.md), [AUTO_VERSIONING](docs/AUTO_VERSIONING.md) |
| `turbo.json`, `biome.json`, `bunfig.toml` | Build, lint, test preload |

Nested `AGENTS.md` under each app, package, and tool workspace.

### Workspaces

| Path | `name` | Port | Role | Guide |
|------|--------|------|------|-------|
| `apps/vite-spa` | `@apps/vite-spa` | 3001 | Vite admin | [AGENTS.md](apps/vite-spa/AGENTS.md) |
| `apps/nextjs` | `@apps/nextjs` | 3002 | Next.js storefront | [AGENTS.md](apps/nextjs/AGENTS.md) |
| `apps/express` | `@apps/express` | 3003 | Demo REST API | [AGENTS.md](apps/express/AGENTS.md) |
| `apps/nestjs` | `@apps/nestjs` | 3006 | Feature flags control plane (OpenAPI) | [AGENTS.md](apps/nestjs/AGENTS.md) |
| `apps/auth` | `@apps/auth` | 3007 | Auth (JWT, refresh, M2M) | [AGENTS.md](apps/auth/AGENTS.md) |
| `apps/astro-ssg` | `@apps/astro-ssg` | 3005 | Docs site | [AGENTS.md](apps/astro-ssg/AGENTS.md) |
| `packages/ui` | `@packages/ui` | 3004 | React + Storybook | [AGENTS.md](packages/ui/AGENTS.md) |
| `packages/utils` | `@packages/utils` | — | Shared utilities | [AGENTS.md](packages/utils/AGENTS.md) |
| `packages/http` | `@packages/http` | — | Kubb fetcher (client / server / static) | [AGENTS.md](packages/http/AGENTS.md) |
| `packages/auth-contract` | `@packages/auth-contract` | — | Scopes + JWT claim types | [AGENTS.md](packages/auth-contract/AGENTS.md) |
| `packages/nestjs-sdk` | `@packages/nestjs-sdk` | — | Kubb client for `@apps/nestjs` | [AGENTS.md](packages/nestjs-sdk/AGENTS.md) |
| `packages/shared-react` | `@packages/shared-react` | — | Shared React hooks | [AGENTS.md](packages/shared-react/AGENTS.md) |
| `packages/shared-tanstack` | `@packages/shared-tanstack` | — | TanStack list/virtual helpers | [AGENTS.md](packages/shared-tanstack/AGENTS.md) |

### Tools (`tools/`)

| Path | Role |
|------|------|
| `tools/scripts` | Bun CLIs (`local`, `container`, `overall`, …) — [SCRIPTING.md](docs/SCRIPTING.md) |
| `tools/typescript` | TS presets — [AGENTS.md](tools/typescript/AGENTS.md) |
| `tools/tests-preset` | Test preload + Testing Library — [AGENTS.md](tools/tests-preset/AGENTS.md) |

Root `package.json` delegates to **`tools/scripts/`** for Ink CLIs.

### Docker Compose (host)

```bash
bun run container setup
bun run container up
bun run container check
```

Prod-shaped file: `bun run container --prod up`. Extra compose flags after `--`: `bun run container up -- --build`. Help: `bun run container`.

### Troubleshooting

- **Docker** — `bun run container compose -- ps`
- **Deps** — `bun run local cleanup` + `bun install`, or `bun run nuke`
- **Tests** — `bun test packages/ui/src/…`; preset: [tools/tests-preset/AGENTS.md](tools/tests-preset/AGENTS.md)
- **Filters** — workspace `name` from `package.json`, not folder name alone
- **Lint/types** — `bun run lint -- --write`, `bun run typecheck`

Renovate: [renovate.json](renovate.json).

### Stack notes

React 19, Next.js 15, Astro, Express, Tailwind, Biome, Lefthook, Docker Compose (`bun run container …`).

Read the **nested `AGENTS.md`** for the area you touch before editing.

When working with this codebase, run **`bun run overall`** before committing unless a narrower plan gate applies.
