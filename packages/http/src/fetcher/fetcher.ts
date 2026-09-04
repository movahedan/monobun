import type { Client, RequestConfig, ResponseConfig } from "../base-fetch";
import { resolveAttachAccessToken } from "../resolve-attach-access-token";
import type { FetcherRuntimeContext } from "../runtime-context";
import { isRuntimeContext } from "../runtime-context";
import type { FetcherSettings } from "./settings";
import type { RequestOptions } from "./types";

const errorChecks = {
	isNetworkError: (error: unknown): boolean => {
		if (!error || typeof error !== "object") return false;
		if ("name" in error && (error as { readonly name?: string }).name === "AbortError")
			return false;
		return (
			"message" in error && (error as { readonly message?: string }).message === "Network Error"
		);
	},
	isUnauthorized: (error: unknown): boolean => {
		return (
			!!error &&
			typeof error === "object" &&
			"status" in error &&
			(error as { readonly status?: number }).status === 401
		);
	},
};

const cache = new WeakMap<
	FetcherSettings,
	{ readonly generation: number; readonly client: Client }
>();
const createRequestKey = (options: RequestOptions): string => `${options.method}:${options.url}`;

const isAbortError = (error: unknown): boolean =>
	!!error &&
	typeof error === "object" &&
	"name" in error &&
	(error as { readonly name?: string }).name === "AbortError";

/**
 * One Kubb-style {@link Client}: transport (HTTP + dedupe + 401 refresh + GET stale).
 * Omit `runtimeContext` for browser client mode; pass `{ mode: 'server' | 'static', ... }` per request/build.
 */
export function createFetcher(
	settings: FetcherSettings,
	runtimeContext?: FetcherRuntimeContext,
): Client {
	const isServerOrStatic = isRuntimeContext(runtimeContext);

	if (!isServerOrStatic) {
		const generation = settings.mutationGeneration;
		const slot = cache.get(settings);
		if (slot?.generation === generation) {
			return slot.client;
		}
	}

	const inFlightRequests = new Map<string, Promise<unknown>>();
	const cachedResponses = new Map<string, unknown>();

	const getTransport = () => {
		const resolved = settings.resolveTransport();
		const attachAccessToken = resolveAttachAccessToken(settings, runtimeContext);

		if (!isServerOrStatic) {
			return { ...resolved, attachAccessToken };
		}

		return {
			...resolved,
			attachAccessToken,
			refreshConfig: {
				refresh: async () => undefined,
				shouldRefresh: () => false,
				refreshCoordination: undefined,
			},
		};
	};

	const runDeduped = async <TData>(
		key: string,
		run: () => Promise<ResponseConfig<TData>>,
	): Promise<ResponseConfig<TData>> => {
		const existing = inFlightRequests.get(key);
		if (existing) {
			try {
				return (await existing) as ResponseConfig<TData>;
			} catch (error) {
				if (!isAbortError(error)) {
					throw error;
				}
				inFlightRequests.delete(key);
			}
		}
		const next = run().finally(() => {
			inFlightRequests.delete(key);
		});
		inFlightRequests.set(key, next);
		return await next;
	};

	const transport = async <TData>(options: RequestOptions): Promise<ResponseConfig<TData>> => {
		const key = createRequestKey(options);
		const canUseCache = !isServerOrStatic && options.method === "GET" && !options.dontCache;

		const attempt = async (): Promise<ResponseConfig<TData>> => {
			const {
				execute,
				refreshConfig: { refresh, shouldRefresh, refreshCoordination },
			} = getTransport();

			const isRefreshInFlight = refreshCoordination?.isRefreshInFlight();
			const waitForRefresh = isRefreshInFlight && !options.refreshed && shouldRefresh(options);
			if (waitForRefresh && refreshCoordination) {
				await refreshCoordination.waitForRefresh().catch(() => undefined);
				const { attachAccessToken } = getTransport();
				const optionsWithAuth = await attachAccessToken({ ...options, skipDedupe: true });
				return await transport<TData>(optionsWithAuth);
			}

			try {
				const { attachAccessToken } = getTransport();
				const data = await execute<TData>(await attachAccessToken(options));
				if (data.status >= 400) {
					throw {
						status: data.status,
						data: data.data,
						message: data.statusText,
					};
				}
				if (canUseCache) cachedResponses.set(key, data);

				return data;
			} catch (error) {
				const isUnauthorizedAndCanRefresh =
					errorChecks.isUnauthorized(error) && !options.refreshed && shouldRefresh(options);
				if (isUnauthorizedAndCanRefresh) {
					await refresh();
					const { attachAccessToken } = getTransport();
					const optionsWithAuth = await attachAccessToken({ ...options, refreshed: true });
					return await transport<TData>(optionsWithAuth);
				}

				const isNetworkErrorAndCanUseCache = canUseCache && errorChecks.isNetworkError(error);
				const cached = cachedResponses.get(key) as ResponseConfig<TData> | undefined;
				if (isNetworkErrorAndCanUseCache && cached) return cached;
				throw error;
			}
		};

		const canDedupe =
			!isServerOrStatic && options.method === "GET" && !options.refreshed && !options.skipDedupe;
		if (canDedupe) return await runDeduped<TData>(key, attempt);
		return await attempt();
	};

	const client: Client = async <TData, TError = unknown, TVariables = unknown>(
		requestConfig: RequestConfig<TVariables>,
	): Promise<ResponseConfig<TData>> => {
		const { request, options } = await settings.prepareRequest(requestConfig);
		const { attachAccessToken } = getTransport();
		const optionsWithAuth = await attachAccessToken(options);

		try {
			return await transport<TData>(optionsWithAuth);
		} catch (error) {
			return await settings.afterError<TData, TError, TVariables>(request, error as TError);
		}
	};

	if (!isServerOrStatic) {
		cache.set(settings, { generation: settings.mutationGeneration, client });
	}

	return client;
}
