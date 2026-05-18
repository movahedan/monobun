import type { ApiError, ApiFieldErrorRow } from "../api-error";
import type { Client, RequestConfig, RequestCredentials } from "../kubb-client";

export type { ApiError, ApiFieldErrorRow };

export type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";

export interface RequestOptions {
	readonly baseURL?: string;
	readonly url: string;
	readonly method: RequestMethod;
	readonly credentials?: RequestCredentials;
	readonly signal?: AbortSignal;
	readonly data?: unknown;
	readonly params?: Record<string, string | number | boolean | null | undefined>;
	readonly headers?: Record<string, string>;
	readonly dontCache?: boolean;
	readonly refreshed?: boolean;
	readonly skipDedupe?: boolean;
}

export interface RequestExecutionOptions extends RequestOptions {
	readonly key: string;
}

export interface RefreshCoordination {
	readonly isRefreshInFlight: () => boolean;
	readonly waitForRefresh: () => Promise<void>;
}

export interface RefreshConfig {
	readonly refresh?: () => Promise<void>;
	readonly shouldRefresh?: (options: RequestOptions) => boolean;
	readonly refreshCoordination?: RefreshCoordination;
}

export type AttachAccessToken = (
	options: RequestOptions,
) => Promise<RequestOptions> | RequestOptions;

export type BeforeRequestCallback = <TVariables = unknown>(
	request: RequestConfig<TVariables>,
) => Promise<RequestConfig<TVariables>> | RequestConfig<TVariables>;

export type AfterResponseCallback = <
	TData = unknown,
	TError = unknown,
	TVariables = unknown,
>(input: {
	readonly request: RequestConfig<TVariables>;
	readonly response?: TData;
	readonly error?: TError;
}) =>
	| Promise<{ readonly response?: TData; readonly error?: TError }>
	| { readonly response?: TData; readonly error?: TError };

export type AfterErrorCallback = <TError = unknown, TVariables = unknown>(input: {
	readonly request: RequestConfig<TVariables>;
	readonly error: TError;
}) => Promise<{ readonly error?: unknown }> | { readonly error?: unknown };

export interface FetcherCallbacks {
	readonly beforeRequest: readonly BeforeRequestCallback[];
	readonly afterResponse: readonly AfterResponseCallback[];
	readonly afterError: readonly AfterErrorCallback[];
}

export interface FetcherSettingsConfig {
	readonly baseRequestConfig?: Partial<RequestConfig>;
	readonly execute?: Client;
	readonly refreshConfig?: RefreshConfig;
	readonly attachAccessToken?: AttachAccessToken;
}

export type FetcherPlainMergeInput = {
	readonly config?: Partial<FetcherSettingsConfig>;
	readonly callbacks?: Partial<FetcherCallbacks>;
};

export type FetcherSettingsRootApplyInput = FetcherPlainMergeInput & {
	readonly mode?: "merge" | "replace";
};

export type HttpResponseErrorConfig<TError = unknown> = {
	readonly status: number;
	readonly message: string;
	readonly data: TError;
	readonly response?: unknown;
};

/** Thrown by the default fetcher after {@link normalizeFetcherError}. */
export type UnifiedFetcherFailure = ApiError;

export type ResponseErrorConfig<_TError = unknown> = UnifiedFetcherFailure;
