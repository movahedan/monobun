# AGENTS.md

**@apps/auth** — authentication service (human JWT, refresh, M2M token).

## Overview

- **Port:** 3007 (`AUTH_PORT`)
- **Stack:** Bun.serve, tRPC at `/api`, Prisma (Postgres `monobun_auth`)
- **Contract:** `@packages/auth/contract`

## Routes (order matters)

| Route | Method |
|-------|--------|
| `/status` | GET |
| `/.well-known/jwks.json` | GET |
| `/api/refresh` | POST |
| `/api/token` | POST (M2M) |
| `/login`, `/logout` | GET/POST (SSR) |
| `/register` | GET/POST (SSR password sign-up) |
| `/otp`, `/otp/verify` | GET/POST (SSR email OTP; codes logged when `AUTH_OTP_LOG=true`) |
| `/api/*` | tRPC |

## Essential commands

```bash
bun run dev
bun run typecheck
bun test
bun run db:migrate
bun run db:seed
bun scripts/generate-dev-keys.ts   # dev PEM under dev-keys/
```

## Docker

```bash
bun run container compose -- --profile auth up -d postgres   # DB only (host-run auth)
# or full stack:
bun run container up -- --profile auth
curl -sf http://localhost:3007/status
```

Copy `apps/auth/.env.sample` → `apps/auth/.env` (required for host `bun run dev` — scripts load `--env-file=.env`). Root `.env` should also include `AUTH_DATABASE_URL` for compose. See [README.md](README.md) for JWT flows and Nest integration.

## Nest integration

- Human JWT `aud` = `AUTH_AUDIENCE` (`monobun-api`); Nest verifies via `AUTH_JWKS_URL` (see `apps/nestjs/AGENTS.md`).
- Seed demo tenant: `00000000-0000-4000-8000-000000000001` (slug `demo`) — same id as `@apps/nestjs` seed.
- M2M client `nestjs-control-plane` (`feature-flags:read`); machine JWT `aud` = `AUTH_AUDIENCE_EVAL` (`monobun-eval`).

## Layout

```
src/
  index.tsx          # Bun.serve entry
  prisma/            # schema + migrations
  trpc/              # routers, auth logic, actions
  pages/             # SSR login/logout
  __tests__/
scripts/             # seed, ensure-db, generate-dev-keys
```

Logic lives under `src/trpc/` — not in `pages/` (CI: no direct Prisma in pages).
