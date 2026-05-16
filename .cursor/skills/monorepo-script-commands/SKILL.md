---
name: monorepo-script-commands
description: >-
  Bun entry scripts under scripts/<area>/ with subcommands, node:util parseArgs,
  Ink step progress (Static + spinner), renderAndExit, and quiet mode without
  duplicate logic. Use when adding or refactoring repo CLI scripts, local/dev/prod
  commands, postinstall hooks, or anything mirroring scripts/local/.
---

# Monorepo script commands (Bun + Ink)

## When to use

- New **multi-subcommand** script (for example `bun scripts/foo/index.tsx` wired as `bun run foo` from root `package.json`).
- Long-running flows that should show **per-step progress** without spamming logs.
- Mixing **Ink UI** with **child process stdout** (install, turbo, biome).

## Layout

| Piece | Location |
|-------|----------|
| Entry + routing | `scripts/<area>/index.tsx` (`#!/usr/bin/env bun`, thin `main`) |
| Help + subcommand guard | `scripts/<area>/help.tsx` — validate subcommand, `printHelpAndExit` |
| Each subcommand | `scripts/<area>/<name>.tsx` — exports `run*` entry used from `index` |
| Shared Ink + helpers | `scripts/step-progress.tsx`, `scripts/render-and-exit.tsx`, `scripts/format-cli-error.ts` |

Keep **one canonical step list** per flow; do not fork “quiet” vs “interactive” logic beyond wrapping.

## Arg parsing

- Use **`parseArgs`** from `node:util` with `args: [...rest]`, `strict: true`, and typed `options`.
- `Bun.argv.slice(2)` → `sub = argv[0]`, `rest = argv.slice(1)` for flags after the subcommand.

## Step progress (Ink)

1. Define **`getXxxSteps(...): readonly StepProgressStep[]`** using a **closure object** (for example `state`) so each step’s `run` can depend on prior results.
2. Wrap UI in **`StepProgressApp`** from `scripts/step-progress.tsx` with a child component that does:

   `const resolveSteps = useCallback(() => getXxxSteps(deps), [deps]);`

3. **Completed lines**: Ink **`<Static>`** so finished steps stay fixed; **live row** = spinner + dim current label (`marginTop` when there is at least one completed line). Do not use full-terminal height unless a footer must pin to the bottom of the screen.
4. **Subprocess output**: **`render(..., { stdout: process.stderr })`** so tool output stays on **stdout** and does not fight the Ink buffer. Prefer **`renderAndExit`** from `scripts/render-and-exit.tsx` (defaults to `stdout: process.stderr`, `waitUntilExit`, `unmount`, **`printCliError`** + `process.exit(1)` on failure — message only, no Bun stack trace).
5. **Top-level failures**: use **`printCliErrorAndExit`** from `scripts/format-cli-error.ts` in `index.tsx` `.catch()` handlers; never `console.error(error)` with an `Error` instance.

## Quiet / CI / postinstall

- If the command supports **`--quiet`**: when quiet, **do not mount Ink**; **`await` each `step.run()`** in order using the **same** `getXxxSteps(options)` array so behavior stays identical.

## Shell steps

- Prefer **`$`...`.quiet()`** from `bun` for noisy commands when logs are not the product; keep **`.nothrow()`** only when intentionally ignoring failures (for example cleanup `rm`).

## Typescript

- Commands with JSX live in **`.tsx`**; `scripts/tsconfig.json` should include `**/*.tsx`.

## Anti-patterns

- Duplicating step bodies for “headless” vs Ink — reuse **`getXxxSteps`** + loop vs **`renderAndExit`**.
- **`console.log`** progress in flows that already use **Static** lines — redundant.
- Ink on **stdout** while children write **stdout** — garbles output; use **stderr** for Ink (via `renderAndExit` defaults).

## Reference implementation

See `scripts/local/` (`index.tsx`, `help.tsx`, `setup.tsx`, `cleanup.tsx`, `vscode.tsx`), `scripts/container/`, and `scripts/render-and-exit.tsx`, `scripts/step-progress.tsx`.
