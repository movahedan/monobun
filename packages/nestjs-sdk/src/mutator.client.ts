import useSWR, { type SWRConfiguration } from "swr";

import { customFetch } from "./mutator.server";

export const swrFetcher = <TData>(url: string): Promise<TData> => customFetch<TData>(url);

export const swrConfig: SWRConfiguration = {
	fetcher: swrFetcher,
	revalidateOnFocus: true,
	revalidateOnReconnect: true,
};

export function useSWRWithConfig<TData>(
	key: string | null,
	config?: SWRConfiguration,
): ReturnType<typeof useSWR<TData>> {
	return useSWR<TData>(key, { ...swrConfig, ...config });
}

export type { RequestConfig, ResponseErrorConfig } from "./mutator.server";
export { client, client as fetch, customFetch, default } from "./mutator.server";
