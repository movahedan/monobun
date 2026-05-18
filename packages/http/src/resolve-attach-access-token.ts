import type { FetcherSettings } from "./fetcher/settings";
import type { AttachAccessToken } from "./fetcher/types";
import type { FetcherRuntimeContext } from "./runtime-context";

export function resolveAttachAccessToken(
	settings: FetcherSettings,
	runtimeContext?: FetcherRuntimeContext,
): AttachAccessToken {
	const base = settings.resolveTransport().attachAccessToken;

	if (runtimeContext === undefined) {
		return base;
	}

	return async (options) => {
		const next = await base(options);
		const headers: Record<string, string> = { ...(next.headers ?? {}) };

		if (runtimeContext.getAccessToken) {
			const token = await runtimeContext.getAccessToken();
			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}
		}

		if (runtimeContext.getRequestHeaders) {
			Object.assign(headers, await runtimeContext.getRequestHeaders());
		}

		return { ...next, headers };
	};
}
