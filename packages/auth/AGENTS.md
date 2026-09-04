# AGENTS.md

**@packages/auth** — browser auth session + React provider for `@apps/auth`, plus shared scopes / JWT claim types.

## Exports

| Import | Contents |
|--------|----------|
| `@packages/auth` | `AuthSession`, `authSession`, `restore()`, `createAuthFetcherBindings`, login/refresh helpers, contract re-exports |
| `@packages/auth/contract` | Scopes / JWT claim types only (server-safe; prefer this from Nest / auth service) |
| `@packages/auth/react` | `AuthProvider` (calls `restore()` on mount), `useAuth` (`isReady` / `status`) |

**Not included:** `FetcherSettingsProvider` — compose that in the app with `@packages/http/react`.

## Contract (`src/contract/`)

- `SCOPES` / `Scope` — `feature-flags:admin` | `write` | `read`
- `ROLE_SCOPES` — scopes per tenant role (`owner`, `admin`, `member`)
- `hasScope(granted, required)` — hierarchy: `admin` → `write` → `read`

## Session model

- **Access JWT** — memory only (Bearer).
- **Session / refresh** — cookies; SPA cold load runs **one** `restore()` → `POST /refresh` + `auth.me`.
- Login-time storage strategy (cookie vs memory trade-offs) is a later config knob.

## App wiring

```tsx
import { authSession, createAuthFetcherBindings } from "@packages/auth";
import { AuthProvider, useAuth } from "@packages/auth/react";
import { FetcherSettingsProvider } from "@packages/http/react";

const authFetch = createAuthFetcherBindings(authSession);

function Shell() {
  const { isReady, isAuthenticated } = useAuth();
  if (!isReady) return null; // or spinner
  return isAuthenticated ? <App /> : <Login />;
}

<AuthProvider>
  <FetcherSettingsProvider
    initialSettings={{
      config: {
        baseRequestConfig: { baseURL: nestBaseUrl },
        ...authFetch,
      },
    }}
  >
    <Shell />
  </FetcherSettingsProvider>
</AuthProvider>
```

Proxy `/auth` → `@apps/auth` (:3007) so cookies + tRPC stay same-origin.

## Commands

```bash
bun run typecheck
bun test
```

## Related

- [`@apps/auth`](../../apps/auth/AGENTS.md) — JWT / refresh / login service
- [`@packages/http`](../http/AGENTS.md) — fetcher runtimes
