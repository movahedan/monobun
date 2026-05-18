import { describe, expect, it } from "bun:test";

import type { Client } from "../kubb-client";
import { FetcherSettings } from "./settings";
import { defaultFetcherSettingsInput } from "./settings.default";

describe("defaultFetcherSettingsInput", () => {
	it("applies JSON content type for non-FormData bodies", async () => {
		const settings = new FetcherSettings(defaultFetcherSettingsInput);
		const { request } = await settings.prepareRequest({
			url: "/api/items",
			method: "POST",
			data: { name: "item" },
		});

		expect(request.headers).toMatchObject({
			"Content-Type": "application/json;charset=UTF-8",
		});
	});

	it("throws flat ApiError from afterError chain", async () => {
		const settings = new FetcherSettings(defaultFetcherSettingsInput);
		const execute = (async () => ({
			status: 400,
			data: { message: "Bad request" },
			statusText: "Bad Request",
			headers: new Headers(),
		})) as Client;

		settings.setSettings({
			config: { execute },
		});

		await expect(
			settings.afterError(
				{ url: "/api/items", method: "GET" },
				{
					status: 400,
					data: { message: "Bad request" },
				},
			),
		).rejects.toEqual({
			message: "Bad request",
			details: expect.objectContaining({ httpStatus: 400 }),
		});
	});
});
