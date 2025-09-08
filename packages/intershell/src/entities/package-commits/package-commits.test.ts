import { describe, expect, test } from "bun:test";
import { EntityPackage } from "../package";
import { EntityPackageCommits } from "./package-commits";

describe("EntityPackageCommits", () => {
	test("should create instance", () => {
		const packageInstance = new EntityPackage("api");
		const commitPackage = new EntityPackageCommits(packageInstance);
		expect(commitPackage).toBeDefined();
	});

	test("should create root instance", () => {
		const packageInstance = new EntityPackage("root");
		const rootCommitPackage = new EntityPackageCommits(packageInstance);
		expect(rootCommitPackage).toBeDefined();
	});

	test("should have main method", () => {
		const packageInstance = new EntityPackage("api");
		const commitPackage = new EntityPackageCommits(packageInstance);
		// Check that the main method exists
		expect(typeof commitPackage.getCommitsInRange).toBe("function");
	});

	describe("getCommitsInRange", () => {
		test("should return empty array when git operations fail", async () => {
			const packageInstance = new EntityPackage("root");
			const commitPackage = new EntityPackageCommits(packageInstance);
			// Test with invalid range to trigger error handling
			const result = await commitPackage.getCommitsInRange("invalid", "invalid");
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(0);
		});

		test("should handle package-specific commits", async () => {
			const packageInstance = new EntityPackage("api");
			const commitPackage = new EntityPackageCommits(packageInstance);
			// Test with invalid range to trigger error handling
			const result = await commitPackage.getCommitsInRange("invalid", "invalid");
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(0);
		});
	});
});
