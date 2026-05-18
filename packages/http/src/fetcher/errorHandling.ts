import type { ApiError, ApiFieldErrorRow } from "../api-error";
import type { HttpResponseErrorConfig } from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

function isHttpResponseError(
	error: unknown,
): error is { readonly status: number; readonly data: unknown; readonly message?: string } {
	if (!isRecord(error) || !("data" in error)) {
		return false;
	}
	return typeof error.status === "number";
}

const isFieldErrorRow = (value: unknown): value is ApiFieldErrorRow => {
	if (!isRecord(value)) {
		return false;
	}
	return typeof value.field === "string" && typeof value.message === "string";
};

function mergeDetails(
	existing: Readonly<Record<string, unknown>> | undefined,
	http: { readonly httpStatus: number; readonly responseData: unknown },
): Record<string, unknown> {
	return {
		...(existing ?? {}),
		httpStatus: http.httpStatus,
		responseData: http.responseData,
	};
}

function parseFlatApiError(data: unknown): ApiError | undefined {
	if (!isRecord(data)) {
		return undefined;
	}

	const legacyOk = data.ok;
	if (legacyOk === false && isRecord(data.error)) {
		return parseFlatApiError(data.error);
	}

	const fieldsRaw = data.fields;
	const fields: ApiFieldErrorRow[] = [];
	if (Array.isArray(fieldsRaw)) {
		for (const row of fieldsRaw) {
			if (isFieldErrorRow(row)) {
				fields.push({ field: row.field, message: row.message });
			}
		}
	}

	const message =
		typeof data.message === "string" && data.message.trim() !== ""
			? data.message
			: fields.length > 0
				? fields.map((row) => row.message).join(", ")
				: undefined;

	if (!message && fields.length === 0) {
		return undefined;
	}

	const details = isRecord(data.details) ? data.details : undefined;
	return {
		...(message ? { message } : {}),
		...(fields.length > 0 ? { fields } : {}),
		...(details ? { details } : {}),
	};
}

export function parseApiErrorEnvelope(data: unknown): ApiError | undefined {
	return parseFlatApiError(data);
}

export function getFetcherErrorMessage(err: unknown): string {
	if (err instanceof Error) {
		if (err.name === "AbortError") return "Request was cancelled.";
		const mapped = {
			"Network Error": "Check your internet connection",
			"Failed to fetch": "Check your internet connection",
			"Load failed": "Check your internet connection",
			"The user aborted a request.": "Request was cancelled.",
			"The operation was aborted.": "Request was cancelled.",
		}[err.message];
		if (mapped) return mapped;
	}

	if (isRecord(err)) {
		const msg = err.message;
		if (typeof msg === "string" && msg.trim() !== "") {
			return msg;
		}
		const status = err.status;
		if (typeof status === "number") {
			const fromStatus = STATUS_MESSAGES[status];
			if (fromStatus) return fromStatus;
		}
	}

	return "Error occurred, try again.";
}

const STATUS_MESSAGES: Readonly<Record<number, string>> = {
	401: "You need to sign in again.",
	403: "You do not have permission to do that.",
	404: "The requested resource was not found.",
	408: "The request took too long. Please try again.",
	429: "Too many requests. Please wait and try again.",
	500: "Something went wrong on our side. Please try again.",
};

export function isUnifiedFetcherFailure(error: unknown): error is ApiError {
	if (!isRecord(error)) {
		return false;
	}
	if ("ok" in error) {
		return false;
	}
	return typeof error.message === "string" || Array.isArray(error.fields);
}

export function getUnifiedErrorHttpStatus(error: unknown): number | undefined {
	if (!isRecord(error) || !isRecord(error.details)) {
		return undefined;
	}
	const httpStatus = error.details.httpStatus;
	return typeof httpStatus === "number" ? httpStatus : undefined;
}

export function normalizeFetcherError(error: unknown): ApiError {
	if (error instanceof Error) {
		return { message: getFetcherErrorMessage(error) };
	}

	const http = isHttpResponseError(error) ? { status: error.status, data: error.data } : undefined;

	const tryFlat = (payload: unknown): ApiError | undefined => parseFlatApiError(payload);

	const fromRoot = tryFlat(error);
	if (fromRoot) {
		return wrapApiError(fromRoot, http);
	}

	if (http !== undefined) {
		const fromData = tryFlat(http.data);
		if (fromData) {
			return wrapApiError(fromData, http);
		}
	}

	const message = getFetcherErrorMessage(error);
	if (http !== undefined) {
		return {
			message,
			details: { httpStatus: http.status, responseData: http.data },
		};
	}

	return { message };
}

function wrapApiError(
	body: ApiError,
	http: { readonly status: number; readonly data: unknown } | undefined,
): ApiError {
	if (http === undefined) {
		return body;
	}

	const mergedDetails = isRecord(body.details)
		? mergeDetails(body.details, { httpStatus: http.status, responseData: http.data })
		: { httpStatus: http.status, responseData: http.data };

	return { ...body, details: mergedDetails };
}

export function isResponseError<T = unknown>(error: unknown): error is HttpResponseErrorConfig<T> {
	if (typeof error !== "object" || error === null) {
		return false;
	}
	const rec = error as Record<string, unknown>;
	return typeof rec.status === "number" && "data" in rec;
}
