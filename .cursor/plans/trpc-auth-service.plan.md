---
name: tRPC auth service
overview: "Milestone 1: @packages/auth-contract + @apps/auth (human JWT, POST /api/refresh, POST /api/token M2M in PR2, scopes admin|write|read). PR3 login UI. PR4 Nest JWT guard. Eval app out of scope."
todos:
  - id: phase-1-scaffold
    content: "PR1: auth-contract + apps/auth canonical layout, Prisma migrate, Bun.serve stubs, SSR/action spike"
    status: pending
  - id: phase-1-verify
    content: "PR1 gate: turbo build/typecheck, db:migrate, container profile auth, curl status/login/api stubs, overall"
    status: pending
  - id: phase-1-docs
    content: "PR1 docs: apps/auth AGENTS, auth-contract AGENTS, root AGENTS row :3007, CHEATSHEET auth profile"
    status: pending
  - id: phase-2-core
    content: "PR2: trpc/auth procedures, server actions wrappers, /api/refresh, /api/token M2M, JWKS, seed, tests"
    status: pending
  - id: phase-2-verify
    content: "PR2 gate: bun test apps/auth, seed, overall"
    status: pending
  - id: phase-2-docs
    content: "PR2 docs: apps/auth README (JWT, /api/*, refresh, token, product flows, Nest verify)"
    status: pending
  - id: phase-3-ui
    content: "PR3: SSR login/logout pages, CSRF, compose healthcheck, manual smoke"
    status: pending
  - id: phase-3-verify
    content: "PR3 gate: manual login + refresh + overall"
    status: pending
  - id: phase-3-docs
    content: "PR3 docs: README browser flow, CHEATSHEET seed creds"
    status: pending
  - id: phase-4-nest
    content: "PR4 (follow-up): Nest JwtAuthGuard + ScopesGuard, AUTH_* env, deprecate header-trust in prod"
    status: pending
isProject: false
---

# tRPC-auth microservice (finalized)

**Status:** Ready for implementation — Milestone 1 = PR1 + PR2 + PR3.

**Related:** [nestjs-feature-flags-control-plane.plan.md](nestjs-feature-flags-control-plane.plan.md) (management API :3006; Phase 4 here wires JWT guard).

---

## Planning gate (execute PR1 first)

```text
Plan:     .cursor/plans/trpc-auth-service.plan.md
Milestone 1: PR1 scaffold → PR2 auth core → PR3 login UI
PR1 gate:  bun install && turbo build/typecheck (auth workspaces)
           cd apps/auth && bun run db:migrate
           bun run container up -- --profile auth
           curl :3007/status, :3007/login, POST /api/refresh, POST /api/token (non-404)
           bun run overall
Assumptions: Bun 1.3.x; port 3007 free; Postgres profile auth; Prisma schema at src/prisma/
Deferred:    eval service app only (M2M token endpoint ships in M1 PR2), magic link, OIDC, client_secret grant
M1 includes: POST /api/token (M2M), MachineClient seed, m2m tests
Proceed with PR1 unless you say otherwise.
```

---

## Product flows (final)

| Actor | Auth | Scopes (via role) | Calls |
|--------|------|-------------------|--------|
| **Tenant admin / owner** | Human login @ auth | `feature-flags:admin`, `feature-flags:write`, `feature-flags:read` | **Nest** management API |
| **Tenant member** | Human login | `feature-flags:read` | Read/eval paths only (not Nest admin CRUD) |
| **Nest (no user)** | **M2M** `POST /api/token` (**Milestone 1 PR2**) | `feature-flags:read` (seed client) | Nest or future eval when resolving flag values |
| **App BFF** | User session → user's JWT | User's scopes | Same APIs as browser |

**Scopes (only these three):** `feature-flags:admin` · `feature-flags:write` · `feature-flags:read` — no `feature-flags:evaluate`.

**Management:** JWT `aud=monobun-api` → Nest (Phase 4 guard checks scope per route). **M2M is in milestone 1** (not deferred): working `/api/token` + tests in **PR2**.

```mermaid
flowchart LR
  auth[@apps/auth :3007]
  nest[Nest :3006]
  auth -->|JWKS| nest
  Admin -->|JWT admin write read| nest
  Member -->|JWT read| nest
  Nest -->|M2M JWT read via api/token| auth
  Nest -->|Bearer| nest
```

---

## Finalized defaults (was open questions)

| Topic | Decision |
|-------|----------|
| Eval `aud` (machine) | `AUTH_AUDIENCE_EVAL` env, default **`monobun-eval`** |
| Human `aud` | `AUTH_AUDIENCE`, default **`monobun-api`** |
| Member scopes | **`feature-flags:read` only** |
| Machine JWT `tid` | **Omitted**; tenant/project on downstream API params |
| Scope hierarchy | **`admin` → satisfies `write` and `read`**; **`write` → satisfies `read`** (implement in `@packages/auth-contract` `hasScope()`) |
| `auth.refresh` on tRPC `/api` | **Optional**; HTTP `POST /api/refresh` is primary for browsers |
| Magic link / email | **v1.1** |
| Access JWT TTL | `AUTH_ACCESS_TTL_SECONDS` default **900** (15m) |
| Refresh rotation | **Yes** — new refresh hash on each `/api/refresh` |

### `ROLE_SCOPES` (`@packages/auth-contract`)

| Role | Scopes emitted on JWT |
|------|------------------------|
| `owner` | `feature-flags:admin`, `feature-flags:write`, `feature-flags:read` |
| `admin` | `feature-flags:admin`, `feature-flags:write`, `feature-flags:read` |
| `member` | `feature-flags:read` |

### Scope constants (exhaustive list)

| Scope | Meaning |
|-------|---------|
| `feature-flags:admin` | Tenant-level management (projects, environments, members, destructive ops) |
| `feature-flags:write` | Create/update/delete flags and targeting rules |
| `feature-flags:read` | Read flag values and metadata; **M2M default** for Nest fetching flag state |

**Nest route mapping (Phase 4):** e.g. CRUD flags → `write` or `admin`; list/read → `read`; tenant admin UI → `admin`. Use `hasScope()` with hierarchy above.

---

## Design decisions (locked)

| Topic | Decision |
|-------|----------|
| JWT v1 | RS256 + `GET /.well-known/jwks.json`; opaque refresh in DB |
| Browser | httpOnly session + refresh cookies; access JWT for `Authorization: Bearer` |
| Tenant | `tid` claim; `auth.switchTenant`; Nest Phase 4 reads from JWT only |
| App stack | **Bun.serve** + **Bun bundler**; logic in **`src/trpc/`**; SSR in **`src/pages/`** |
| M2M (**Milestone 1 PR2**) | Private-key client assertion → **`POST /api/token`**; seeded `MachineClient`; tests + README; Nest caches JWT until `exp` |
| API paths | tRPC at **`/api`** (not `/api/trpc`); **`POST /api/refresh`**; **`POST /api/token`** registered **before** `/api/*` |
| Excluded | Next, Vite, TanStack Start, `@apps/vite-spa`, `src/actions/`, `src/server/`, app-root `prisma/` |

---

## Workspace map

| Path | Name | Port |
|------|------|------|
| `apps/auth` | `@apps/auth` | **3007** (`AUTH_PORT`) |
| `packages/auth-contract` | `@packages/auth-contract` | — |
| `apps/nestjs` | `@apps/nestjs` | 3006 (JWT guard Phase 4) |

**Env (auth)** — document in `apps/auth/.env.sample` and root `.env.sample`:

| Variable | Purpose |
|----------|---------|
| `AUTH_PORT` | 3007 |
| `AUTH_ISSUER` | JWT `iss` (e.g. `http://localhost:3007`) |
| `AUTH_AUDIENCE` | Human/mgmt JWT `aud` (`monobun-api`) |
| `AUTH_AUDIENCE_EVAL` | Optional separate `aud` for machine JWTs (default `monobun-eval`); same scopes (`read`) |
| `AUTH_DATABASE_URL` | `postgresql://…/monobun_auth` |
| `AUTH_ACCESS_TTL_SECONDS` | Access JWT lifetime |
| `AUTH_COOKIE_*` | Session/refresh cookie names, secure flags |
| `AUTH_JWT_PRIVATE_KEY` / `AUTH_JWT_PUBLIC_KEY` | Signing (dev PEM paths; prod env) |

**Nest (Phase 4):** `AUTH_ISSUER`, `AUTH_JWKS_URL`, `AUTH_AUDIENCE`, `AUTH_ALLOW_HEADER_TENANT=false`.

---

## Repository layout (canonical)

```
apps/auth/
  package.json
  src/
    index.ts
    db.ts
    prisma/
      schema.prisma
      migrations/
      prisma.config.ts
    utils/
      render-page.tsx
    pages/
      login.tsx
      logout.tsx
    trpc/
      init.ts
      context.ts
      router.ts
      handler.ts
      caller.ts
      auth/
        router.ts
        actions.ts      # 'use server'
        refresh.ts
        token.ts        # /api/token HTTP
        m2m.ts
        session.ts
        password.ts
        jwt.ts
        keys.ts
        csrf.ts
    __tests__/
  scripts/
    seed.ts
packages/auth-contract/
  src/scopes.ts          # SCOPES.admin | .write | .read only
  src/jwt-claims.ts
  src/role-scopes.ts     # ROLE_SCOPES + hasScope(required)
  src/index.ts
```

### Prisma models

- `User` — email, passwordHash, emailVerifiedAt, timestamps
- `Tenant` — name, slug
- `TenantMember` — userId, tenantId, role (`owner` | `admin` | `member`)
- `Session` — userId, refreshTokenHash, expiresAt, activeTenantId, revokedAt
- `MachineClient` — clientId, name, publicKeyJwk, allowedScopes[], revokedAt

### `Bun.serve` route order in `index.ts`

1. `GET /status`
2. `GET /.well-known/jwks.json`
3. `POST /api/refresh`
4. `POST /api/token`
5. `GET /login`, `GET /logout` (SSR)
6. `/api/*` → tRPC handler (`endpoint: '/api'`)
7. Server action POST (framework/bundler)

---

## Machine-to-machine (**Milestone 1 — PR2 required**)

Not a future phase. **PR2 must ship:**

- `POST /api/token` — client_credentials + JWT bearer client assertion (RFC 7523)
- `MachineClient` row + seed: `nestjs-control-plane`, `allowedScopes: ['feature-flags:read']`
- `src/__tests__/m2m-token.test.ts` — sign assertion → token → verify JWT scopes/aud
- README: Nest env + in-memory cache until `exp`, then re-assert

Response access JWT: `scopes` ⊆ client allow-list; `sub` = `clientId`; `tid` omitted; `aud` = `AUTH_AUDIENCE_EVAL` or `AUTH_AUDIENCE` per env.

---

## Phase 1 — PR1: Scaffold + spike

**Goal:** Workspaces compile; DB migrates; server boots; route stubs; SSR placeholder; noop server action.

**Must:** Canonical layout; `MachineClient` in schema; stub `/api`, `/api/refresh`, `/api/token`; tRPC at `/api`; spike SSR + `trpc/auth/actions.ts` noop.

**Must not:** Real auth; Nest changes; Next/Vite.

### Scouts (builder)

| Scout | Patterns |
|-------|----------|
| Compose | `rg 'NESTJS_PORT|profiles' docker-compose.dev.yml .env.sample` |
| Turbo | `rg '@apps/' package.json turbo.json` |
| Nest guard | `rg 'TenantGuard|x-tenant-id' apps/nestjs/src` |

### Verification

```bash
bun install
bun run turbo run build typecheck --filter=@packages/auth-contract --filter=@apps/auth
cd apps/auth && bun run db:migrate
bun run container up -- --profile auth
curl -sf http://localhost:3007/status
curl -sf http://localhost:3007/login | head
curl -sf -o /dev/null -w "%{http_code}" -X POST http://localhost:3007/api/refresh
curl -sf -o /dev/null -w "%{http_code}" -X POST http://localhost:3007/api/token
bun run overall
```

### Documentation before PR

- `apps/auth/AGENTS.md`, `packages/auth-contract/AGENTS.md`
- Root `AGENTS.md` — `@apps/auth` :3007
- `docs/CHEATSHEET.md` — `bun run container up -- --profile auth`

---

## Phase 2 — PR2: Auth core + M2M + tests

**Goal:** Human auth complete via tRPC + actions; `/api/refresh`; `/api/token` (M2M); JWKS; seed user + machine client; tests.

**Procedures:** `auth.login`, `logout`, `me`, `switchTenant` (optional `auth.refresh` → `refresh.ts`).

**Must:** Single logic path — actions call `createCaller`; rate-limited login; generic errors; no secrets in logs.

**Must (M2M):** Full `/api/token` implementation + seed machine client + `m2m-token.test.ts` (not stub).

### Verification

```bash
cd apps/auth && bun run db:seed
bun test apps/auth/src/__tests__
# M2M smoke (README documents full curl):
# POST /api/token with client_assertion → access_token with feature-flags:read
bun run overall
```

### Documentation before PR

- `apps/auth/README.md` — product flows, JWT claims, `ROLE_SCOPES`, curl examples, Nest + eval contracts

---

## Phase 3 — PR3: Login UI + CSRF

**Goal:** SSR `/login`, `/logout`; forms → `trpc/auth/actions`; CSRF; compose healthcheck.

### Verification

```bash
bun run container up -- --profile auth
# Manual: GET /login → POST → cookies; POST /api/refresh; POST /api/token (M2M) per README
bun run overall
```

### Documentation before PR

- `apps/auth/README.md` — browser flow, cookies, CSRF
- `docs/CHEATSHEET.md` — seed admin email/password via env

---

## Phase 4 — PR4: Nest JWT guard (post–milestone 1)

**Goal:** `@apps/nestjs` validates human JWTs on management routes.

**Must:**

- `JwtAuthGuard` + `@RequireScopes()` per route (`admin` / `write` / `read` via `hasScope` hierarchy)
- `request.tenantId` ← `tid`, `request.actorId` ← `sub`
- `jose` + `AUTH_JWKS_URL` / `AUTH_ISSUER` / `AUTH_AUDIENCE`
- `x-tenant-id` only if `NODE_ENV=development` && `AUTH_ALLOW_HEADER_TENANT=true`
- supertest: valid token, wrong scope, expired token

**Must not:** Duplicate auth DB in Nest.

### Verification

```bash
# Login at auth → Bearer to Nest
bun test apps/nestjs/src/__tests__/auth-guard.test.ts
bun run overall
```

### Documentation before PR

- `apps/nestjs/AGENTS.md` — auth env, scope requirements
- `apps/auth/README.md` — cross-link Nest setup

---

## Out of scope

- Eval/data-plane **application**
- Magic link, email verification send, OIDC provider, `client_secret` M2M
- M2M key admin UI (seed/env only)
- Token revocation / introspection
- OpenAPI for auth (tRPC + `auth-contract` types)

---

## PR sequence

| PR | Deliverable | Gate |
|----|-------------|------|
| **PR1** | Scaffold + contract + Prisma + compose + spike | Phase 1 verify |
| **PR2** | Auth + refresh + **M2M /api/token** + JWKS + seed + tests (human + m2m) | Phase 2 verify + overall |
| **PR3** | Login/logout SSR + CSRF | Phase 3 verify + manual smoke |
| **PR4** | Nest JWT guard | Phase 4 verify |

---

## Risk summary

| Risk | Mitigation |
|------|------------|
| Route shadowing under `/api/*` | Fixed route order in `index.ts` |
| Logic outside `trpc/` | `rg 'prisma' apps/auth/src/pages` empty in CI |
| Bun server actions | PR1 spike; actions colocated in `trpc/auth/actions.ts` |
| Wrong scope on route | `hasScope` hierarchy; tests per scope; M2M limited to `read` on seed client |
| Tenant IDs on machine JWT | Omitted by default; explicit eval API params |

---

## Dependency policy

- `@packages/auth-contract` — no app deps
- `@apps/auth` → `auth-contract`, `@packages/utils` (logger)
- `@apps/nestjs` → `auth-contract` + `jose` (Phase 4 only)
- No `@apps/auth` import in Nest
