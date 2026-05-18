import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";

import { act, renderHook } from "@testing-library/react";

import { useDebouncedCallback } from "./useDebouncedCallback";

describe("useDebouncedCallback - debounce timing", () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("invokes the callback after the delay when called once", async () => {
		const callback = jest.fn<() => Promise<string>>(() => Promise.resolve("done"));
		const { result } = renderHook(() => useDebouncedCallback(callback, [callback], 300));

		let resolved: string | undefined;
		act(() => {
			void result.current().then((value: string) => {
				resolved = value;
			});
		});

		expect(callback).not.toHaveBeenCalled();

		await act(async () => {
			jest.advanceTimersByTime(300);
		});

		expect(callback).toHaveBeenCalledTimes(1);
		expect(resolved).toBe("done");
	});

	it("coalesces rapid calls into a single invocation", async () => {
		const callback = jest.fn();
		const { result } = renderHook(() => useDebouncedCallback(callback, [callback], 200));

		act(() => {
			void result.current();
			void result.current();
			void result.current();
		});

		await act(async () => {
			jest.advanceTimersByTime(200);
		});

		expect(callback).toHaveBeenCalledTimes(1);
	});

	it("resets the timer when called again before the delay elapses", async () => {
		const callback = jest.fn();
		const { result } = renderHook(() => useDebouncedCallback(callback, [callback], 100));

		act(() => {
			void result.current();
		});

		await act(async () => {
			jest.advanceTimersByTime(50);
		});

		act(() => {
			void result.current();
		});

		await act(async () => {
			jest.advanceTimersByTime(50);
		});

		expect(callback).not.toHaveBeenCalled();

		await act(async () => {
			jest.advanceTimersByTime(50);
		});

		expect(callback).toHaveBeenCalledTimes(1);
	});
});
