export type FetcherRuntimeMode = "server" | "static";

export type FetcherRuntimeContext = {
	readonly mode: FetcherRuntimeMode;
	readonly getAccessToken?: () => Promise<string | undefined>;
	readonly getRequestHeaders?: () => Promise<Record<string, string>>;
	readonly signal?: AbortSignal;
};

export function isRuntimeContext(
	runtimeContext: FetcherRuntimeContext | undefined,
): runtimeContext is FetcherRuntimeContext {
	return runtimeContext !== undefined;
}
