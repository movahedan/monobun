# AGENTS.md

Guidance for **@packages/shared-react** — small React hooks shared across packages.

## Commands

```bash
bun run typecheck --filter=@packages/shared-react
```

## Exports

| Import | Role |
|--------|------|
| `@packages/shared-react` | Barrel (`useDebouncedCallback`) |
| `@packages/shared-react/useDebouncedCallback` | Debounced callback hook |

## Usage

```typescript
import { useDebouncedCallback } from "@packages/shared-react/useDebouncedCallback";

const debouncedSave = useDebouncedCallback(() => save(), [save], 300);
```

Peer dependency: `react` ^19.
