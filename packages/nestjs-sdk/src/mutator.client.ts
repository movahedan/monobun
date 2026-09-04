import useSWR, { type SWRConfiguration } from "swr";

import { fetcher } from "@packages/http";

export type { Client, RequestConfig, ResponseConfig, ResponseErrorConfig } from "@packages/http";

export const swrFetcher = <TData>(url: string): Promise<TData> =>
	fetcher<TData>({ url, method: "GET" }).then((response) => response.data);

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

export const client = fetcher;
export default fetcher;
export { client as fetch, fetcher as customFetch };
