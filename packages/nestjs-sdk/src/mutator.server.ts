import {
	type Client,
	createFetcher,
	type FetcherRuntimeContext,
	type RequestConfig,
} from "@packages/http";

import { serverBaseSettings } from "./fetcher.settings.server";

export type { Client, RequestConfig, ResponseConfig, ResponseErrorConfig } from "@packages/http";

export function createServerClient(ctx: FetcherRuntimeContext): Client {
	return createFetcher(serverBaseSettings, { ...ctx, mode: "server" });
}

/** Anonymous / health / build-time calls without per-request context. */
export const publicServerClient = createFetcher(serverBaseSettings, { mode: "static" });

export const client = publicServerClient;
export default client;
export { client as fetch };

/**
 * Legacy SWR URL fetcher — prefer generated operations + {@link publicServerClient}.
 */
export async function customFetch<TData>(url: string, options?: RequestInit): Promise<TData> {
	const method = (options?.method ?? "GET").toUpperCase() as RequestConfig["method"];
	const headers: Record<string, string> = {};
	if (options?.headers) {
		new Headers(options.headers).forEach((value, key) => {
			headers[key] = value;
		});
	}

	let data: unknown;
	if (options?.body) {
		data = typeof options.body === "string" ? JSON.parse(options.body) : options.body;
	}

	const response = await publicServerClient<TData>({
		url,
		method,
		headers,
		...(data !== undefined ? { data } : {}),
	});

	return response.data;
}
