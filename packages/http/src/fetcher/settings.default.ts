import { normalizeFetcherError } from "./errorHandling";
import type { BeforeRequestCallback, FetcherPlainMergeInput } from "./types";

/** Removes `Content-Type` for `FormData` so the browser can set the multipart boundary. */
const removeContentTypeWhenFormData: BeforeRequestCallback = async (req) => {
	if (!(req.data instanceof FormData)) {
		return req;
	}

	const headers = { ...((req.headers as Record<string, string> | undefined) ?? {}) };
	if (!headers["Content-Type"]) {
		return req;
	}

	delete headers["Content-Type"];
	return { ...req, headers };
};

/** Sets JSON `Content-Type` when there is a non-`FormData` body and no header yet. */
const applyJsonContentTypeWhenBody: BeforeRequestCallback = async (req) => {
	const hasJsonBody = req.data !== undefined && !(req.data instanceof FormData);
	if (!hasJsonBody) {
		return req;
	}
	const headers = { ...((req.headers as Record<string, string> | undefined) ?? {}) };
	if (headers["Content-Type"]) {
		return req;
	}
	return {
		...req,
		headers: {
			...headers,
			"Content-Type": "application/json;charset=UTF-8",
		},
	};
};

/**
 * Plain defaults for {@link FetcherSettings} (not an instance).
 * Clone or pass into `new FetcherSettings(...)` per app; the package default client uses a root instance built from this in `index.ts`.
 */
export const defaultFetcherSettingsInput: FetcherPlainMergeInput = {
	config: {
		baseRequestConfig: {
			headers: {
				Accept: "application/json",
			},
		},
	},
	callbacks: {
		beforeRequest: [removeContentTypeWhenFormData, applyJsonContentTypeWhenBody],
		afterResponse: [],
		afterError: [
			({ error }) => {
				throw normalizeFetcherError(error);
			},
		],
	},
};
