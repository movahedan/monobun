"use client";

import { useNavigate, useSearch } from "@tanstack/react-router";
import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo } from "react";

import type { ParsedUrlQueryInput } from "./queryTypes";
import { stableStringify } from "./types";

function scrollResetSearchChanged(
	prev: Record<string, unknown>,
	next: Record<string, unknown>,
	keys: readonly string[],
): boolean {
	return keys.some((key) => stableStringify(prev[key]) !== stableStringify(next[key]));
}

export type ListQueryParamCodec<TValue> = {
	readonly parse: (value: string | Array<string> | undefined) => TValue | undefined;
	readonly serialize: (value: TValue | undefined) => string | Array<string> | undefined;
};

export type ListQueryParamCodecs<TValues extends ParsedUrlQueryInput> = Partial<{
	[TKey in keyof TValues]: ListQueryParamCodec<TValues[TKey]>;
}>;

/** Map TanStack Router's parsed `match.search` into the shape expected by codecs / list helpers. */
function routerSearchToParsedUrlQueryInput(search: Record<string, unknown>): ParsedUrlQueryInput {
	const result: ParsedUrlQueryInput = {};

	for (const [key, raw] of Object.entries(search)) {
		if (raw === undefined) continue;

		if (Array.isArray(raw)) {
			result[key] = raw.map((item) => item as string | number | boolean);
			continue;
		}

		if (raw === null) {
			result[key] = null;
			continue;
		}

		if (key.endsWith("[]") && typeof raw === "string") {
			result[key] = [raw];
			continue;
		}

		result[key] = raw as string | number | boolean;
	}

	return result;
}

const applyCodecsOnRead = <TValues extends ParsedUrlQueryInput = ParsedUrlQueryInput>(
	searchParams: ParsedUrlQueryInput,
	codecs?: ListQueryParamCodecs<TValues>,
): ParsedUrlQueryInput => {
	if (codecs == null) {
		return searchParams;
	}

	const nextValues: ParsedUrlQueryInput = { ...searchParams };
	for (const [key, codec] of Object.entries(codecs)) {
		if (codec == null) continue;

		const rawValue = nextValues[key];
		const decodedValue = codec.parse(
			rawValue == null
				? undefined
				: Array.isArray(rawValue)
					? rawValue.map((item) => String(item))
					: String(rawValue),
		);
		if (decodedValue == null) {
			delete nextValues[key];
			continue;
		}

		nextValues[key] = decodedValue;
	}

	return nextValues;
};

const applyCodecsOnWrite = <TValues extends ParsedUrlQueryInput = ParsedUrlQueryInput>(
	searchParams: ParsedUrlQueryInput,
	codecs?: ListQueryParamCodecs<TValues>,
): ParsedUrlQueryInput => {
	if (codecs == null) {
		return searchParams;
	}

	const nextValues: ParsedUrlQueryInput = {};
	for (const [key, value] of Object.entries(searchParams)) {
		const codec = codecs[key as keyof TValues];
		if (codec == null) {
			nextValues[key] = value;
			continue;
		}

		const serializedValue = codec.serialize(value as TValues[keyof TValues] | undefined);
		if (serializedValue == null) continue;

		nextValues[key] = serializedValue;
	}

	return nextValues;
};

const getScopedSearchParams = <TValues extends ParsedUrlQueryInput = ParsedUrlQueryInput>(
	searchParams: TValues,
	keys: (keyof TValues)[],
): Partial<TValues> => {
	return Object.fromEntries(
		Object.entries(searchParams).filter(([key]) => keys.includes(key as keyof TValues)),
	) as Partial<TValues>;
};
const normalizeToKnownKeys = <TValues extends ParsedUrlQueryInput = ParsedUrlQueryInput>(
	searchParams: ParsedUrlQueryInput,
	keys: (keyof TValues)[],
): Partial<TValues> => {
	const knownKeys = new Set(keys.map((key) => String(key)));
	const result: ParsedUrlQueryInput = {};

	for (const [key, value] of Object.entries(searchParams)) {
		const normalizedKey = !knownKeys.has(key) && knownKeys.has(`${key}[]`) ? `${key}[]` : key;
		if (!knownKeys.has(normalizedKey)) continue;

		result[normalizedKey] = value;
	}

	return result as Partial<TValues>;
};
const removeDefaultValues = <TValues extends ParsedUrlQueryInput = ParsedUrlQueryInput>(
	searchParams: TValues,
	defaultValues?: TValues,
) => {
	return Object.fromEntries(
		Object.entries(searchParams).filter(([key, value]) => defaultValues?.[key] !== value),
	) as TValues;
};

export function useListQueryParams<TValues extends ParsedUrlQueryInput = ParsedUrlQueryInput>(
	keys?: (keyof TValues)[],
	defaultValues?: {
		[key in keyof TValues]?: TValues[key];
	},
	codecs?: ListQueryParamCodecs<TValues>,
	scrollResetSearchKeys?: readonly string[],
) {
	const navigate = useNavigate();
	const routerSearch = useSearch({
		strict: false,
	}) as Record<string, unknown>;

	const parsedSearch = useMemo(
		() => routerSearchToParsedUrlQueryInput(routerSearch),
		[routerSearch],
	);

	const scopedSearchParams = useMemo(
		() =>
			getScopedSearchParams(
				{
					...(defaultValues ?? {}),
					...normalizeToKnownKeys<TValues>(
						applyCodecsOnRead<TValues>(parsedSearch, codecs),
						keys ?? [],
					),
				} as TValues,
				keys ?? [],
			),
		[parsedSearch, defaultValues, keys, codecs],
	);

	const replaceUrl = useCallback(
		(values: Partial<TValues> | undefined) => {
			if (values == null) return;

			const prevInput = routerSearchToParsedUrlQueryInput(routerSearch);
			const nextValues = removeDefaultValues(
				{
					...normalizeToKnownKeys<TValues>(
						applyCodecsOnRead<TValues>(prevInput, codecs),
						keys ?? [],
					),
					...normalizeToKnownKeys<TValues>(values as ParsedUrlQueryInput, keys ?? []),
				} as TValues,
				defaultValues,
			);
			const nextSearch = applyCodecsOnWrite<TValues>(nextValues, codecs) as Record<string, unknown>;
			const resetScroll =
				scrollResetSearchKeys == null
					? undefined
					: scrollResetSearchChanged(
							applyCodecsOnRead<TValues>(prevInput, codecs) as Record<string, unknown>,
							nextValues as Record<string, unknown>,
							scrollResetSearchKeys,
						);

			void navigate({
				replace: true,
				to: ".",
				resetScroll,
				search: nextSearch,
			});
		},
		[keys, defaultValues, codecs, navigate, routerSearch, scrollResetSearchKeys],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: mount-only URL normalization
	useEffect(() => {
		if (!keys) return;
		replaceUrl(scopedSearchParams);
	}, []);

	const setParams = useCallback<Dispatch<SetStateAction<Partial<TValues>>>>(
		(values) => replaceUrl(typeof values === "function" ? values(scopedSearchParams) : values),
		[scopedSearchParams, replaceUrl],
	);

	const clearParams = useCallback(() => {
		replaceUrl(defaultValues);
	}, [defaultValues, replaceUrl]);

	return [scopedSearchParams, setParams, clearParams] as [
		Partial<TValues>,
		Dispatch<SetStateAction<Partial<TValues>>>,
		() => void,
	];
}
