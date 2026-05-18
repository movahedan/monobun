import type { VirtualItem } from "@tanstack/react-virtual";

export type VirtualScrollSnapshot = {
	readonly sizes: Record<number, number>;
	readonly anchorIndex: number;
	readonly anchorOffset: number;
	readonly scrollY: number;
};

const STORAGE_PREFIX = "shared-tanstack:virtual-scroll:";

function storageKey(cacheKey: string): string {
	return `${STORAGE_PREFIX}${cacheKey}`;
}

export function loadVirtualScrollSnapshot(cacheKey: string): VirtualScrollSnapshot | undefined {
	if (typeof sessionStorage === "undefined") return undefined;

	try {
		const raw = sessionStorage.getItem(storageKey(cacheKey));
		if (raw == null) return undefined;
		return JSON.parse(raw) as VirtualScrollSnapshot;
	} catch {
		return undefined;
	}
}

export function saveVirtualScrollSnapshot(cacheKey: string, snapshot: VirtualScrollSnapshot): void {
	if (typeof sessionStorage === "undefined") return;

	try {
		sessionStorage.setItem(storageKey(cacheKey), JSON.stringify(snapshot));
	} catch {
		// Quota or private mode — ignore
	}
}

export function getRestoreScrollOffset(snapshot: VirtualScrollSnapshot): number {
	if (snapshot.scrollY > 0) return snapshot.scrollY;

	let offset = 0;
	for (let index = 0; index < snapshot.anchorIndex; index += 1) {
		offset += snapshot.sizes[index] ?? 0;
	}

	return offset + snapshot.anchorOffset;
}

export function snapshotSizesFromMeasurements(virtualItems: VirtualItem[]): Record<number, number> {
	const sizes: Record<number, number> = {};
	for (const item of virtualItems) {
		if (item.size > 0) {
			sizes[item.index] = item.size;
		}
	}
	return sizes;
}

type BuildInitialMeasurementsCacheOptions = {
	readonly count: number;
	readonly savedSizes?: Record<number, number>;
	readonly scrollMargin: number;
	readonly gap: number;
	readonly estimateSize: number;
	readonly getItemKey: (index: number) => string;
};

export function buildInitialMeasurementsCache({
	count,
	savedSizes,
	scrollMargin,
	gap,
	estimateSize,
	getItemKey,
}: BuildInitialMeasurementsCacheOptions): {
	size: number;
	start: number;
	end: number;
	key: string;
	index: number;
	lane: number;
}[] {
	const measurements: {
		size: number;
		start: number;
		end: number;
		key: string;
		index: number;
		lane: number;
	}[] = [];

	let start = scrollMargin;
	for (let index = 0; index < count; index += 1) {
		const size = savedSizes?.[index] ?? estimateSize;
		measurements.push({
			index,
			key: getItemKey(index),
			lane: 0,
			size,
			start,
			end: start + size,
		});
		start += size + gap;
	}

	return measurements;
}
