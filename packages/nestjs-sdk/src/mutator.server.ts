import { log } from "@packages/utils/logger";

export interface RequestConfig<TRequest = unknown> {
	readonly method?: string;
	readonly url?: string;
	readonly params?: Record<string, unknown>;
	readonly headers?: Record<string, string>;
	readonly data?: TRequest;
}

export type ResponseErrorConfig<TError = unknown> = TError;

function getApiBaseUrl(): string {
	const raw = (process.env.NESTJS_API_URL ?? process.env.API_BASE_URL ?? "").trim();
	if (/^https?:\/\//i.test(raw)) return raw.replace(/\/$/, "");
	return `http://localhost:${process.env.NESTJS_PORT ?? "3006"}`;
}

export async function customFetch<TData>(url: string, options?: RequestInit): Promise<TData> {
	const baseUrl = getApiBaseUrl();
	const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

	const response = await fetch(fullUrl, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
	});

	const body = (await response.json().catch(() => ({
		message: `HTTP ${response.status}: ${response.statusText}`,
	}))) as TData & { message?: string };

	if (!response.ok) {
		log(`API error ${response.status} ${fullUrl}`);
		throw body;
	}

	return body as TData;
}

export const client = async <TData, _TError = unknown, TRequest = unknown>(config: {
	method: string;
	url: string;
	params?: Record<string, unknown>;
	headers?: Record<string, string>;
	data?: TRequest;
}): Promise<{ data: TData }> => {
	const { method, url, params, headers, data } = config;

	let fullUrl = url;
	if (params) {
		const search = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null) search.set(key, String(value));
		}
		const qs = search.toString();
		if (qs) fullUrl += `?${qs}`;
	}

	const options: RequestInit = { method, headers };
	if (data && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
		options.body = JSON.stringify(data);
	}

	const responseData = await customFetch<TData>(fullUrl, options);
	return { data: responseData };
};

export default client;
export { client as fetch };
