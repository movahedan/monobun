import type { Client, RequestConfig, ResponseConfig } from "../kubb-client";
import { createFetcher } from "./fetcher";
import { fetcherSettings } from "./singleton";

const fetcher: Client = async <TData, TError = unknown, TVariables = unknown>(
	requestConfig: RequestConfig<TVariables>,
): Promise<ResponseConfig<TData>> => {
	return await createFetcher(fetcherSettings)<TData, TError, TVariables>(requestConfig);
};

export type { ApiError, ApiFieldErrorRow } from "../api-error";
export {
	getFetcherErrorMessage,
	getUnifiedErrorHttpStatus,
	isResponseError,
	isUnifiedFetcherFailure,
	normalizeFetcherError,
	parseApiErrorEnvelope,
} from "./errorHandling";
export { createFetcher } from "./fetcher";
export { FetcherSettings } from "./settings";
export { defaultFetcherSettingsInput } from "./settings.default";
export { fetcherSettings } from "./singleton";
export type * from "./types";

export type { Client, RequestConfig, ResponseConfig };

export default fetcher;
