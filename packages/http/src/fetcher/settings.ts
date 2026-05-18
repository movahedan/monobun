import { baseFetch, type Client, type RequestConfig, type ResponseConfig } from "../kubb-client";
import { defaultFetcherSettingsInput } from "./settings.default";
import { callbacksUtils, requestConfigUtils, runners, settingsUtils } from "./settings.utils";
import type {
	AttachAccessToken,
	FetcherCallbacks,
	FetcherPlainMergeInput,
	FetcherSettingsConfig,
	FetcherSettingsRootApplyInput,
	RefreshCoordination,
	RequestOptions,
} from "./types";

const EMPTY_CONFIG: FetcherSettingsConfig = {};

export type ResolvedFetcherTransport = {
	readonly baseRequestConfig: Partial<RequestConfig> | undefined;
	readonly execute: Client;
	readonly attachAccessToken: AttachAccessToken;
	readonly refreshConfig: {
		readonly refresh: () => Promise<void>;
		readonly shouldRefresh: (options: RequestOptions) => boolean;
		readonly refreshCoordination: RefreshCoordination | undefined;
	};
};

/** Config + callbacks + merge only. No HTTP client. */
export class FetcherSettings {
	#settingsConfig: FetcherSettingsConfig;
	#callbacks: FetcherCallbacks;
	#mutationGeneration = 0;

	constructor(init?: FetcherPlainMergeInput) {
		this.#settingsConfig = settingsUtils.merge(
			settingsUtils.merge(EMPTY_CONFIG, defaultFetcherSettingsInput.config ?? {}),
			init?.config ?? {},
		);
		this.#callbacks = callbacksUtils.resolve(
			defaultFetcherSettingsInput.callbacks as FetcherCallbacks,
			init?.callbacks,
		);
	}

	get settingsConfig(): Readonly<FetcherSettingsConfig> {
		return this.#settingsConfig;
	}

	get callbacks(): Readonly<FetcherCallbacks> {
		return this.#callbacks;
	}

	get mutationGeneration(): number {
		return this.#mutationGeneration;
	}

	/** Defaults + config fields used by the transport layer. */
	resolveTransport(): ResolvedFetcherTransport {
		const refreshConfig = this.#settingsConfig.refreshConfig;
		return {
			baseRequestConfig: this.#settingsConfig.baseRequestConfig,
			execute: this.#settingsConfig.execute ?? baseFetch,
			attachAccessToken: this.#settingsConfig.attachAccessToken ?? ((options) => options),
			refreshConfig: {
				refresh: refreshConfig?.refresh ?? (async () => undefined),
				shouldRefresh: refreshConfig?.shouldRefresh ?? ((_options: RequestOptions) => false),
				refreshCoordination: refreshConfig?.refreshCoordination,
			},
		};
	}

	/** Base merge → beforeRequest chain → wire-shaped {@link RequestOptions}. */
	async prepareRequest<TVariables>(requestConfig: RequestConfig<TVariables>): Promise<{
		readonly request: RequestConfig<TVariables>;
		readonly options: RequestOptions;
	}> {
		const baseMerged = requestConfigUtils.merge(
			this.#settingsConfig.baseRequestConfig,
			requestConfig,
		);
		const request = await runners.beforeRequest<TVariables>(
			this.#callbacks.beforeRequest,
			baseMerged,
		);
		const options = requestConfigUtils.toRequestOptions(request);
		return { request, options };
	}

	async afterError<TData, TError, TVariables>(
		request: RequestConfig<TVariables>,
		error: TError,
	): Promise<ResponseConfig<TData>> {
		const handled = await runners.afterError<TError, TVariables>(
			this.#callbacks.afterError,
			request,
			error,
		);
		if (handled !== error) {
			return { error: handled } as unknown as ResponseConfig<TData>;
		}
		throw handled;
	}

	merge(scope: FetcherSettings | FetcherPlainMergeInput): FetcherSettings {
		if (scope instanceof FetcherSettings) {
			return FetcherSettings.#fromResolved(
				settingsUtils.merge(this.#settingsConfig, scope.#settingsConfig),
				callbacksUtils.concat(this.#callbacks, scope.#callbacks),
			);
		}
		return FetcherSettings.#fromResolved(
			settingsUtils.merge(this.#settingsConfig, scope.config ?? {}),
			callbacksUtils.concat(this.#callbacks, scope.callbacks),
		);
	}

	setSettings(input: FetcherSettingsRootApplyInput): void {
		const mode = input.mode ?? "merge";
		if (mode === "replace") {
			this.#settingsConfig = settingsUtils.merge(
				settingsUtils.merge(EMPTY_CONFIG, defaultFetcherSettingsInput.config ?? {}),
				input.config ?? {},
			);
			this.#callbacks = callbacksUtils.resolve(
				defaultFetcherSettingsInput.callbacks as FetcherCallbacks,
				input.callbacks,
			);
		} else {
			this.#settingsConfig = settingsUtils.merge(this.#settingsConfig, input.config ?? {});
			this.#callbacks = callbacksUtils.concat(this.#callbacks, input.callbacks);
		}
		this.#mutationGeneration += 1;
	}

	static #fromResolved(
		settingsConfig: FetcherSettingsConfig,
		callbacks: FetcherCallbacks,
	): FetcherSettings {
		const next = new FetcherSettings();
		next.#settingsConfig = settingsConfig;
		next.#callbacks = callbacks;
		return next;
	}
}
