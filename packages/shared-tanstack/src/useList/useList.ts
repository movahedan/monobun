"use client";

import type { QueryKey } from "@tanstack/react-query";
import { useMemo } from "react";

import type { ListFetcher, ListFetcherParamsBase } from "./types";
import { useListFormState } from "./useListFormState";
import { useListQuery } from "./useListQuery";
import { type ListQueryParamCodecs, useListQueryParams } from "./useListQueryParams";

export type UseListOptions<TParams extends ListFetcherParamsBase> = {
	enabled?: boolean;
	prefix?: string;
	limit?: number;
	defaultValues?: TParams;
	queryParamsKeys?: (keyof TParams)[];
	queryParamCodecs?: ListQueryParamCodecs<TParams>;
	formMode?: "onchange" | "manual";
	params?: TParams;
	/** When set, `replace` navigations reset scroll only if these search fields change. */
	scrollResetSearchKeys?: readonly string[];
};

export function useList<TParams extends ListFetcherParamsBase, TItem>(
	queryKey: QueryKey,
	fetcher: ListFetcher<TParams, TItem[]>,
	{
		enabled = true,
		params: valuesParams,
		limit = 10,
		defaultValues = {} as TParams,
		queryParamsKeys,
		queryParamCodecs,
		formMode = "onchange",
		scrollResetSearchKeys,
	}: UseListOptions<TParams> = {},
) {
	const resolvedDefaultValues = useMemo(
		() => ({ page: 1, limit: limit ?? 10, ...defaultValues }) as TParams,
		[defaultValues, limit],
	);
	const resolvedParams = useMemo(
		() => ({ ...(resolvedDefaultValues ?? {}), ...valuesParams }) as TParams,
		[resolvedDefaultValues, valuesParams],
	);

	const [queryParams, setQueryParams] = useListQueryParams<TParams>(
		queryParamsKeys,
		resolvedDefaultValues,
		queryParamCodecs,
		scrollResetSearchKeys,
	);

	const formState = useListFormState<TParams>(
		queryParamsKeys ? queryParams : resolvedDefaultValues,
		queryParamsKeys ? (values) => setQueryParams(values) : undefined,
		{ mode: formMode ?? "onchange" },
	);

	const params: TParams = valuesParams ? resolvedParams : formState[1];
	const options: Parameters<typeof useListQuery<TParams, TItem>>[3] = { limit, enabled };
	const [list, isPending, getMore, query] = useListQuery<TParams, TItem>(
		queryKey,
		fetcher,
		params,
		options,
	);

	return {
		list: [list, isPending, getMore, query] as const,
		state: formState,
		pagination: {
			hasNextPage: query.hasNextPage,
			isFetchingNextPage: query.isFetchingNextPage,
			fetchNextPage: query.fetchNextPage,
		},
	};
}
