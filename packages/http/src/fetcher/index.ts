import type { Client } from "../base-fetch";
import { createFetcher } from "./fetcher";
import { fetcherSettings } from "./singleton";

const fetcher: Client = createFetcher(fetcherSettings);

export type { ApiError, ApiFieldErrorRow } from "../api-error";
export type { Client, RequestConfig, ResponseConfig } from "../base-fetch";
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

export default fetcher;
