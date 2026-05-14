import { describe, expect, it } from "bun:test";

import { compilePathRegex } from "./update";

describe("export-modules - compilePathRegex", () => {
	it("accepts the documented component-folder pattern", () => {
		const regex = compilePathRegex(String.raw`src/([^/]+)/\1\.tsx$`, "");
		expect(regex.test("src/card/card.tsx")).toBe(true);
	});

	it("throws when pattern may cause catastrophic backtracking", () => {
		expect(() => compilePathRegex("(a+)+", "")).toThrow(/catastrophic backtracking/);
	});

	it("throws when pattern is not a valid regular expression", () => {
		expect(() => compilePathRegex("[", "")).toThrow(/Invalid regular expression/);
	});
});
