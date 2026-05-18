import { describe, expect, it } from "bun:test";

import { feedScrollSearchChanged } from "./feedScrollSearch";

describe("feedScrollSearchChanged - watched keys", () => {
	it("returns false when watched keys are unchanged", () => {
		const prev = { q: "a", page: 1 };
		const next = { q: "a", page: 2 };

		expect(feedScrollSearchChanged(prev, next, ["q"])).toBe(false);
	});

	it("returns true when a watched key changes", () => {
		const prev = { q: "a" };
		const next = { q: "b" };

		expect(feedScrollSearchChanged(prev, next, ["q"])).toBe(true);
	});

	it("returns true when a watched key is added or removed", () => {
		expect(feedScrollSearchChanged({ q: "a" }, {}, ["q"])).toBe(true);
		expect(feedScrollSearchChanged({}, { q: "a" }, ["q"])).toBe(true);
	});

	it("compares nested values with stable ordering", () => {
		const prev = { filters: { b: 2, a: 1 } };
		const next = { filters: { a: 1, b: 2 } };

		expect(feedScrollSearchChanged(prev, next, ["filters"])).toBe(false);
	});
});
