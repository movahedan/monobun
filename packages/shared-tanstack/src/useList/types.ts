import type { ParsedUrlQueryInput } from "./queryTypes.js";

export type SharedPageInfoOffset = {
	readonly offset?: number;
	readonly limit?: number;
	readonly hasMore?: boolean;
};

export type ListFetcherParamsBase = ParsedUrlQueryInput & {
	readonly page?: number;
	readonly limit?: number;
};

export type ListFetcher<TParams extends ListFetcherParamsBase, TResponse> = (
	params: TParams & {
		readonly signal?: AbortSignal;
	},
) => Promise<TResponse>;

export type PaginationMeta = {
	readonly total?: number;
	readonly pageInfo?: SharedPageInfoOffset;
	readonly page?: number;
	readonly hasMore: boolean;
};

export type ListState<TValues extends ParsedUrlQueryInput = ParsedUrlQueryInput> = TValues;

export function stableStringify(value: unknown): string {
	if (value == null || typeof value !== "object") {
		return JSON.stringify(value);
	}

	if (Array.isArray(value)) {
		return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
	}

	const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) =>
		left.localeCompare(right),
	);
	const body = entries
		.map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
		.join(",");
	return `{${body}}`;
}

export function valuesEqual(left: unknown, right: unknown): boolean {
	return stableStringify(left) === stableStringify(right);
}
