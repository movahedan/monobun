"use client";

import type { QueryKey } from "@tanstack/react-query";
import { useWindowVirtualizer, type VirtualItem, type Virtualizer } from "@tanstack/react-virtual";
import {
	type CSSProperties,
	type RefObject,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import type { ListFetcher, ListFetcherParamsBase } from "./types";
import { type UseListOptions, useList } from "./useList";
import {
	buildInitialMeasurementsCache,
	getRestoreScrollOffset,
	loadVirtualScrollSnapshot,
	saveVirtualScrollSnapshot,
	snapshotSizesFromMeasurements,
	type VirtualScrollSnapshot,
} from "./useVirtualList.utils";

const DEFAULT_ESTIMATE_SIZE = 420;
const DEFAULT_GAP = 12;
const DEFAULT_OVERSCAN = 5;
const DEFAULT_LOAD_MORE_THRESHOLD = 3;
const SCROLL_RESTORE_TOLERANCE_PX = 8;
const LOADER_ROW_KEY = "virtual-list-loader-row";

export type UseVirtualListViewportOptions<TItem> = {
	readonly getItemKey: (item: TItem, index: number) => string;
	readonly estimateSize?: number;
	readonly gap?: number;
	readonly overscan?: number;
	readonly loadMoreThreshold?: number;
	readonly scrollCacheKey?: string;
	readonly initialScrollSnapshot?: VirtualScrollSnapshot;
	readonly restoredScrollY?: number;
	readonly virtualEnabled?: boolean;
};

export type UseVirtualListOptions<
	TParams extends ListFetcherParamsBase,
	TItem,
> = UseListOptions<TParams> & UseVirtualListViewportOptions<TItem>;

export type UseVirtualListViewportResult<TItem> = {
	readonly containerRef: RefObject<HTMLElement | null>;
	readonly scrollMargin: number;
	readonly scrollMarginReady: boolean;
	readonly rowVirtualizer: Virtualizer<Window, Element>;
	readonly virtualItems: VirtualItem[];
	readonly measureRow: (node: HTMLElement | null) => void;
	readonly totalSize: number;
	readonly getRowStyle: (start: number) => CSSProperties;
	readonly persistScrollSnapshot: () => void;
	readonly showViewport: boolean;
	readonly rowCount: number;
	readonly isLoaderRow: (index: number) => boolean;
	readonly getItemAt: (index: number) => TItem | undefined;
};

function rowPositionStyle(start: number, scrollMargin: number): CSSProperties {
	return {
		position: "absolute",
		top: 0,
		left: 0,
		width: "100%",
		transform: `translateY(${start - scrollMargin}px)`,
	};
}

type UseVirtualListViewportInput<TItem> = UseVirtualListViewportOptions<TItem> & {
	readonly items: readonly TItem[];
	readonly hasNextPage: boolean;
	readonly isFetchingNextPage: boolean;
	readonly onLoadMore: () => void;
};

function useVirtualListViewport<TItem>({
	items,
	hasNextPage,
	isFetchingNextPage,
	onLoadMore,
	getItemKey,
	estimateSize = DEFAULT_ESTIMATE_SIZE,
	gap = DEFAULT_GAP,
	overscan = DEFAULT_OVERSCAN,
	loadMoreThreshold = DEFAULT_LOAD_MORE_THRESHOLD,
	scrollCacheKey,
	initialScrollSnapshot,
	restoredScrollY,
	virtualEnabled = true,
}: UseVirtualListViewportInput<TItem>): UseVirtualListViewportResult<TItem> {
	const containerRef = useRef<HTMLElement | null>(null);
	const initialRestoreDoneRef = useRef(false);
	const measuredSizesRef = useRef<Record<number, number>>({});

	const feedSnapshot = useMemo(
		() =>
			initialScrollSnapshot ??
			(scrollCacheKey ? loadVirtualScrollSnapshot(scrollCacheKey) : undefined),
		[initialScrollSnapshot, scrollCacheKey],
	);

	const [scrollMargin, setScrollMargin] = useState(0);
	const [scrollMarginReady, setScrollMarginReady] = useState(feedSnapshot == null);

	const rowCount = items.length + (hasNextPage ? 1 : 0);

	const resolveItemKey = useCallback(
		(index: number) => {
			if (index >= items.length) return LOADER_ROW_KEY;
			return getItemKey(items[index] as TItem, index);
		},
		[items, getItemKey],
	);

	const initialMeasurementsCache = useMemo(() => {
		if (!virtualEnabled || !feedSnapshot || rowCount === 0) return undefined;

		return buildInitialMeasurementsCache({
			count: rowCount,
			savedSizes: feedSnapshot.sizes,
			scrollMargin,
			gap,
			estimateSize,
			getItemKey: resolveItemKey,
		});
	}, [virtualEnabled, feedSnapshot, rowCount, scrollMargin, gap, estimateSize, resolveItemKey]);

	const rowVirtualizer = useWindowVirtualizer({
		count: virtualEnabled ? rowCount : 0,
		estimateSize: () => estimateSize,
		overscan,
		gap,
		scrollMargin,
		getItemKey: resolveItemKey,
		initialMeasurementsCache,
		initialOffset: feedSnapshot?.scrollY ?? restoredScrollY,
	});

	const virtualItems = rowVirtualizer.getVirtualItems();

	const measureRow = useCallback(
		(node: HTMLElement | null) => {
			rowVirtualizer.measureElement(node);
			if (node == null) return;

			const indexAttr = node.getAttribute("data-index");
			if (indexAttr == null) return;

			const index = Number.parseInt(indexAttr, 10);
			if (Number.isNaN(index)) return;

			measuredSizesRef.current[index] = node.getBoundingClientRect().height;
		},
		[rowVirtualizer],
	);

	const persistScrollSnapshot = useCallback(() => {
		if (!virtualEnabled || items.length === 0 || scrollCacheKey == null) return;

		const anchorItem = rowVirtualizer.getVirtualItemForOffset(window.scrollY);
		const previousSizes = loadVirtualScrollSnapshot(scrollCacheKey)?.sizes;
		const anchorIndex = anchorItem?.index ?? 0;
		const anchorStart = anchorItem?.start ?? 0;

		saveVirtualScrollSnapshot(scrollCacheKey, {
			sizes: {
				...previousSizes,
				...measuredSizesRef.current,
				...snapshotSizesFromMeasurements(virtualItems),
			},
			anchorIndex,
			anchorOffset: window.scrollY - anchorStart,
			scrollY: window.scrollY,
		});
	}, [virtualEnabled, items.length, rowVirtualizer, scrollCacheKey, virtualItems]);

	const targetScrollY = useMemo(() => {
		if (feedSnapshot != null) return getRestoreScrollOffset(feedSnapshot);
		return restoredScrollY;
	}, [feedSnapshot, restoredScrollY]);

	useLayoutEffect(() => {
		setScrollMargin(containerRef.current?.offsetTop ?? 0);
		setScrollMarginReady(feedSnapshot == null);
	}, [feedSnapshot]);

	useEffect(() => {
		const onResize = () => setScrollMargin(containerRef.current?.offsetTop ?? 0);
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);

	useLayoutEffect(() => {
		if (
			!virtualEnabled ||
			initialRestoreDoneRef.current ||
			targetScrollY == null ||
			targetScrollY <= 0 ||
			items.length === 0
		) {
			return;
		}

		initialRestoreDoneRef.current = true;

		const apply = () => {
			rowVirtualizer.scrollToOffset(targetScrollY, { align: "auto", behavior: "instant" });
		};

		apply();

		const frameId = requestAnimationFrame(() => {
			if (Math.abs(window.scrollY - targetScrollY) > SCROLL_RESTORE_TOLERANCE_PX) {
				apply();
			}
		});

		return () => cancelAnimationFrame(frameId);
	}, [virtualEnabled, targetScrollY, items.length, rowVirtualizer]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset restore only when cache key changes
	useEffect(() => {
		initialRestoreDoneRef.current = false;
	}, [scrollCacheKey]);

	useEffect(() => {
		if (!virtualEnabled) return;
		return () => persistScrollSnapshot();
	}, [virtualEnabled, persistScrollSnapshot]);

	useEffect(() => {
		if (!virtualEnabled) return;

		const lastItem = virtualItems[virtualItems.length - 1];
		if (!lastItem) return;

		const nearEnd = lastItem.index >= items.length - loadMoreThreshold;
		if (nearEnd && hasNextPage && !isFetchingNextPage) {
			onLoadMore();
		}
	}, [
		virtualEnabled,
		virtualItems,
		items.length,
		hasNextPage,
		isFetchingNextPage,
		onLoadMore,
		loadMoreThreshold,
	]);

	useEffect(() => {
		if (
			!virtualEnabled ||
			restoredScrollY == null ||
			restoredScrollY <= 0 ||
			!hasNextPage ||
			isFetchingNextPage
		) {
			return;
		}

		const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
		if (restoredScrollY > maxScroll - estimateSize) {
			onLoadMore();
		}
	}, [virtualEnabled, restoredScrollY, hasNextPage, isFetchingNextPage, onLoadMore, estimateSize]);

	const getRowStyle = useCallback(
		(start: number) => rowPositionStyle(start, scrollMargin),
		[scrollMargin],
	);

	const isLoaderRow = useCallback((index: number) => index >= items.length, [items.length]);

	const getItemAt = useCallback((index: number) => items[index], [items]);

	return {
		containerRef,
		scrollMargin,
		scrollMarginReady,
		rowVirtualizer,
		virtualItems,
		measureRow,
		totalSize: rowVirtualizer.getTotalSize(),
		getRowStyle,
		persistScrollSnapshot,
		showViewport: scrollMarginReady || feedSnapshot == null,
		rowCount,
		isLoaderRow,
		getItemAt,
	};
}

export function useVirtualList<TParams extends ListFetcherParamsBase, TItem>(
	queryKey: QueryKey,
	fetcher: ListFetcher<TParams, TItem[]>,
	{
		getItemKey,
		estimateSize,
		gap,
		overscan,
		loadMoreThreshold,
		scrollCacheKey,
		initialScrollSnapshot,
		restoredScrollY,
		virtualEnabled,
		...listOptions
	}: UseVirtualListOptions<TParams, TItem>,
) {
	const listResult = useList<TParams, TItem>(queryKey, fetcher, listOptions);
	const [items, , getMore] = listResult.list;
	const { hasNextPage, isFetchingNextPage } = listResult.pagination;

	const virtual = useVirtualListViewport<TItem>({
		items,
		hasNextPage,
		isFetchingNextPage,
		onLoadMore: getMore,
		getItemKey,
		estimateSize,
		gap,
		overscan,
		loadMoreThreshold,
		scrollCacheKey,
		initialScrollSnapshot,
		restoredScrollY,
		virtualEnabled,
	});

	return {
		...listResult,
		virtual,
	};
}
