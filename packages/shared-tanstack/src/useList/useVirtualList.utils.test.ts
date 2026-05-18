import { beforeEach, describe, expect, it } from "bun:test";

import type { VirtualItem } from "@tanstack/react-virtual";

import {
	buildInitialMeasurementsCache,
	getRestoreScrollOffset,
	loadVirtualScrollSnapshot,
	saveVirtualScrollSnapshot,
	snapshotSizesFromMeasurements,
	type VirtualScrollSnapshot,
} from "./useVirtualList.utils";

const CACHE_KEY = "test-feed";

describe("useVirtualList.utils - session snapshots", () => {
	beforeEach(() => {
		sessionStorage.clear();
	});

	it("round-trips a snapshot through sessionStorage", () => {
		const snapshot: VirtualScrollSnapshot = {
			sizes: { 0: 100, 1: 200 },
			anchorIndex: 1,
			anchorOffset: 12,
			scrollY: 400,
		};

		saveVirtualScrollSnapshot(CACHE_KEY, snapshot);

		expect(loadVirtualScrollSnapshot(CACHE_KEY)).toEqual(snapshot);
	});

	it("returns undefined when no snapshot exists", () => {
		expect(loadVirtualScrollSnapshot("missing-key")).toBeUndefined();
	});
});

describe("getRestoreScrollOffset - scroll restoration", () => {
	it("prefers scrollY when it is positive", () => {
		const snapshot: VirtualScrollSnapshot = {
			sizes: { 0: 50, 1: 50 },
			anchorIndex: 1,
			anchorOffset: 10,
			scrollY: 900,
		};

		expect(getRestoreScrollOffset(snapshot)).toBe(900);
	});

	it("derives offset from sizes and anchor when scrollY is zero", () => {
		const snapshot: VirtualScrollSnapshot = {
			sizes: { 0: 100, 1: 80, 2: 60 },
			anchorIndex: 2,
			anchorOffset: 15,
			scrollY: 0,
		};

		expect(getRestoreScrollOffset(snapshot)).toBe(195);
	});
});

describe("snapshotSizesFromMeasurements - measured rows", () => {
	it("records only items with a positive size", () => {
		const virtualItems = [
			{ index: 0, size: 0 },
			{ index: 1, size: 120 },
			{ index: 2, size: 80 },
		] as VirtualItem[];

		expect(snapshotSizesFromMeasurements(virtualItems)).toEqual({
			1: 120,
			2: 80,
		});
	});
});

describe("buildInitialMeasurementsCache - layout seed", () => {
	it("builds contiguous measurements using saved sizes and gap", () => {
		const measurements = buildInitialMeasurementsCache({
			count: 3,
			savedSizes: { 1: 50 },
			scrollMargin: 10,
			gap: 5,
			estimateSize: 100,
			getItemKey: (index) => `row-${index}`,
		});

		expect(measurements).toHaveLength(3);
		expect(measurements[0]).toMatchObject({ index: 0, size: 100, start: 10, key: "row-0" });
		expect(measurements[1]).toMatchObject({ index: 1, size: 50, start: 115, key: "row-1" });
		expect(measurements[2]?.end).toBe((measurements[2]?.start ?? 0) + 100);
	});
});
