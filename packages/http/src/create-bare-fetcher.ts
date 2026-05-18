import { createFetcher } from "./fetcher/fetcher";
import type { FetcherSettings } from "./fetcher/settings";
import type { Client } from "./kubb-client";

/**
 * Refresh-only Kubb client: strips `refreshConfig` and `attachAccessToken` so
 * `authRefresh` cannot recurse into proactive refresh or bearer attachment.
 */
export function createBareFetcher(settings: FetcherSettings): Client {
	const bare = settings.merge({
		config: {
			refreshConfig: {
				refresh: async () => undefined,
				shouldRefresh: () => false,
			},
			attachAccessToken: (options) => options,
		},
	});
	return createFetcher(bare);
}
