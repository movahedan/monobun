# AGENTS.md

**@packages/http** — Kubb-compatible HTTP client with client, server-request, and static/build runtimes.

## Commands

```bash
bun run typecheck
bun test
```

## Exports

| Import | Contents |
|--------|----------|
| `@packages/http` | `createFetcher`, `createBareFetcher`, `fetcher` singleton, `FetcherSettings`, flat `ApiError` helpers |
| `@packages/http/react` | `FetcherSettingsProvider` |

Auth session (`AuthSession`, `AuthProvider`) belongs in **`@packages/nestjs-sdk`** when auth endpoints exist — not in this package.

## Runtime matrix

| Context | API | Refresh / 401 retry | Dedupe | Token |
|---------|-----|---------------------|--------|-------|
| Browser (default) | `createFetcher(settings)` — omit context | From `settings.refreshConfig` | On | `settings.attachAccessToken` |
| Server request | `createFetcher(settings, { mode: 'server', getAccessToken?, getRequestHeaders? })` | **Off** | Per instance | Context + optional settings hook |
| Build / SSG / CI | `createFetcher(settings, { mode: 'static', ... })` | Off | Off | Optional env token via context |

## Client setup (SPA)

Mount `FetcherSettingsProvider` before generated hooks run. Configure `baseURL`, `credentials: 'include'`, `refreshConfig`, and `attachAccessToken` (JWT + extra headers).

Use **`createBareFetcher(settings)`** for `authRefresh` only — strips refresh and attach hooks to avoid recursion (xpertell `refreshOnlyClient` pattern).

## Server setup

Do **not** use the default `fetcher` singleton in shared server module scope (cross-request leakage). Use per-request clients:

```typescript
import { createFetcher } from "@packages/http";

const client = createFetcher(baseSettings, {
  mode: "server",
  getAccessToken: () => session.getAccessToken(),
  getRequestHeaders: () => ({ "x-tenant-id": tenantId }),
});
```

For `@apps/nestjs` Kubb SDK, prefer `@packages/nestjs-sdk/mutator.server` → `createServerClient`.

## xpertell mapping

| xpertell | monobun |
|----------|---------|
| `FetcherSettingsProvider` + `ApiSdkProvider` | `@packages/http/react` + app providers |
| `refreshCoordination` | `refreshConfig.refreshCoordination` on **client** settings only |
| `refreshOnlyClient` | `createBareFetcher(fetcherSettings)` |
| Server loader | `createFetcher(..., { mode: 'server', ... })` |
| `next build` public data | `mode: 'static'` |

## Anti-patterns

- Shared RSC module importing default `fetcher` singleton
- `attachAccessToken` that reads `window` / cookies on server
- Calling refresh endpoints with the main client instead of `createBareFetcher`

## Related

- [@packages/nestjs-sdk/AGENTS.md](../nestjs-sdk/AGENTS.md) — mutators, `createServerClient`, SWR hooks
