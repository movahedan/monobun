import { FetcherSettings } from "@packages/http";

import { getNestjsApiBaseUrl } from "./fetcher.settings.shared";

/** Server/static Kubb clients — no browser refresh or singleton WeakMap cache. */
export const serverBaseSettings = new FetcherSettings({
	config: {
		baseRequestConfig: {
			baseURL: getNestjsApiBaseUrl(),
		},
	},
});
