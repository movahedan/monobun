import { afterEach, describe, expect, it, mock } from "bun:test";

import { baseFetch } from "./base-fetch";

describe("baseFetch", () => {
	afterEach(() => {
		mock.restore();
	});

	it("joins baseURL and path with query params", async () => {
		const fetchMock = mock(async () =>
			Promise.resolve(
				new Response(JSON.stringify({ ok: true }), {
					status: 200,
					statusText: "OK",
					headers: { "Content-Type": "application/json" },
				}),
			),
		);
		globalThis.fetch = fetchMock as unknown as typeof fetch;

		const result = await baseFetch({
			baseURL: "https://api.example.com",
			url: "/v1/items",
			method: "GET",
			params: { page: 2, tag: null },
		});

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const firstCall = fetchMock.mock.calls[0];
		expect(firstCall).toBeDefined();
		const [url, init] = firstCall as unknown as [string, RequestInit];
		expect(url).toBe("https://api.example.com/v1/items?page=2&tag=null");
		expect(init.method).toBe("GET");
		expect(result.status).toBe(200);
		expect(result.data).toEqual({ ok: true });
	});

	it("returns empty data for 204 responses", async () => {
		globalThis.fetch = mock(async () =>
			Promise.resolve(new Response(null, { status: 204, statusText: "No Content" })),
		) as unknown as typeof fetch;

		const result = await baseFetch({ url: "https://api.example.com/no-content", method: "DELETE" });

		expect(result.status).toBe(204);
		expect(result.data).toEqual({});
	});

	it("does not throw on 4xx — returns status and body", async () => {
		globalThis.fetch = mock(async () =>
			Promise.resolve(
				new Response(JSON.stringify({ message: "nope" }), {
					status: 404,
					statusText: "Not Found",
				}),
			),
		) as unknown as typeof fetch;

		const result = await baseFetch({ url: "https://api.example.com/missing", method: "GET" });

		expect(result.status).toBe(404);
		expect(result.data).toEqual({ message: "nope" });
	});
});
