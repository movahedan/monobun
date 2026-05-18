# AGENTS.md

**@packages/nestjs-sdk** — Kubb-generated client from `@apps/nestjs` OpenAPI.

## Source of truth

`src/openapi.yaml` is written by `@apps/nestjs` (`swagger.setup.ts` in development). Do not hand-edit generated files under `src/gen/`.

## Regenerate

```bash
# After API DTO or route changes:
cd apps/nestjs && bun run build && NODE_ENV=development bun dist/index.js --emit-openapi
cd ../../packages/nestjs-sdk && bun run kubb
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
| `@packages/nestjs-sdk/mutator.client` | Browser/server fetch + SWR helpers |
| `@packages/nestjs-sdk/mutator.server` | `client()` for Kubb server plugin |

Set `NESTJS_API_URL` (default `http://localhost:3006`) for mutators.

## List responses

List endpoints return `{ list, pageInfo }`. Example fetcher for an external `useList` hook:

```typescript
import { tenantsControllerListTenants } from "@packages/nestjs-sdk/server";

export const fetchTenants = (params, tenantId: string) =>
  tenantsControllerListTenants(params, { headers: { "x-tenant-id": tenantId } }).then(
    (res) => res.list,
  );
```

Errors throw the `ApiError` body shape from the API.
