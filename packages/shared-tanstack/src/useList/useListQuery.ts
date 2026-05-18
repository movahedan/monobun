import { type QueryKey, useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { type ListFetcher, type ListFetcherParamsBase, stableStringify } from "./types";

type ListQueryOptions = {
	readonly prefix?: string;
	readonly limit?: number;
	readonly enabled?: boolean;
};

type InfinitePage<TItem> = {
	readonly list: TItem[];
	readonly page?: number;
};

export function useListQuery<TParams extends ListFetcherParamsBase, TItem>(
	queryKey: QueryKey,
	fetcher: ListFetcher<TParams, TItem[]>,
	params: TParams,
	options?: ListQueryOptions,
) {
	const { limit = 15, enabled = true } = options ?? {};
	const initialPage = params.page ?? 1;
	const paramsKey = useMemo(() => stableStringify(params), [params]);

	const query = useInfiniteQuery({
		// Prefix with spread Kubb `*QueryKey(...)` so `invalidateQueries({ queryKey: sameFactory(...) })` matches list + `useQuery`.
		queryKey: [...queryKey, paramsKey, limit],
		enabled,
		initialPageParam: initialPage,
		queryFn: async ({ pageParam }) =>
			({
				list: await fetcher({ ...params, page: pageParam ?? initialPage, limit }),
				page: pageParam ?? initialPage,
			}) satisfies InfinitePage<TItem>,
		getNextPageParam: (lastPage) =>
			lastPage.list.length === 0 ? undefined : (lastPage.page ?? initialPage) + 1,
	});

	const list = useMemo(() => query.data?.pages?.flatMap((page) => page.list) ?? [], [query.data]);
	const isPending = query.isPending;
	const getMore = useCallback(() => {
		if (query.isFetchingNextPage || !query.hasNextPage) return;
		void query.fetchNextPage();
	}, [query.fetchNextPage, query.hasNextPage, query.isFetchingNextPage]);

	return [list, isPending, getMore, query] as [Array<TItem>, boolean, () => void, typeof query];
}
