# AGENTS.md

**@packages/auth-contract** — shared auth types and scope helpers for `@apps/auth` and `@apps/nestjs`.

## Exports

- `SCOPES` / `Scope` — `feature-flags:admin` | `write` | `read`
- `ROLE_SCOPES` — scopes emitted per tenant role (`owner`, `admin`, `member`)
- `hasScope(granted, required)` — hierarchy: `admin` → `write` → `read`

## Commands

```bash
bun run typecheck
bun test
```

## Consumers

| Package | Use |
|---------|-----|
| `@apps/auth` | JWT claims, login role → scopes |
| `@apps/nestjs` | `@RequireScopes()` + `ScopesGuard` |

No runtime app dependencies in this package.
