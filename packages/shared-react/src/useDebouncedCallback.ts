import { type DependencyList, useCallback, useEffect, useRef } from "react";

/**
 * A debounced callback that strictly follows the useCallback pattern.
 * @param callback - The function to debounce.
 * @param deps - Dependency list that triggers the recreation of the debounced function.
 * @param delay - The debounce delay in milliseconds.
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
	callback: T,
	deps: DependencyList,
	delay: number,
): T {
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	const clearTimer = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
	}, []);

	useEffect(() => {
		return clearTimer;
	}, [clearTimer]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: `callback` is controlled via the caller's `deps` argument
	return useCallback(
		(async (...args) => {
			clearTimer();

			return new Promise((resolve) => {
				timeoutRef.current = setTimeout(async () => {
					resolve(await callback(...args));
				}, delay);
			});
		}) as T,
		[...deps, clearTimer, delay],
	);
}
