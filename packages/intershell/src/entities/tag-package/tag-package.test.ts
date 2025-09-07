import { describe, expect, test } from "bun:test";
import { EntityTagPackage } from "./tag-package";

describe("EntityTagPackage", () => {
	test("should create instance", () => {
		const tagPackage = new EntityTagPackage("api");
		expect(tagPackage).toBeDefined();
		expect(tagPackage.packageName).toBe("api");
	});

	test("should create root instance", () => {
		const tagPackage = new EntityTagPackage("root");
		expect(tagPackage).toBeDefined();
		expect(tagPackage.packageName).toBe("root");
	});

	test("should detect tag prefix for root package", () => {
		const tagPackage = new EntityTagPackage("root");

		expect(tagPackage.detectTagPrefix("v1.0.0")).toBe("v");
		expect(tagPackage.detectTagPrefix("v2.1.3")).toBe("v");
		expect(tagPackage.detectTagPrefix("v0.0.1")).toBe("v");
	});

	test("should detect tag prefix for package-specific tags", () => {
		const tagPackage = new EntityTagPackage("api");

		expect(tagPackage.detectTagPrefix("api-v1.0.0")).toBe("api-v");
		expect(tagPackage.detectTagPrefix("intershell-v2.1.3")).toBe("intershell-v");
		expect(tagPackage.detectTagPrefix("ui-v0.0.1")).toBe("ui-v");
	});

	test("should return undefined for invalid tag formats", () => {
		const tagPackage = new EntityTagPackage("api");

		expect(tagPackage.detectTagPrefix("1.0.0")).toBeUndefined();
		expect(tagPackage.detectTagPrefix("invalid")).toBeUndefined();
		expect(tagPackage.detectTagPrefix("")).toBeUndefined();
	});

	test("should compare versions correctly", () => {
		const tagPackage = new EntityTagPackage("api");

		expect(tagPackage.compareVersions("1.0.0", "1.0.1")).toBe(-1);
		expect(tagPackage.compareVersions("1.0.1", "1.0.0")).toBe(1);
		expect(tagPackage.compareVersions("1.0.0", "1.0.0")).toBe(0);
		expect(tagPackage.compareVersions("2.0.0", "1.9.9")).toBe(1);
		expect(tagPackage.compareVersions("1.0.0", "2.0.0")).toBe(-1);
	});

	test("should handle version comparison with different lengths", () => {
		const tagPackage = new EntityTagPackage("api");

		expect(tagPackage.compareVersions("1.0", "1.0.0")).toBe(0);
		expect(tagPackage.compareVersions("1.0.0", "1.0")).toBe(0);
		expect(tagPackage.compareVersions("1", "1.0.0")).toBe(0);
	});

	test("should handle version comparison edge cases", () => {
		const tagPackage = new EntityTagPackage("api");

		expect(tagPackage.compareVersions("0.0.0", "0.0.1")).toBe(-1);
		expect(tagPackage.compareVersions("0.1.0", "0.0.9")).toBe(1);
		expect(tagPackage.compareVersions("1.0.0", "0.9.9")).toBe(1);
	});
});
