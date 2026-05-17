/* eslint-disable tailwindcss/no-custom-classname -- test */
import { describe, expect, it } from "bun:test";

import { cn } from "./cn";

describe("cn (className utility)", () => {
	it("should merge multiple class names", () => {
		expect(cn("class1", "class2")).toBe("class1 class2");
	});

	it("should filter out falsy values", () => {
		expect(cn("class1", null, "class2", undefined, "")).toBe("class1 class2");
	});

	it("should handle array inputs", () => {
		expect(cn(["class1", "class2"])).toBe("class1 class2");
	});

	it("should handle object inputs", () => {
		expect(cn({ class1: true, class2: false, class3: true })).toBe("class1 class3");
	});

	it("should handle mixed inputs", () => {
		expect(
			cn(
				"base",
				{ conditional: true, hidden: false },
				["array-item1", "array-item2"],
				undefined,
				null,
			),
		).toBe("base conditional array-item1 array-item2");
	});

	it("should handle empty inputs", () => {
		expect(cn()).toBe("");
		expect(cn("")).toBe("");
		expect(cn(null)).toBe("");
		expect(cn(undefined)).toBe("");
	});
});
