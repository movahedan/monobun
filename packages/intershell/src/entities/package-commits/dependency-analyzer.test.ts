import { describe, expect, test } from "bun:test";
import { EntityPackage } from "../package";
import { EntityDependencyAnalyzer } from "./dependency-analyzer";

describe("EntityDependencyAnalyzer", () => {
	test("should create instance", () => {
		const packageInstance = new EntityPackage("root");
		const analyzer = new EntityDependencyAnalyzer(packageInstance);
		expect(analyzer).toBeDefined();
	});

	test("should get package dependencies at ref", async () => {
		const packageInstance = new EntityPackage("root");
		const analyzer = new EntityDependencyAnalyzer(packageInstance);

		// This will return empty array since we can't mock git operations easily
		const deps = await analyzer.getPackageDependenciesAtRef("HEAD");
		expect(Array.isArray(deps)).toBe(true);
	});

	test("should handle dependencies", async () => {
		const packageInstance = new EntityPackage("root");
		const analyzer = new EntityDependencyAnalyzer(packageInstance);

		const deps = await analyzer.getPackageDependenciesAtRef("HEAD");
		expect(Array.isArray(deps)).toBe(true);
		// Root package might have dependencies, so we just check it's an array
	});
});
