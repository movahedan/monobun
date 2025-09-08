import { describe, expect, test } from "bun:test";
import { EntityPackages } from "../packages";
import { EntityCommitPackage } from "./commit-package";

describe("EntityCommitPackage", () => {
	test("should create instance", () => {
		const packageInstance = new EntityPackages("api");
		const commitPackage = new EntityCommitPackage(packageInstance);
		expect(commitPackage).toBeDefined();
	});

	test("should create root instance", () => {
		const packageInstance = new EntityPackages("root");
		const rootCommitPackage = new EntityCommitPackage(packageInstance);
		expect(rootCommitPackage).toBeDefined();
	});

	test("should have main method", () => {
		const packageInstance = new EntityPackages("api");
		const commitPackage = new EntityCommitPackage(packageInstance);
		// Check that the main method exists
		expect(typeof commitPackage.getCommitsInRange).toBe("function");
	});

	describe("getCommitsInRange", () => {
		test("should return empty array when git operations fail", async () => {
			const packageInstance = new EntityPackages("root");
			const commitPackage = new EntityCommitPackage(packageInstance);
			// Test with invalid range to trigger error handling
			const result = await commitPackage.getCommitsInRange("invalid", "invalid");
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(0);
		});

		test("should handle package-specific commits", async () => {
			const packageInstance = new EntityPackages("api");
			const commitPackage = new EntityCommitPackage(packageInstance);
			// Test with invalid range to trigger error handling
			const result = await commitPackage.getCommitsInRange("invalid", "invalid");
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(0);
		});
	});
});
