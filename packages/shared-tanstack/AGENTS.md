# AGENTS.md

Guidance for **@packages/shared-tanstack** — TanStack Router, Query, Form, and Virtual list helpers for admin-style UIs.

Depends on **@packages/shared-react** (`useDebouncedCallback`).

## Commands

```bash
bun run typecheck --filter=@packages/shared-tanstack
```

## Exports

| Import | Role |
|--------|------|
| `@packages/shared-tanstack` | Full barrel |
| `@packages/shared-tanstack/useList` | List hooks only |

### List + URL + form

- `useList` — infinite query, URL search params, TanStack Form filter draft (`state[0]` form API, `state[1]` effective values)
- `useListQuery`, `useListQueryParams`, `useListFormState` — lower-level pieces

### Virtual window list

- `useVirtualList` — `useList` + window virtualizer + load-more-on-scroll
- `VirtualList` / `VirtualFeedList` — component; pass `queryKey`, `fetcher`, `getItemKey`, `renderItem`

Scroll snapshot helpers: `loadVirtualScrollSnapshot`, `saveVirtualScrollSnapshot`, etc. (from `useVirtualList.utils`).

## Usage

```typescript
import { useVirtualList, VirtualList } from "@packages/shared-tanstack";

const { list, state, pagination, virtual } = useVirtualList(queryKey, fetcher, {
  queryParamsKeys: ["q"],
  defaultValues: { q: "" },
  getItemKey: (item) => item.id,
  scrollCacheKey: pathname,
});

const [form, effectiveValues] = state;
```

Apps must provide TanStack Router (`useNavigate`, `useSearch`) where `useListQueryParams` is used.

Peer dependency: `react` ^19.
