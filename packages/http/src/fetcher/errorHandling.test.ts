import { describe, expect, it } from "bun:test";

import {
	getFetcherErrorMessage,
	getUnifiedErrorHttpStatus,
	isUnifiedFetcherFailure,
	normalizeFetcherError,
	parseApiErrorEnvelope,
} from "./errorHandling";

describe("normalizeFetcherError", () => {
	it("maps flat Nest validation body from HTTP error", () => {
		const httpError = {
			status: 422,
			data: {
				message: "Validation failed",
				fields: [{ field: "email", message: "Invalid email" }],
			},
		};

		const normalized = normalizeFetcherError(httpError);

		expect(normalized).toEqual({
			message: "Validation failed",
			fields: [{ field: "email", message: "Invalid email" }],
			details: {
				httpStatus: 422,
				responseData: httpError.data,
			},
		});
	});

	it("maps network errors to a friendly message", () => {
		expect(getFetcherErrorMessage(new Error("Network Error"))).toBe(
			"Check your internet connection",
		);
		expect(normalizeFetcherError(new Error("Network Error"))).toEqual({
			message: "Check your internet connection",
		});
	});

	it("unwraps legacy envelope payloads into flat ApiError", () => {
		const legacy = { ok: false, error: { message: "Session expired" } } as {
			readonly ok: false;
			readonly error: { readonly message: string };
		};
		expect(parseApiErrorEnvelope(legacy)).toEqual({ message: "Session expired" });
		expect(isUnifiedFetcherFailure({ message: "flat" })).toBe(true);
		expect(getUnifiedErrorHttpStatus({ message: "x", details: { httpStatus: 403 } })).toBe(403);
	});
});
