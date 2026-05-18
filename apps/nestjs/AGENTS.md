# AGENTS.md

Guidance for **@apps/nestjs** — multi-tenant feature flags control-plane API (NestJS 11, OpenAPI, Zod).

## Overview

- **Port:** 3006 (`NESTJS_PORT`)
- **Prefix:** `/api` (e.g. `GET /api/v1/health`, `GET /api/v1/tenants`)
- **Infra alias:** `GET /status` (no `/api` prefix)
- **Swagger UI:** `/api/docs` · **OpenAPI JSON:** `/api/docs-json`
- **Auth:** Bearer JWT from `@apps/auth` (`JwtAuthGuard` + `@RequireScopes()`). Dev fallback: `x-tenant-id` when `AUTH_ALLOW_HEADER_TENANT=true`.

## API contract (OpenAPI)

| Shape | JSON |
|-------|------|
| List success | `{ list: T[], pageInfo: { currentPage, totalPages, totalItems, pageSize } }` |
| Non-list success | Resource schema at root (no envelope) |
| Error (4xx/5xx) | `{ message?: string, fields?: { field, message }[] }` |

Shared DTOs live under `src/common/api/`. Domain modules add `*ListResponseDto` types that compose `PageInfoDto` + item DTOs.

## Essential commands

```bash
bun run dev              # watch + serve (emits openapi.yaml in development)
bun run build            # tsup → dist/
bun run start            # production entry
bun run typecheck
bun test                 # run from this directory (see bunfig.toml)
bun run openapi:emit     # build + write packages/nestjs-sdk/src/openapi.yaml
```

## OpenAPI → @packages/nestjs-sdk

On dev boot (or `openapi:emit`), `src/swagger.setup.ts` writes `packages/nestjs-sdk/src/openapi.yaml` and runs `bun run kubb` in that package when the spec changes.

```bash
cd apps/nestjs && bun run build && NODE_ENV=development bun dist/index.js --emit-openapi
cd ../../packages/nestjs-sdk && bun run kubb
```

## Docker

```bash
bun run container up -- --profile nestjs   # postgres + @apps/nestjs
curl -sf http://localhost:3006/status
```

Requires `DATABASE_URL` in `.env` (see `.env.sample`) for Phase 2+; Phase 1 routes work without DB.

## Layout

```
apps/nestjs/src/
  common/api/       # PageInfo, ApiError, ListQuery, OpenAPI helpers
  common/guards/    # JwtAuthGuard, ScopesGuard, TenantGuard (legacy header)
  health/           # Health checks
  tenants/          # Stub list endpoint (Phase 1)
  swagger.setup.ts
  index.ts
```
