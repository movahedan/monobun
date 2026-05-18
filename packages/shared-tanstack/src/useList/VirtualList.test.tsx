import { afterEach, describe, expect, it, mock } from "bun:test";

import { render, screen } from "@testing-library/react";
import type { CSSProperties } from "react";

import { createQueryWrapper } from "../__tests__/list-test-utils";

type Item = { id: string; title: string };

const items = [
	{ id: "1", title: "First" },
	{ id: "2", title: "Second" },
];

function mockVirtualListState(list: Item[]) {
	mock.module("./useVirtualList", () => ({
		useVirtualList: () => ({
			list: [list, false, mock(() => {})],
			state: [null, {}],
			pagination: { isFetchingNextPage: false },
			virtual: {
				showViewport: true,
				virtualItems: list.map((_, index) => ({
					index,
					key: String(index),
					start: index * 112,
					size: 100,
				})),
				getRowStyle: () => ({}) as CSSProperties,
				isLoaderRow: () => false,
				getItemAt: (index: number) => list[index],
				measureRow: () => {},
				containerRef: { current: null },
				totalSize: list.length * 112,
			},
		}),
	}));
}

describe("VirtualList - feed rendering", () => {
	afterEach(() => {
		mock.restore();
	});

	it("renders renderEmpty when the list has no items", async () => {
		mockVirtualListState([]);
		const { VirtualList } = await import("./VirtualList");
		const fetcher = mock(async () => [] as Item[]);
		const QueryWrapper = createQueryWrapper();

		render(
			<QueryWrapper>
				<VirtualList
					queryKey={["virtual-empty"]}
					fetcher={fetcher}
					defaultValues={{ page: 1, limit: 10 }}
					getItemKey={(item) => item.id}
					renderItem={({ item }) => <p>{item.title}</p>}
					renderEmpty={() => <p>No results</p>}
				/>
			</QueryWrapper>,
		);

		expect(screen.getByText("No results")).toBeInTheDocument();
	});

	it("renders items inside a feed landmark", async () => {
		mockVirtualListState(items);
		const { VirtualList } = await import("./VirtualList");
		const fetcher = mock(async () => items);
		const QueryWrapper = createQueryWrapper();

		render(
			<QueryWrapper>
				<VirtualList
					queryKey={["virtual-items"]}
					fetcher={fetcher}
					defaultValues={{ page: 1, limit: 10 }}
					getItemKey={(item) => item.id}
					ariaLabel="Results feed"
					renderItem={({ item }) => <p>{item.title}</p>}
				/>
			</QueryWrapper>,
		);

		expect(screen.getByText("First")).toBeInTheDocument();
		expect(screen.getByText("Second")).toBeInTheDocument();
		expect(screen.getByRole("feed", { name: "Results feed" })).toBeInTheDocument();
	});
});
