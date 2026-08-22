# AGENTS.md

**@packages/nestjs-sdk** — Kubb-generated client from `@apps/nestjs` OpenAPI.

## Source of truth

`src/openapi.yaml` is written by `@apps/nestjs` (`swagger.setup.ts` in development). Do not hand-edit generated files under `src/gen/`.

## Regenerate

```bash
# After API DTO or route changes:
cd apps/nestjs && bun run build && NODE_ENV=development bun dist/index.js --emit-openapi
cd ../../packages/nestjs-sdk && bun run generate
bun run typecheck
```

## Exports

| Import | Contents |
|--------|----------|
| `@packages/nestjs-sdk` | Re-exports generated types |
| `@packages/nestjs-sdk/types` | TypeScript types per operation/schema |
| `@packages/nestjs-sdk/zod` | Zod schemas (grouped by OpenAPI tag) |
| `@packages/nestjs-sdk/hooks` | SWR hooks (client mutator) |
| `@packages/nestjs-sdk/server` | Fetch client (server mutator) |
| `@packages/nestjs-sdk/mutator.client` | Browser client + SWR helpers (`@packages/http`) |
| `@packages/nestjs-sdk/mutator.server` | `createServerClient`, `publicServerClient` |

Set `NESTJS_API_URL` (default `http://localhost:3006`) for mutators.

## Client (browser)

Wrap the app with [`FetcherSettingsProvider`](../../http/AGENTS.md) from `@packages/http/react` **before** using generated SWR hooks. The client mutator seeds `baseURL` from env; apps merge auth via `initialSettings` / `setSettings` (`refreshConfig`, `attachAccessToken`).

Generated hooks use the default `fetcher` singleton from `@packages/http`.

## Server (RSC, route handlers, jobs)

Do not use the client singleton. Use per-request clients:

```typescript
import { createServerClient } from "@packages/nestjs-sdk/mutator.server";
import { tenantsControllerListTenants } from "@packages/nestjs-sdk/server";

await tenantsControllerListTenants(headers, params, {
  client: createServerClient({
    mode: "server",
    getAccessToken: () => session.getAccessToken(),
    getRequestHeaders: () => ({ "x-tenant-id": session.tenantId }),
  }),
});
```

Health / anonymous calls can rely on the mutator default (`publicServerClient`, `mode: 'static'`) or pass headers only.

## Auth refresh (when OpenAPI has auth)

`authRefresh` must use **`createBareFetcher`** from `@packages/http` with the same base settings — never the main client (avoids refresh recursion). Future `AuthSession` lives under `features/auth` in this package; see [@packages/http/AGENTS.md](../http/AGENTS.md).

## List responses

List endpoints return `{ list, pageInfo }`. Example fetcher for an external `useList` hook:

```typescript
import { tenantsControllerListTenants } from "@packages/nestjs-sdk/server";

export const fetchTenants = (headers, params) =>
  tenantsControllerListTenants(headers, params).then((res) => res.list);
```

Errors throw flat `ApiError` from `@packages/http` (`message`, optional `fields`).
