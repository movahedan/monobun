import type { RequestConfig } from "../kubb-client";
import type {
	AfterErrorCallback,
	AfterResponseCallback,
	AttachAccessToken,
	BeforeRequestCallback,
	FetcherCallbacks,
	FetcherSettingsConfig,
	RefreshConfig,
	RequestMethod,
	RequestOptions,
} from "./types";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date);

/** Kubb allows `headers` as a record or `[key, value][]`; `fetch` also accepts `Headers`. Normalize for merge + `toRequestOptions`. */
function headersToRecord(headers: RequestConfig["headers"] | undefined): Record<string, string> {
	if (headers === undefined || headers === null) {
		return {};
	}
	if (typeof Headers !== "undefined" && headers instanceof Headers) {
		const out: Record<string, string> = {};
		headers.forEach((value, key) => {
			out[key] = value;
		});
		return out;
	}
	if (Array.isArray(headers)) {
		const out: Record<string, string> = {};
		for (const row of headers) {
			if (Array.isArray(row) && row.length >= 2) {
				const [k, v] = row;
				if (typeof k === "string" && typeof v === "string") {
					out[k] = v;
				}
			}
		}
		return out;
	}
	if (typeof headers === "object") {
		const out: Record<string, string> = {};
		for (const [k, v] of Object.entries(headers as Record<string, unknown>)) {
			if (typeof v === "string") {
				out[k] = v;
			}
		}
		return out;
	}
	return {};
}

/** Deep-merge; arrays are concatenated. */
function deepMergeConcatArrays<T>(base: T, scope: T): T {
	if (scope === undefined || scope === null) return base;
	if (Array.isArray(base) && Array.isArray(scope)) return [...base, ...scope] as T;
	if (isPlainObject(base) && isPlainObject(scope)) {
		const out: Record<string, unknown> = { ...base };
		for (const key of Object.keys(scope)) {
			const s = scope[key];
			if (s === undefined) continue;
			const b = base[key];
			out[key] = deepMergeConcatArrays(b, s as never);
		}
		return out as T;
	}
	return scope;
}

/** Sequentially runs {@link FetcherCallbacks} chains (used by {@link FetcherSettings}). */
export const runners = {
	async beforeRequest<TVariables>(
		callbacks: readonly BeforeRequestCallback[],
		initialRequest: RequestConfig<TVariables>,
	): Promise<RequestConfig<TVariables>> {
		let request = initialRequest;
		for (const cb of callbacks) {
			request = await cb(request);
		}
		return request;
	},

	async afterResponse<TData, TError, TVariables>(
		callbacks: readonly AfterResponseCallback[],
		input: {
			readonly request: RequestConfig<TVariables>;
			readonly response?: TData;
			readonly error?: TError;
		},
	): Promise<{ readonly response?: TData; readonly error?: TError }> {
		let current: { readonly response?: TData; readonly error?: TError } = {};
		if (input.response !== undefined) {
			current = { ...input, ...current };
		}
		if (input.error !== undefined) {
			current = { ...input, ...current };
		}
		for (const cb of callbacks) {
			current = await cb({
				request: input.request,
				...current,
			});
		}
		return current;
	},

	async afterError<TError, TVariables>(
		callbacks: readonly AfterErrorCallback[],
		request: RequestConfig<TVariables>,
		initialError: TError,
	): Promise<TError> {
		let error = initialError;
		for (const cb of callbacks) {
			const out = await cb({ request, error });
			if (out.error !== undefined) {
				error = out.error as TError;
			}
		}
		return error;
	},
};

export const callbacksUtils = {
	/** Append callback lists: base first, then scope. */
	concat(base: FetcherCallbacks, scope: Partial<FetcherCallbacks> | undefined): FetcherCallbacks {
		if (!scope) {
			return base;
		}
		return {
			beforeRequest: [...base.beforeRequest, ...(scope.beforeRequest ?? [])],
			afterResponse: [...base.afterResponse, ...(scope.afterResponse ?? [])],
			afterError: [...base.afterError, ...(scope.afterError ?? [])],
		};
	},

	/** Resolve callbacks: merge per-channel arrays from `input` or `defaults`. */
	resolve(defaults: FetcherCallbacks, input?: Partial<FetcherCallbacks>): FetcherCallbacks {
		return {
			beforeRequest: [...(input?.beforeRequest ?? defaults.beforeRequest)],
			afterResponse: [...(input?.afterResponse ?? defaults.afterResponse)],
			afterError: [...(input?.afterError ?? defaults.afterError)],
		};
	},
};

export const settingsUtils = {
	/** Merge transport config (deep `baseRequestConfig`, shallow for execute/refresh/shouldRefresh). */
	merge(base: FetcherSettingsConfig, scope: Partial<FetcherSettingsConfig>): FetcherSettingsConfig {
		const baseRequestConfig = deepMergeConcatArrays(
			(base.baseRequestConfig ?? {}) as Record<string, unknown>,
			(scope.baseRequestConfig ?? {}) as Record<string, unknown>,
		) as Partial<RequestConfig>;

		let refreshConfig: RefreshConfig | undefined;
		if (base.refreshConfig !== undefined || scope.refreshConfig !== undefined) {
			const merged = deepMergeConcatArrays(
				(base.refreshConfig ?? {}) as Record<string, unknown>,
				(scope.refreshConfig ?? {}) as Record<string, unknown>,
			);
			refreshConfig =
				Object.keys(merged).length > 0 ? (merged as unknown as RefreshConfig) : undefined;
		}

		const execute = scope.execute ?? base.execute;
		const attachAccessToken: AttachAccessToken | undefined =
			scope.attachAccessToken ?? base.attachAccessToken;

		return {
			...(Object.keys(baseRequestConfig).length > 0 ? { baseRequestConfig } : {}),
			...(execute !== undefined ? { execute } : {}),
			...(refreshConfig !== undefined ? { refreshConfig } : {}),
			...(attachAccessToken !== undefined ? { attachAccessToken } : {}),
		} as FetcherSettingsConfig;
	},
};

export const requestConfigUtils = {
	merge<TVariables>(
		baseRequestConfig: Partial<RequestConfig> | undefined,
		requestConfig: RequestConfig<TVariables>,
	): RequestConfig<TVariables> {
		return {
			...baseRequestConfig,
			...requestConfig,
			headers: {
				...headersToRecord(baseRequestConfig?.headers),
				...headersToRecord(requestConfig.headers),
			},
		} as RequestConfig<TVariables>;
	},

	toRequestOptions(config: RequestConfig): RequestOptions {
		if (!config.url) {
			throw new Error("Generated endpoint URL is required");
		}
		const normalized = headersToRecord(config.headers);
		const headers = Object.keys(normalized).length > 0 ? normalized : undefined;
		return {
			...(config.baseURL !== undefined ? { baseURL: config.baseURL } : {}),
			method: requestConfigUtils.resolveMethod(config.method),
			url: config.url,
			...(config.credentials !== undefined ? { credentials: config.credentials } : {}),
			...(config.data !== undefined ? { data: config.data } : {}),
			...(config.params !== undefined
				? { params: config.params as Record<string, string | number | boolean | null | undefined> }
				: {}),
			...(headers !== undefined ? { headers } : {}),
			...(config.signal !== undefined ? { signal: config.signal } : {}),
		};
	},

	resolveMethod(method: string | undefined): RequestMethod {
		const resolvedMethod = (method ?? "GET").toUpperCase();
		if (
			resolvedMethod === "POST" ||
			resolvedMethod === "PUT" ||
			resolvedMethod === "PATCH" ||
			resolvedMethod === "DELETE" ||
			resolvedMethod === "OPTIONS" ||
			resolvedMethod === "HEAD"
		) {
			return resolvedMethod;
		}
		return "GET";
	},
};
