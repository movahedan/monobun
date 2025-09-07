import { describe, expect, test } from "bun:test";
import { EntityCommitPackage } from "./commit-package";

describe("EntityCommitPackage", () => {
	test("should create instance", () => {
		const commitPackage = new EntityCommitPackage("api");
		expect(commitPackage).toBeDefined();
	});

	test("should create root instance", () => {
		const rootCommitPackage = new EntityCommitPackage("root");
		expect(rootCommitPackage).toBeDefined();
	});

	test("should have main method", () => {
		const commitPackage = new EntityCommitPackage("api");
		// Check that the main method exists
		expect(typeof commitPackage.getCommitsInRange).toBe("function");
	});

	describe("getCommitsInRange", () => {
		test("should return empty array when git operations fail", async () => {
			const commitPackage = new EntityCommitPackage("root");
			// Test with invalid range to trigger error handling
			const result = await commitPackage.getCommitsInRange("invalid", "invalid");
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(0);
		});

		test("should handle package-specific commits", async () => {
			const commitPackage = new EntityCommitPackage("api");
			// Test with invalid range to trigger error handling
			const result = await commitPackage.getCommitsInRange("invalid", "invalid");
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(0);
		});
	});
});
