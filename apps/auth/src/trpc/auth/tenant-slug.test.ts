import { describe, expect, it } from "bun:test";

import { baseSlugFromEmail } from "./tenant-slug";

describe("baseSlugFromEmail", () => {
	it("normalizes email local part into a slug", () => {
		expect(baseSlugFromEmail("Jane.Doe+tag@example.com")).toBe("jane-doe-tag");
	});

	it("returns workspace when local part has no alphanumerics", () => {
		expect(baseSlugFromEmail("...@example.com")).toBe("workspace");
	});

	it("completes quickly on long hyphen-only input", () => {
		const started = performance.now();
		expect(baseSlugFromEmail(`${"-".repeat(10_000)}@example.com`)).toBe("workspace");
		expect(performance.now() - started).toBeLessThan(100);
	});
});
