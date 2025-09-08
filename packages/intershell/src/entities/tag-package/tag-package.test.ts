import { describe, expect, test } from "bun:test";
import { EntityPackages } from "../packages";
import { EntityTagPackage } from "./tag-package";

describe("EntityTagPackage", () => {
	test("should create instance", () => {
		const packageInstance = new EntityPackages("api");
		const tagPackage = new EntityTagPackage(packageInstance);
		expect(tagPackage).toBeDefined();
	});

	test("should create root instance", () => {
		const packageInstance = new EntityPackages("root");
		const tagPackage = new EntityTagPackage(packageInstance);
		expect(tagPackage).toBeDefined();
	});

	test("should detect tag prefix for root package", () => {
		const packageInstance = new EntityPackages("root");
		const tagPackage = new EntityTagPackage(packageInstance);

		expect(tagPackage.detectTagPrefix("v1.0.0")).toBe("v");
		expect(tagPackage.detectTagPrefix("v2.1.3")).toBe("v");
		expect(tagPackage.detectTagPrefix("v0.0.1")).toBe("v");
	});

	test("should detect tag prefix for package-specific tags", () => {
		const packageInstance = new EntityPackages("api");
		const tagPackage = new EntityTagPackage(packageInstance);

		expect(tagPackage.detectTagPrefix("api-v1.0.0")).toBe("api-v");
		expect(tagPackage.detectTagPrefix("intershell-v2.1.3")).toBe("intershell-v");
		expect(tagPackage.detectTagPrefix("ui-v0.0.1")).toBe("ui-v");
	});

	test("should return undefined for invalid tag formats", () => {
		const packageInstance = new EntityPackages("api");
		const tagPackage = new EntityTagPackage(packageInstance);

		expect(tagPackage.detectTagPrefix("1.0.0")).toBeUndefined();
		expect(tagPackage.detectTagPrefix("invalid")).toBeUndefined();
		expect(tagPackage.detectTagPrefix("")).toBeUndefined();
	});

	test("should compare versions correctly", () => {
		const packageInstance = new EntityPackages("api");
		const tagPackage = new EntityTagPackage(packageInstance);

		expect(tagPackage.compareVersions("1.0.0", "1.0.1")).toBe(-1);
		expect(tagPackage.compareVersions("1.0.1", "1.0.0")).toBe(1);
		expect(tagPackage.compareVersions("1.0.0", "1.0.0")).toBe(0);
		expect(tagPackage.compareVersions("2.0.0", "1.9.9")).toBe(1);
		expect(tagPackage.compareVersions("1.0.0", "2.0.0")).toBe(-1);
	});

	test("should handle version comparison with different lengths", () => {
		const packageInstance = new EntityPackages("api");
		const tagPackage = new EntityTagPackage(packageInstance);

		expect(tagPackage.compareVersions("1.0", "1.0.0")).toBe(0);
		expect(tagPackage.compareVersions("1.0.0", "1.0")).toBe(0);
		expect(tagPackage.compareVersions("1", "1.0.0")).toBe(0);
	});

	test("should handle version comparison edge cases", () => {
		const packageInstance = new EntityPackages("api");
		const tagPackage = new EntityTagPackage(packageInstance);

		expect(tagPackage.compareVersions("0.0.0", "0.0.1")).toBe(-1);
		expect(tagPackage.compareVersions("0.1.0", "0.0.9")).toBe(1);
		expect(tagPackage.compareVersions("1.0.0", "0.9.9")).toBe(1);
	});
});
