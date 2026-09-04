/**
 * Kubb-compatible fetch transport (types duplicated from @kubb/plugin-client 4.8.x).
 * Non-throwing on HTTP error status — {@link createFetcher} maps 4xx/5xx to thrown errors.
 */

export type RequestCredentials = "omit" | "same-origin" | "include";

export type RequestConfig<TData = unknown> = {
	readonly baseURL?: string;
	readonly url?: string;
	readonly method?: "GET" | "PUT" | "PATCH" | "POST" | "DELETE" | "OPTIONS" | "HEAD";
	readonly params?: unknown;
	readonly data?: TData | FormData;
	readonly responseType?: "arraybuffer" | "blob" | "document" | "json" | "text" | "stream";
	readonly signal?: AbortSignal;
	readonly headers?: [string, string][] | Record<string, string>;
	readonly credentials?: RequestCredentials;
};

export type ResponseConfig<TData = unknown> = {
	readonly data: TData;
	readonly status: number;
	readonly statusText: string;
	readonly headers: Headers;
};

/** Kubb-shaped client — type params are per call (`request<TData, TError, TVariables>(…)`). */
export type Client = <TData, _TError = unknown, TVariables = unknown>(
	paramsConfig: RequestConfig<TVariables>,
) => Promise<ResponseConfig<TData>>;

function headersToRecord(headers: RequestConfig["headers"] | undefined): Record<string, string> {
	if (headers === undefined) {
		return {};
	}
	if (Array.isArray(headers)) {
		return Object.fromEntries(headers);
	}
	return { ...headers };
}

const mergeHeaders = (
	globalHeaders: RequestConfig["headers"] | undefined,
	paramsHeaders: RequestConfig["headers"] | undefined,
): Record<string, string> => ({
	...headersToRecord(globalHeaders),
	...headersToRecord(paramsHeaders),
});

const appendQueryParams = (targetUrl: string, params: unknown): string => {
	if (!params || typeof params !== "object") {
		return targetUrl;
	}
	const normalizedParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
		if (value === undefined) {
			continue;
		}
		normalizedParams.append(key, value === null ? "null" : String(value));
	}
	const qs = normalizedParams.toString();
	return qs ? `${targetUrl}?${qs}` : targetUrl;
};

/**
 * Default HTTP execute: `fetch` + JSON parse. Does not throw on 4xx/5xx.
 */
export const baseFetch = async <TData, _TError = unknown, TVariables = unknown>(
	paramsConfig: RequestConfig<TVariables>,
): Promise<ResponseConfig<TData>> => {
	const config = {
		...paramsConfig,
		headers: mergeHeaders(undefined, paramsConfig.headers),
	};

	let targetUrl = [config.baseURL, config.url].filter(Boolean).join("");
	targetUrl = appendQueryParams(targetUrl, config.params);

	const response = await fetch(targetUrl, {
		credentials: config.credentials ?? "same-origin",
		method: config.method?.toUpperCase(),
		body: config.data instanceof FormData ? config.data : JSON.stringify(config.data),
		signal: config.signal,
		headers: config.headers,
	});

	const data =
		[204, 205, 304].includes(response.status) || !response.body ? {} : await response.json();

	return {
		data: data as TData,
		status: response.status,
		statusText: response.statusText,
		headers: response.headers,
	};
};
