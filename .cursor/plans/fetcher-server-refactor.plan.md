---
name: Fetcher server refactor
overview: Extract @packages/http with three runtime modes (client / server-request / static-build); preserve xpertell-style AuthSession+Provider on client; server via createFetcher(settings, ctx); flat ApiError; PR1 http, PR2 nestjs-sdk.
todos:
  - id: phase-1-scaffold
    content: "Phase 1: @packages/http — move fetcher, runtime modes, flat errors, createBareFetcher, tests"
    status: completed
  - id: phase-1-verify
    content: "Phase 1 gate: bun test in http + bun run overall"
    status: completed
  - id: phase-1-docs
    content: "Phase 1: documentation-sync (client/server/build matrix in AGENTS.md)"
    status: completed
  - id: phase-1-pr
    content: "Phase 1: git-pr-workflow"
    status: completed
  - id: phase-2-sdk
    content: "Phase 2: nestjs-sdk mutators + client provider wiring guide"
    status: completed
  - id: phase-2-verify
    content: "Phase 2 gate: kubb generate + typecheck + overall"
    status: completed
  - id: phase-2-docs
    content: "Phase 2: documentation-sync"
    status: completed
  - id: phase-2-pr
    content: "Phase 2: git-pr-workflow"
    status: in_progress
isProject: false
---

# Fetcher server refactor (`@packages/http`)

## Reference use case (xpertell — target client architecture)

Monobun should support the same **client** wiring pattern already proven in production:

| Piece | Role |
|-------|------|
| **`AuthSession`** | Persistence + refresh promise + `refreshCoordination` (browser storage adapter) |
| **`ApiSdkProvider`** | `FetcherSettingsProvider` + TanStack Query + `AuthProvider` |
| **`FetcherSettings` config** | `baseURL`, `credentials: 'include'`, `refreshConfig`, `attachAccessToken` (JWT + extra headers) |
| **`refreshOnlyClient`** | `createFetcher` on minimal settings — **no** `refreshConfig` / `attachAccessToken` — used only for `authRefresh` to avoid recursion |
| **`AuthProvider`** | `ensureAccessToken()` on mount — client-only lifecycle |

This plan **keeps that client architecture**. It adds explicit **server-request** and **static/build** runtimes so the same Kubb `Client` type works without `FetcherSettingsProvider` or `AuthSession` on the server.

---

## Architecture judgment

### What is strong (keep)

1. **Policy vs persistence split** — `AuthSession` owns tokens, flags, refresh promise; fetcher owns dedupe, 401 retry, transport. Correct boundary.
2. **`refreshCoordination` on session, wired into fetcher** — Reuses one in-flight refresh for parallel requests and 401 waiters (your `fetcher.ts` already implements this).
3. **`refreshOnlyClient` / bare fetcher** — Essential; refresh endpoint must not trigger another refresh or re-attach that calls `refreshAccessTokenIfExpiringSoon` recursively.
4. **`attachAccessToken` as async hook** — Right extension point for bearer + `user-id` + analytics headers on client; on server, same hook shape but fed from **request** context.
5. **Proactive JWT refresh before send** (`refreshAccessTokenIfExpiringSoon`) — Belongs in client `attachAccessToken`, not in generic transport (avoids timer loops).
6. **`FetcherSettingsProvider` + `mutationGeneration`** — Correct for SPA: one root config, React re-render when settings change.

### What is missing today (gaps)

| Capability | Client (xpertell) | Server (RSC / route handler / BFF) | Build / SSG / codegen |
|------------|-------------------|-------------------------------------|------------------------|
| Settings source | `FetcherSettingsProvider` + singleton | Per-request `createFetcher(baseSettings, ctx)` | Shared `baseSettings` only |
| Token source | `authSession.getAccessToken()` | **`getAccessToken()` from incoming session** (cookies → JWT) | Env service token or **no auth** |
| Refresh + `credentials: 'include'` | `authSession.refreshToken()` | **Must not run** in fetcher (no browser cookie jar) | Off |
| `refreshCoordination` | `authSession` | N/A (disable) | N/A |
| `AuthProvider.ensureAccessToken` | On mount | Caller resolves token **before** `createFetcher` | N/A |
| `attachAccessToken` extras | `user-id`, `ga-client-id` | Tenant/trace headers from request | None or static |
| Dedupe / GET stale cache | Yes | Fresh instance per request (OK) | Off or no cross-build cache |
| Default export `fetcher` | Singleton | **Wrong** if shared across requests | OK for public endpoints only |

**Root gap:** The stack assumes **one global client identity** (`fetcherSettings` + provider). That is correct in the browser; it is **incorrect** on the server where identity is **per incoming HTTP request**. Build time is a third case: **no request**, optional machine credentials.

### What not to do

- Port `AuthSession` or `AuthProvider` to run on the server inside the fetcher package.
- Run `refreshToken()` / 401-refresh loop in server `createFetcher` (refresh cookie + `credentials: 'include'` is a browser concern).
- Use the client singleton `fetcher` in a shared RSC module scope (cross-user leakage + dedupe key collisions on `GET /me`-style paths).

---

## Design agreement (updated)

| Topic | Decision |
|-------|----------|
| **Runtime model** | `createFetcher(settings, context?)` — **omit context = client** (full policy: refresh, dedupe, WeakMap cache). **Pass context = server or static** (see below). |
| **Package** | `@packages/http` — fetcher core + react provider; auth session lives in **SDK** when generated (`@packages/nestjs-sdk/features/auth`), not in http. |
| **Server auth** | `getAccessToken()` on context (session → bearer); optional `getRequestHeaders()` for tenant/trace (replaces client-only `user-id` / GA headers). |
| **Errors** | Flat `{ message?, fields? }` (Nest `ApiError`) |
| **PRs** | PR1 = `@packages/http` · PR2 = `@packages/nestjs-sdk` mutators + integration docs |
| **Client pattern** | Unchanged: `FetcherSettingsProvider` + `AuthSession` + `refreshOnlyClient` via **`createBareFetcher`** export |

---

## Target architecture

```mermaid
flowchart TB
  subgraph client [Client - context omitted]
    AS[AuthSession storage adapter]
    PROV[FetcherSettingsProvider]
    FSING[fetcherSettings singleton]
    CF1[createFetcher settings]
  bare[createBareFetcher - authRefresh only]
    AS --> PROV
    PROV --> FSING
    FSING --> CF1
    AS --> bare
  end

  subgraph server [Server - context per request]
    REQ[Incoming request]
    SESS[App: cookies to JWT]
    CTX["FetcherRuntimeContext mode: server"]
    CF2[createFetcher baseSettings ctx]
    GEN[Kubb server fn with client override]
    REQ --> SESS
    SESS --> CTX
    CTX --> CF2
    CF2 --> GEN
  end

  subgraph static [Build / static - context mode static]
    ENV[Env service token or anonymous]
    CF3[createFetcher baseSettings ctx]
    ENV --> CF3
  end

  subgraph pkg [@packages/http]
    CF1
    CF2
    CF3
    bare
  end
```

**Runtime modes** (explicit in `FetcherRuntimeContext`):

| `mode` | When | Refresh / 401 retry | Dedupe | WeakMap cache | Token |
|--------|------|---------------------|--------|---------------|-------|
| *(omit context)* | Browser default | From `settings.refreshConfig` | On | On | `settings.attachAccessToken` |
| `server` | RSC, route handler, Express req | **Forced off** | Per instance | **Skipped** | `ctx.getAccessToken` + optional `ctx.getRequestHeaders` composed into attach |
| `static` | `next build`, Astro generate, CI smoke | Off | Off | Skipped | Optional `ctx.getAccessToken` from env |

**Naming / invariants**

| Item | Value |
|------|-------|
| Workspace | `@packages/http` at `packages/http/` |
| Exports | `@packages/http`, `@packages/http/react`, `@packages/http/auth` **not** — auth stays in SDK |
| `createBareFetcher(settings)` | Strips `refreshConfig` + `attachAccessToken` for refresh-only calls (replaces ad-hoc `refreshOnlyClient` IIFE) |
| Client default export | `fetcher` = `createFetcher(fetcherSettings)` — **no context** |
| Server | `createFetcher(serverBaseSettings, { mode: 'server', getAccessToken, ... })` per request |
| Compose attach | Server: `settings.attachAccessToken` (if any) **then** context bearer/headers — or document server uses context-only |

**Dependency policy**

- `@packages/http` → `@kubb/plugin-client`; React only in `@packages/http/react`.
- `@packages/nestjs-sdk` → `@packages/http` (PR2); hosts **AuthSession** + generated `authRefresh` when auth exists.
- `@packages/utils` — no http dependency; remove `src/fetcher`.

---

## Phase 1 — `@packages/http` core (PR1)

**Goal:** Three runtime modes, flat errors, `createBareFetcher`, tests — **no** nestjs-sdk migration yet.

**Hard constraints (phase 1 only):**

- **Must** preserve client behavior when `runtimeContext` is omitted (refresh, dedupe, coordination, WeakMap).
- **Must** when `mode: 'server' | 'static'`: force `shouldRefresh → false`, skip WeakMap cache, fresh Maps per `createFetcher` call.
- **Must** export `createBareFetcher` for refresh-only Kubb client (xpertell `refreshOnlyClient` pattern).
- **Must** implement context composition for Authorization + `getRequestHeaders`.
- **Must not** port `AuthSession` / `AuthProvider` into http (document expected SDK placement).
- **Must not** change nestjs-sdk.

### API sketch (PR1)

```ts
export type FetcherRuntimeMode = "server" | "static";

export type FetcherRuntimeContext = {
  readonly mode: FetcherRuntimeMode;
  readonly getAccessToken?: () => Promise<string | undefined>;
  readonly getRequestHeaders?: () => Promise<Record<string, string>>;
  readonly signal?: AbortSignal;
};

/** Client: omit context. Server/static: pass context. */
export function createFetcher(
  settings: FetcherSettings,
  runtimeContext?: FetcherRuntimeContext,
): Client;

/** For authRefresh only — no refreshConfig, no attachAccessToken. */
export function createBareFetcher(settings: FetcherSettings): Client;
```

Internal helper (optional export): `resolveAttachAccessToken(settings, runtimeContext)` — client uses settings only; server composes token + headers.

### xpertell → monobun mapping (documentation in AGENTS.md)

| xpertell | monobun (after PR1/2) |
|----------|------------------------|
| `ApiSdkProvider` + `FetcherSettingsProvider` | App provider — unchanged pattern |
| `authSession.refreshCoordination` | Wire into `refreshConfig` on **client** settings only |
| `attachAccessToken` + `refreshAccessTokenIfExpiringSoon` | Keep in provider `useState` settings — **client only** |
| `refreshOnlyClient` | `createBareFetcher(fetcherSettings)` in SDK `AuthSession.refreshToken` |
| Server RSC loader | `createFetcher(baseSettings, { mode: 'server', getAccessToken })` |
| `next build` fetching public data | `mode: 'static'` or omit auth |

### Mechanical changes

| From | To |
|------|-----|
| `packages/utils/src/fetcher/` | `packages/http/src/fetcher/` |
| `SharedApiErrorEnvelope` | `packages/http/src/api-error.ts` (flat) |
| — | `packages/http/src/runtime-context.ts` |
| — | `packages/http/src/create-bare-fetcher.ts` |

### Tests (PR1 — required)

- Client mode: refresh coordination still awaited when `isRefreshInFlight` (mock).
- Server mode: two parallel `createFetcher(..., ctx)` do not share dedupe Maps (different instances).
- Server mode: 401 does **not** call `refresh` from settings.
- `createBareFetcher`: calling transport does not invoke `attachAccessToken` from parent settings.
- `normalizeFetcherError`: flat Nest fixture.

### Verification (phase 1 gate)

```bash
cd packages/http && bun run typecheck
cd packages/http && bun test
bun run overall
```

```bash
rg 'src/fetcher' packages/utils
rg 'ok: false|SharedApiErrorEnvelope' packages/http
```

### Documentation before PR

- `packages/http/AGENTS.md` — **Client / server / build matrix**, xpertell mapping, `createBareFetcher`, anti-patterns (singleton on server).
- `packages/utils/AGENTS.md` — remove fetcher.
- Root `AGENTS.md` — add `@packages/http`.

---

## Phase 2 — `@packages/nestjs-sdk` + integration contract (PR2)

**Goal:** Mutators use `@packages/http`; document how a future **`AuthSession`** (SDK) composes with client provider exactly like xpertell.

**Hard constraints:**

- **Client mutator** → default `fetcher` from `@packages/http` (expects app to wrap with `FetcherSettingsProvider`).
- **Server mutator** → `createServerClient(ctx)` factory; no refresh in default server settings.
- **Must** document `createBareFetcher` usage for generated `authRefresh` when auth endpoints exist.
- **Must not** implement full `AuthSession` in PR2 unless auth endpoints already generated (otherwise doc + stub types only).

### Server mutator (PR2)

```ts
import {
  createFetcher,
  type FetcherRuntimeContext,
  type Client,
} from "@packages/http";
import { serverBaseSettings } from "./fetcher.settings.server";

export function createServerClient(
  ctx: FetcherRuntimeContext,
): Client {
  return createFetcher(serverBaseSettings, { ...ctx, mode: "server" });
}

// Optional: anonymous / health
export const publicServerClient = createFetcher(serverBaseSettings, {
  mode: "static",
});
```

Generated call site:

```ts
await tenantsControllerListTenants({
  client: createServerClient({
    mode: "server",
    getAccessToken: () => session.getAccessToken(),
    getRequestHeaders: () => ({ "x-tenant-id": session.tenantId }),
  }),
});
```

### Client mutator (PR2)

```ts
import fetcher from "@packages/http";
export { fetcher as client, fetcher as default };
// App must mount FetcherSettingsProvider before hooks run.
```

### Future SDK auth module (document in PR2, implement when OpenAPI has auth)

Place **`AuthSession` + `AuthProvider`** in `@packages/nestjs-sdk/features/auth` (mirrors xpertell):

- `refreshToken()` → `authRefresh({ client: createBareFetcher(fetcherSettings) })`
- `refreshCoordination` → pass to app `FetcherSettingsProvider` config
- **Not imported** from server components

### Verification (phase 2 gate)

```bash
cd packages/nestjs-sdk && bun run generate
cd packages/nestjs-sdk && bun run typecheck
bun run overall
```

```bash
rg 'customFetch' packages/nestjs-sdk/src/mutator.server.ts
```

### Documentation before PR

- `packages/nestjs-sdk/AGENTS.md` — client provider setup, `createServerClient`, `createBareFetcher` + auth refresh
- `packages/http/AGENTS.md` — link from SDK

---

## What stays out of scope

- Full `AuthSession` implementation until auth Kubb endpoints exist in monobun (PR2 documents contract only if endpoints missing).
- Next.js `getServerApiClient()` helper (apps use `createServerClient` inline).
- HttpOnly refresh on server / BFF refresh route implementation.
- Cookie-forward as default server auth (bearer-from-session only per earlier decision; headers via `getRequestHeaders` if needed).
- TanStack Query migration from SWR in nestjs-sdk.
- Nest API schema changes.

---

## Suggested PR sequence

| PR | Content | Merge gate |
|----|---------|------------|
| PR1 | `@packages/http` + runtime modes + `createBareFetcher` + flat errors | Phase 1 verify |
| PR2 | nestjs-sdk mutators + auth integration guide | Phase 2 verify |

---

## Risk summary

| Risk | Mitigation |
|------|------------|
| Server uses client singleton | AGENTS + grep; test server mode isolation |
| `attachAccessToken` on server calls `authSession` (window/cookies) | Server context only; document forbidden imports in server mutator |
| Refresh recursion on `authRefresh` | `createBareFetcher` + test |
| Rich headers lost on server | `getRequestHeaders` on context |
| Build-time authenticated pages | `mode: 'static'` + env token documented |
| xpertell parity regression | AGENTS mapping table; optional port AuthSession in follow-up initiative |

---

## Follow-up initiative (not in PR1/2)

**`@packages/nestjs-sdk/features/auth`** — Port `AuthSession` + `AuthProvider` from xpertell when Nest auth OpenAPI lands; wire `ApiSdkProvider` example in `apps/nextjs` or external admin UI repo.

---

## Planning gate

**Plan:** `.cursor/plans/fetcher-server-refactor.plan.md`  
**Phases:** 2 (PR1 → PR2)  
**Phase 1 gate:** `cd packages/http && bun test && bun run overall`  
**Key addition:** Three runtimes (client / server / static); client xpertell pattern preserved; `createBareFetcher` for refresh-only.  
**Proceed with Phase 1?** (reply **execute** or adjust)
