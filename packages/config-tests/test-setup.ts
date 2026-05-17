// Centralized test setup for Bun
/** biome-ignore-all lint/suspicious/noExplicitAny: just a test preset */
// This file is preloaded before running tests across all packages

import { afterEach, expect, mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";

// Set up DOM environment for React tests
if (typeof (globalThis as any).document === "undefined") {
	GlobalRegistrator.register();
}

// Extend expect with testing-library matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
	cleanup();
	mock.clearAllMocks();
	mock.restore();
});

// Global test utilities
export const testUtils = {
	// Helper to create a mock function
	createMock: <T extends (...args: unknown[]) => unknown>(fn?: T) => {
		return fn || (() => {});
	},

	// Helper to wait for async operations
	wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

	// Helper to create a test element
	createTestElement: () => {
		if (typeof (globalThis as any).document !== "undefined") {
			return (globalThis as any).document.createElement("div");
		}
		return null;
	},

	// Helper to wait for element to be in document
	waitForElement: async (selector: string, timeout = 5000) => {
		const start = Date.now();
		while (Date.now() - start < timeout) {
			const element = (globalThis as any).document?.querySelector(selector);
			if (element) return element;
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
		throw new Error(`Element ${selector} not found within ${timeout}ms`);
	},

	// Helper to create a test environment
	setupTestEnvironment: () => {
		// Reset any global state
		if (typeof (globalThis as any).document !== "undefined") {
			(globalThis as any).document.body.innerHTML = "";
		}
	},
};

// Export for use in tests
export { testUtils as utils };

// Set up global test configuration
process.env.NODE_ENV = "test";
process.env.DOM_ENV = "jsdom";

// Configure test timeouts
if (typeof (globalThis as any).Bun !== "undefined") {
	// Set default timeout for all tests
	(globalThis as any).Bun.env.TEST_TIMEOUT = "5000";
}
