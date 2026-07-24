import useSWR, { type SWRConfiguration } from "swr";

import fetcher, {
	fetcherSettings,
	type RequestConfig,
	type ResponseConfig,
	type ResponseErrorConfig,
} from "@packages/http";

import { getNestjsApiBaseUrl } from "./fetcher.settings.shared";

fetcherSettings.setSettings({
	mode: "merge",
	config: {
		baseRequestConfig: {
			baseURL: getNestjsApiBaseUrl(),
		},
	},
});

export const swrFetcher = <TData>(url: string): Promise<TData> =>
	fetcher<TData>({ method: "GET", url }).then((res: ResponseConfig<TData>) => res.data);

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

export type { RequestConfig, ResponseErrorConfig };
export { fetcher as client, fetcher as fetch, fetcher as default };
