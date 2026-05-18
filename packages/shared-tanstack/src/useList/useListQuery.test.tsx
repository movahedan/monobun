import { describe, expect, it, mock } from "bun:test";

import { act, renderHook, waitFor } from "@testing-library/react";

import { createQueryWrapper } from "../__tests__/list-test-utils";
import { useListQuery } from "./useListQuery";

type Item = { id: string };
type Params = { page?: number; limit?: number; q?: string };

describe("useListQuery - infinite pages", () => {
	it("flattens fetched pages into a single list", async () => {
		const fetcher = mock(async ({ page }: Params) => {
			if (page === 1) return [{ id: "a" }, { id: "b" }];
			return [{ id: "c" }];
		});

		const { result } = renderHook(
			() => useListQuery<Params, Item>(["items"], fetcher, { page: 1, limit: 2 }),
			{ wrapper: createQueryWrapper() },
		);

		await waitFor(() => {
			expect(result.current[0]).toEqual([{ id: "a" }, { id: "b" }]);
		});
	});

	it("loads the next page when getMore is called", async () => {
		const fetcher = mock(async ({ page }: Params) => {
			if (page === 1) return [{ id: "1" }, { id: "2" }];
			if (page === 2) return [{ id: "3" }];
			return [];
		});

		const { result } = renderHook(
			() => useListQuery<Params, Item>(["items"], fetcher, { page: 1, limit: 2 }),
			{ wrapper: createQueryWrapper() },
		);

		await waitFor(() => {
			expect(result.current[0]).toHaveLength(2);
		});

		act(() => {
			result.current[2]();
		});

		await waitFor(() => {
			expect(result.current[0]).toEqual([{ id: "1" }, { id: "2" }, { id: "3" }]);
		});

		expect(fetcher).toHaveBeenCalledTimes(2);
	});

	it("stops pagination when a page returns no items", async () => {
		const fetcher = mock(async () => [] as Item[]);

		const { result } = renderHook(
			() => useListQuery<Params, Item>(["empty"], fetcher, { page: 1, limit: 10 }),
			{ wrapper: createQueryWrapper() },
		);

		await waitFor(() => {
			expect(result.current[1]).toBe(false);
		});

		expect(result.current[3].hasNextPage).toBe(false);
	});
});
