import { defaultFetcherSettingsInput, FetcherSettings } from "@packages/http";

function getApiBaseUrl(): string {
	const raw = (process.env.NESTJS_API_URL ?? process.env.API_BASE_URL ?? "").trim();
	if (/^https?:\/\//i.test(raw)) {
		return raw.replace(/\/$/, "");
	}
	return `http://localhost:${process.env.NESTJS_PORT ?? "3006"}`;
}

export const serverBaseSettings = new FetcherSettings({
	config: {
		...defaultFetcherSettingsInput.config,
		baseRequestConfig: {
			...defaultFetcherSettingsInput.config?.baseRequestConfig,
			baseURL: getApiBaseUrl(),
		},
	},
	callbacks: defaultFetcherSettingsInput.callbacks,
});
