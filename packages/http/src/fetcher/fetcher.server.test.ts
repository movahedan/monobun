import { afterEach, describe, expect, it, mock } from "bun:test";

import type { Client } from "../kubb-client";
import { createFetcher } from "./fetcher";
import { FetcherSettings } from "./settings";

const emptyCallbacks = {
	beforeRequest: [],
	afterResponse: [],
	afterError: [],
} as const;

const serverContext = { mode: "server" as const };

describe("createFetcher - server mode", () => {
	afterEach(() => {
		mock.restore();
	});

	it("does not share in-flight dedupe between parallel instances", async () => {
		let executeCalls = 0;
		const execute = mock(async () => {
			executeCalls += 1;
			await new Promise((resolve) => setTimeout(resolve, 5));
			return { status: 200, data: { ok: true }, statusText: "OK", headers: new Headers() };
		}) as Client;

		const settings = new FetcherSettings({
			config: { execute },
			callbacks: emptyCallbacks,
		});

		const clientA = createFetcher(settings, serverContext);
		const clientB = createFetcher(settings, serverContext);

		await Promise.all([
			clientA({ url: "/api/shared-path", method: "GET" }),
			clientB({ url: "/api/shared-path", method: "GET" }),
		]);

		expect(executeCalls).toBe(2);
	});

	it("does not call refresh on 401", async () => {
		const refresh = mock(async () => undefined);
		const execute = mock(async () => ({
			status: 401,
			data: { message: "Unauthorized" },
			statusText: "Unauthorized",
			headers: new Headers(),
		})) as Client;

		const settings = new FetcherSettings({
			config: {
				execute,
				refreshConfig: {
					refresh,
					shouldRefresh: () => true,
				},
			},
			callbacks: emptyCallbacks,
		});

		const client = createFetcher(settings, serverContext);

		await expect(client({ url: "/api/protected", method: "GET" })).rejects.toMatchObject({
			status: 401,
		});

		expect(refresh).not.toHaveBeenCalled();
	});
});
