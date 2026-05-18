import { describe, expect, it } from "bun:test";

import type { Client } from "../kubb-client";
import { createFetcher } from "./fetcher";
import { FetcherSettings } from "./settings";

const emptyCallbacks = {
	beforeRequest: [],
	afterResponse: [],
	afterError: [],
} as const;

describe("createFetcher - client mode", () => {
	it("awaits refresh coordination when refresh is in flight", async () => {
		let resolveRefresh: () => void = () => undefined;
		const refreshWait = new Promise<void>((resolve) => {
			resolveRefresh = resolve;
		});

		let refreshInFlight = true;
		let waitForRefreshCalls = 0;
		const refreshCoordination = {
			isRefreshInFlight: () => refreshInFlight,
			waitForRefresh: () => {
				waitForRefreshCalls += 1;
				refreshInFlight = false;
				return refreshWait;
			},
		};

		let executeStarted = false;
		const execute = (async () => {
			executeStarted = true;
			return { status: 200, data: { ok: true }, statusText: "OK", headers: new Headers() };
		}) as Client;

		const settings = new FetcherSettings({
			config: {
				execute,
				refreshConfig: {
					shouldRefresh: () => true,
					refresh: async () => undefined,
					refreshCoordination,
				},
			},
			callbacks: emptyCallbacks,
		});

		const client = createFetcher(settings);
		const requestPromise = client({ url: "/api/coordination", method: "POST" });

		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(waitForRefreshCalls).toBe(1);
		expect(executeStarted).toBe(false);

		resolveRefresh();
		await requestPromise;

		expect(executeStarted).toBe(true);
	});
});
