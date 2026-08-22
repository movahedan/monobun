import {
	type Client,
	createFetcher,
	type FetcherRuntimeContext,
	type RequestConfig,
	type ResponseErrorConfig,
} from "@packages/http";

import { serverBaseSettings } from "./fetcher.settings.server";

export type { RequestConfig, ResponseErrorConfig };

/** Per-request Kubb client (RSC, route handlers, jobs). Refresh and dedupe are disabled. */
export function createServerClient(ctx: FetcherRuntimeContext): Client {
	return createFetcher(serverBaseSettings, { ...ctx, mode: "server" });
}

/** Anonymous or build-time calls (health, public data). */
export const publicServerClient = createFetcher(serverBaseSettings, { mode: "static" });

export const client = publicServerClient;
export { client as fetch };
export default client;
