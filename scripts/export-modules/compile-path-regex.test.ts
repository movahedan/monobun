import { describe, expect, it } from "bun:test";

import { compilePathRegex } from "./compile-path-regex";

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

	it("accepts dir and file css path pattern", () => {
		const regex = compilePathRegex(String.raw`^src/([^/]+/[^/]+)\.css$`, "");
		expect(regex.test("src/styles/globals.css")).toBe(true);
		expect(regex.test("src/style.css")).toBe(false);
	});

	it("accepts root-level css file pattern for ui", () => {
		const regex = compilePathRegex(String.raw`^src/([^/]+\.css)$`, "");
		expect(regex.test("src/style.css")).toBe(true);
		expect(regex.test("src/styles/globals.css")).toBe(false);
	});
});
