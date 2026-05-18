import { describe, expect, it } from "bun:test";

import { hasScope, SCOPES } from "./index";

describe("hasScope hierarchy", () => {
	it("admin satisfies read and write", () => {
		expect(hasScope([SCOPES.admin], SCOPES.read)).toBe(true);
		expect(hasScope([SCOPES.admin], SCOPES.write)).toBe(true);
	});

	it("write satisfies read but not admin", () => {
		expect(hasScope([SCOPES.write], SCOPES.read)).toBe(true);
		expect(hasScope([SCOPES.write], SCOPES.admin)).toBe(false);
	});

	it("read only satisfies read", () => {
		expect(hasScope([SCOPES.read], SCOPES.read)).toBe(true);
		expect(hasScope([SCOPES.read], SCOPES.write)).toBe(false);
	});
});
