import { describe, expect, it, mock } from "bun:test";

import { act, renderHook, waitFor } from "@testing-library/react";

import { createQueryWrapper } from "../__tests__/list-test-utils";
import { useList } from "./useList";

const navigate = mock(() => Promise.resolve());
let routerSearch: Record<string, unknown> = { q: "seed" };

mock.module("@tanstack/react-router", () => ({
	useNavigate: () => navigate,
	useSearch: () => routerSearch,
}));

type Item = { id: string };
type Params = { page?: number; limit?: number; q?: string };

describe("useList - composed list state", () => {
	it("loads items using form effective values when query params are enabled", async () => {
		routerSearch = { q: "seed" };
		const fetcher = mock(async (params: Params) => [{ id: params.q ?? "missing" }]);

		const { result } = renderHook(
			() =>
				useList<Params, Item>(["list"], fetcher, {
					queryParamsKeys: ["q"],
					defaultValues: { q: "", page: 1, limit: 10 },
				}),
			{ wrapper: createQueryWrapper() },
		);

		await waitFor(() => {
			expect(result.current.list[0]).toEqual([{ id: "seed" }]);
		});

		expect(result.current.state[1].q).toBe("seed");
	});

	it("uses static params when valuesParams are provided", async () => {
		const fetcher = mock(async (params: Params) => [{ id: `${params.q}-${params.page}` }]);

		const { result } = renderHook(
			() =>
				useList<Params, Item>(["static"], fetcher, {
					params: { q: "fixed", page: 1, limit: 10 },
					defaultValues: { q: "", page: 1, limit: 10 },
				}),
			{ wrapper: createQueryWrapper() },
		);

		await waitFor(() => {
			expect(result.current.list[0]).toEqual([{ id: "fixed-1" }]);
		});
	});

	it("exposes pagination helpers from the underlying query", async () => {
		const fetcher = mock(async ({ page }: Params) => {
			if (page === 1) return [{ id: "1" }, { id: "2" }];
			return [{ id: "3" }];
		});

		const { result } = renderHook(
			() =>
				useList<Params, Item>(["pages"], fetcher, {
					defaultValues: { page: 1, limit: 2 },
				}),
			{ wrapper: createQueryWrapper() },
		);

		await waitFor(() => {
			expect(result.current.pagination.hasNextPage).toBe(true);
		});

		act(() => {
			result.current.list[2]();
		});

		await waitFor(() => {
			expect(result.current.list[0]).toHaveLength(3);
		});
	});
});
