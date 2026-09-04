import { afterEach, describe, expect, it, mock } from "bun:test";

import type { baseFetch } from "#base-fetch.js";
import { createBareFetcher } from "./create-bare-fetcher";
import { FetcherSettings } from "./fetcher/settings";
import type { RequestOptions } from "./fetcher/types";

const emptyCallbacks = {
	beforeRequest: [],
	afterResponse: [],
	afterError: [],
} as const;

describe("createBareFetcher", () => {
	afterEach(() => {
		mock.restore();
	});

	it("does not invoke parent attachAccessToken on transport", async () => {
		const parentAttachAccessToken = mock(async (options: RequestOptions) => ({
			...options,
			headers: { ...options.headers, Authorization: "Bearer parent-token" },
		}));

		let authorizationAtExecute: string | undefined;
		const execute = mock(async (options: { readonly headers?: Record<string, string> }) => {
			authorizationAtExecute = options.headers?.Authorization;
			return { status: 200, data: { ok: true }, statusText: "OK", headers: new Headers() };
		}) as typeof baseFetch;

		const settings = new FetcherSettings({
			config: {
				execute,
				attachAccessToken: parentAttachAccessToken,
				refreshConfig: {
					refresh: async () => undefined,
					shouldRefresh: () => true,
				},
			},
			callbacks: emptyCallbacks,
		});

		const bareClient = createBareFetcher(settings);
		await bareClient({ url: "/api/auth/refresh", method: "POST" });

		expect(parentAttachAccessToken).not.toHaveBeenCalled();
		expect(authorizationAtExecute).toBeUndefined();
	});
});
