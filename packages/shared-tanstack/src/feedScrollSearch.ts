import { stableStringify } from "./useList/types";

/** True when any watched search field differs between navigations (used for `resetScroll` on replace). */
export function feedScrollSearchChanged(
	prev: Record<string, unknown>,
	next: Record<string, unknown>,
	keys: readonly string[],
): boolean {
	return keys.some((key) => stableStringify(prev[key]) !== stableStringify(next[key]));
}
