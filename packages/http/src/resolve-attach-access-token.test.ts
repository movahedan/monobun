import { describe, expect, it } from "bun:test";

import { FetcherSettings } from "./fetcher/settings";
import { resolveAttachAccessToken } from "./resolve-attach-access-token";

const emptyCallbacks = {
	beforeRequest: [],
	afterResponse: [],
	afterError: [],
} as const;

describe("resolveAttachAccessToken", () => {
	it("composes bearer token and request headers in server context", async () => {
		const settings = new FetcherSettings({
			config: {
				attachAccessToken: async (options) => ({
					...options,
					headers: { ...(options.headers ?? {}), "X-App": "client" },
				}),
			},
			callbacks: emptyCallbacks,
		});

		const attach = resolveAttachAccessToken(settings, {
			mode: "server",
			getAccessToken: async () => "server-token",
			getRequestHeaders: async () => ({ "x-tenant-id": "t-1" }),
		});

		const result = await attach({
			url: "/api/me",
			method: "GET",
		});

		expect(result.headers).toEqual({
			"X-App": "client",
			Authorization: "Bearer server-token",
			"x-tenant-id": "t-1",
		});
	});
});
