import { describe, expect, it } from "bun:test";

import { renderHook, waitFor } from "@testing-library/react";

import { useListFormState } from "./useListFormState";

type FilterValues = {
	q: string;
	status: string;
};

describe("useListFormState - form draft", () => {
	it("exposes default values as effective values initially", () => {
		const { result } = renderHook(() => useListFormState<FilterValues>({ q: "a", status: "open" }));

		expect(result.current[1]).toEqual({ q: "a", status: "open" });
		expect(result.current[0].getValues()).toEqual({ q: "a", status: "open" });
	});

	it("re-syncs form and effective values when URL-derived defaults change", async () => {
		const { result, rerender } = renderHook(
			({ defaults }: { defaults: Partial<FilterValues> }) =>
				useListFormState<FilterValues>(defaults),
			{
				initialProps: { defaults: { q: "a", status: "open" } as Partial<FilterValues> },
			},
		);

		rerender({ defaults: { q: "b", status: "closed" } });

		await waitFor(() => {
			expect(result.current[1]).toEqual({ q: "b", status: "closed" });
		});

		expect(result.current[0].getValues()).toEqual({ q: "b", status: "closed" });
	});

	it("exposes submit, reset, and setValues on the form API", () => {
		const { result } = renderHook(() => useListFormState<FilterValues>({ q: "", status: "open" }));

		expect(typeof result.current[0].submit).toBe("function");
		expect(typeof result.current[0].reset).toBe("function");
		expect(typeof result.current[0].setValues).toBe("function");
	});
});
