import baseFetch from "@kubb/plugin-client/clients/fetch";

export type {
	RequestConfig,
	RequestCredentials,
	ResponseConfig,
} from "@kubb/plugin-client/clients/fetch";

/** Kubb-compatible fetch client (callable only; excludes `getConfig` / `setConfig` on the default export). */
export type Client = <TData, _TError = unknown, TVariables = unknown>(
	paramsConfig: import("@kubb/plugin-client/clients/fetch").RequestConfig<TVariables>,
) => Promise<import("@kubb/plugin-client/clients/fetch").ResponseConfig<TData>>;

export { baseFetch };
