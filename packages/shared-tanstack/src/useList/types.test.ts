import { describe, expect, it } from "bun:test";

import { stableStringify, valuesEqual } from "./types";

describe("stableStringify - key ordering", () => {
	it("sorts object keys for a stable representation", () => {
		expect(stableStringify({ b: 2, a: 1 })).toBe(stableStringify({ a: 1, b: 2 }));
	});

	it("stringifies nested objects and arrays deterministically", () => {
		const value = { tags: ["b", "a"], nested: { z: 1, y: 2 } };

		expect(stableStringify(value)).toBe(`{"nested":{"y":2,"z":1},"tags":["b","a"]}`);
	});

	it("stringifies primitives with JSON.stringify semantics", () => {
		expect(stableStringify(null)).toBe("null");
		expect(stableStringify("x")).toBe('"x"');
		expect(stableStringify(3)).toBe("3");
	});
});

describe("valuesEqual - stable comparison", () => {
	it("returns true for deeply equal objects with different key order", () => {
		expect(valuesEqual({ a: 1, b: { c: 2 } }, { b: { c: 2 }, a: 1 })).toBe(true);
	});

	it("returns false when values differ", () => {
		expect(valuesEqual({ a: 1 }, { a: 2 })).toBe(false);
	});
});
