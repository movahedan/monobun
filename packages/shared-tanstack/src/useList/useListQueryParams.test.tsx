import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

import { act, renderHook, waitFor } from "@testing-library/react";

const navigate = mock(() => Promise.resolve());
let routerSearch: Record<string, unknown> = { q: "hello", page: 1 };

mock.module("@tanstack/react-router", () => ({
	useNavigate: () => navigate,
	useSearch: () => routerSearch,
}));

import { useListQueryParams } from "./useListQueryParams";

function lastNavigateCall(): Record<string, unknown> {
	const calls = navigate.mock.calls as unknown as Array<[Record<string, unknown>]>;
	const call = calls.at(-1)?.[0];
	if (call == null) {
		throw new Error("navigate was not called");
	}

	return call;
}

type TestParams = {
	q: string;
	page: number;
};

describe("useListQueryParams - URL sync", () => {
	beforeEach(() => {
		navigate.mockClear();
		routerSearch = { q: "hello", page: 1 };
	});

	afterEach(() => {
		routerSearch = {};
	});

	it("returns scoped params merged with defaults", () => {
		const { result } = renderHook(() =>
			useListQueryParams<TestParams>(["q", "page"], { q: "", page: 1 }),
		);

		expect(result.current[0]).toEqual({ q: "hello", page: 1 });
	});

	it("navigates with merged values when setParams is called", async () => {
		const { result } = renderHook(() =>
			useListQueryParams<TestParams>(["q", "page"], { q: "", page: 1 }),
		);

		act(() => {
			result.current[1]({ q: "updated" });
		});

		await waitFor(() => {
			expect(navigate).toHaveBeenCalled();
		});

		const lastCall = lastNavigateCall();

		expect(lastCall.replace).toBe(true);
		expect((lastCall.search as Record<string, unknown>).q).toBe("updated");
		expect((lastCall.search as Record<string, unknown>).page).toBeUndefined();
	});

	it("omits default-equal values from the next search payload", async () => {
		routerSearch = { q: "hello", page: 2 };
		const { result } = renderHook(() =>
			useListQueryParams<TestParams>(["q", "page"], { q: "", page: 1 }),
		);

		act(() => {
			result.current[1]({ q: "", page: 1 });
		});

		await waitFor(() => {
			expect(navigate).toHaveBeenCalled();
		});

		const lastCall = lastNavigateCall();
		const search = lastCall.search as Record<string, unknown>;

		expect(search.q).toBeUndefined();
		expect(search.page).toBeUndefined();
	});

	it("applies codecs when reading and writing search params", async () => {
		routerSearch = { tags: "a,b" };
		const codecs = {
			tags: {
				parse: (value: string | Array<string> | undefined) =>
					value == null ? undefined : String(value).split(","),
				serialize: (value: Array<string> | undefined) =>
					value == null ? undefined : value.join(","),
			},
		};

		const { result } = renderHook(() =>
			useListQueryParams<{ tags: Array<string> }>(["tags"], { tags: [] }, codecs),
		);

		expect(result.current[0].tags).toEqual(["a", "b"]);

		act(() => {
			result.current[1]({ tags: ["x", "y"] });
		});

		await waitFor(() => {
			const search = lastNavigateCall().search as Record<string, unknown>;
			expect(search.tags).toBe("x,y");
		});
	});

	it("sets resetScroll when a watched search field changes", async () => {
		routerSearch = { q: "a" };
		const { result } = renderHook(() =>
			useListQueryParams<TestParams>(["q"], { q: "" }, undefined, ["q"]),
		);

		navigate.mockClear();

		act(() => {
			result.current[1]({ q: "b" });
		});

		await waitFor(() => {
			expect(lastNavigateCall().resetScroll).toBe(true);
		});
	});

	it("restores defaults when clearParams is called", async () => {
		routerSearch = { q: "hello", page: 2 };
		const { result } = renderHook(() =>
			useListQueryParams<TestParams>(["q", "page"], { q: "", page: 1 }),
		);

		act(() => {
			result.current[2]();
		});

		await waitFor(() => {
			expect(lastNavigateCall().search).toEqual({});
		});
	});
});
