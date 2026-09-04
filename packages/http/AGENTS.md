# AGENTS.md

**@packages/http** — Kubb-shaped HTTP client with client, server-request, and static/build runtimes. Transport types and `baseFetch` live in `src/base-fetch.ts` (no `@kubb/plugin-client` runtime dependency).

## Commands

```bash
bun run typecheck
bun test
```

## Exports

| Import | Contents |
|--------|----------|
| `@packages/http` | `createFetcher`, `createBareFetcher`, `baseFetch`, `fetcher` singleton, `FetcherSettings`, flat `ApiError` helpers |
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

Use **`createBareFetcher(settings)`** for `authRefresh` only — strips refresh and attach hooks to avoid recursion.

## Server setup

Do **not** use the default `fetcher` singleton in shared server module scope. Use per-request clients or `@packages/nestjs-sdk/mutator.server` → `createServerClient`.

## Related

- [@packages/nestjs-sdk/AGENTS.md](../nestjs-sdk/AGENTS.md) — mutators, `createServerClient`, SWR hooks
