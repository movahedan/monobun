# Command cheatsheet

Run from repo root. Filters use workspace `name` (`@apps/vite-spa`, `@packages/ui`, …). CLIs live under `tools/scripts/`. Setup: [README § Quick start](../README.md#quick-start) · Map: [AGENTS.md](../AGENTS.md).

## Bootstrap

| Command | Description |
|---------|-------------|
| `bun install` | Install deps + lefthook |
| `bun run local setup` | Install, lint, typecheck, test, build |
| `bun run local setup -- --skip-tests` | Setup without tests |
| `bun run local vscode` | Regenerate VS Code workspace settings |
| `bun run local cleanup` | Remove artifacts / `node_modules` |
| `bun run nuke` | Deep clean (then `bun install`) |

## Quality

| Command | Description |
|---------|-------------|
| `bun run overall` | Lint (write) + affected typecheck, test, build |
| `bun run overall -- --quiet` | Same, minimal Ink output |
| `bun run lint` | Biome check |
| `bun run lint -- --write` | Biome fix |
| `bun run typecheck` | Turbo typecheck |
| `bun test` | All tests |
| `bun test <path>` | One test file |
| `bun test --coverage` | Tests + coverage |
| `bun run build` | Turbo build |
| `bun run precommit` | Branch / message / staged checks |

## Dev (host)

| Command | Description |
|---------|-------------|
| `bun run turbo run dev --filter=@apps/vite-spa` | Vite admin :3001 |
| `bun run turbo run dev --filter=@apps/nextjs` | Next.js :3002 |
| `bun run turbo run dev --filter=@apps/express` | API :3003 |
| `bun run turbo run dev --filter=@packages/ui` | UI / Storybook :3004 |
| `bun run turbo run dev --filter=@apps/astro-ssg` | Docs site :3005 |
| `bun run turbo run build:storybook --filter=@packages/ui` | Build Storybook |
| `bun run build --filter=@packages/ui` | Build one workspace |
| `bun run test --filter=@packages/utils` | Test one workspace |
| `bun run typecheck --filter=@packages/shared-react` | Typecheck shared React hooks |
| `bun run typecheck --filter=@packages/shared-tanstack` | Typecheck TanStack list helpers |

## Docker Compose

| Command | Description |
|---------|-------------|
| `bun run container setup` | Dev stack setup |
| `bun run container up` | Start dev stack |
| `bun run container down` | Stop dev stack |
| `bun run container check` | Up + health |
| `bun run container health` | Health check |
| `bun run container logs` | Logs |
| `bun run container cleanup` | Stop + remove volumes |
| `bun run container --prod up` | Prod-shaped compose file |
| `bun run container compose -- ps` | `docker compose ps` |

## Release & CI

| Command | Description |
|---------|-------------|
| `bun run release prepare` | Plan version bumps + changelog |
| `bun run release apply` | Apply prepared versions |
| `bun run release ci` | CI release workflow |
| `bun run ci attach-affected` | GH output: affected packages |
| `bun run ci attach-service-ports` | GH output: compose ports |
| `bun run export-modules update` | Refresh package export graph |

## Help

| Command | Description |
|---------|-------------|
| `bun run local` | Local subcommands help |
| `bun run container` | Container subcommands help |
| `bun run release` | Release subcommands help |
| `bun run precommit -- --help` | Precommit flags |
| `bun run ci` | CI subcommands help |
