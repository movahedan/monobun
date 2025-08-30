import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { restoreBunMocks, setupBunMocks } from "@repo/test-preset/mock-bun";
import type { IConfig } from "../config/types";
import type { ParsedBranch } from "./types";

type BranchConfig = IConfig["branch"];

setupBunMocks();

import { EntityBranch } from "./branch";

describe("EntityBranch", () => {
	let branch: InstanceType<typeof EntityBranch>;
	let mockConfig: BranchConfig;

	beforeEach(() => {
		if (!globalThis.Bun?.$ || globalThis.Bun.$.toString().includes("Mock")) {
			setupBunMocks();
		}

		mockConfig = {
			defaultBranch: "main",
			protectedBranches: ["main", "develop"],
			prefixes: ["feature", "bugfix", "hotfix"],
			name: {
				minLength: 3,
				maxLength: 50,
				allowedCharacters: /^[a-zA-Z0-9\-_/]+$/,
				noConsecutiveSeparators: true,
				noLeadingTrailingSeparators: true,
			},
		};

		branch = new EntityBranch(mockConfig);
	});

	afterEach(() => {
		restoreBunMocks();
		mock.restore();
	});

	describe("static parseByName", () => {
		const parseTestCases = [
			{
				name: "should parse branch name with prefix and name",
				input: "feature/user-authentication",
				expected: {
					prefix: "feature",
					name: "user-authentication",
					fullName: "feature/user-authentication",
				},
			},
			{
				name: "should parse branch name with multiple slashes",
				input: "feature/auth/user-authentication",
				expected: {
					prefix: "feature",
					name: "auth/user-authentication",
					fullName: "feature/auth/user-authentication",
				},
			},
			{
				name: "should parse branch name with only prefix",
				input: "feature",
				expected: {
					prefix: "feature",
					name: "",
					fullName: "feature",
				},
			},
			{
				name: "should parse branch name with no slashes",
				input: "main",
				expected: {
					prefix: "main",
					name: "",
					fullName: "main",
				},
			},
			{
				name: "should handle empty string",
				input: "",
				expected: {
					prefix: "",
					name: "",
					fullName: "",
				},
			},
		];

		parseTestCases.forEach(({ name, input, expected }) => {
			it(name, () => {
				const result = new EntityBranch(mockConfig).parseByName(input);
				expect(result).toEqual(expected);
			});
		});
	});

	describe("getCurrentBranch", () => {
		const getCurrentBranchTests = [
			{
				name: "should return current branch name",
				assertions: (result: string) => {
					expect(typeof result).toBe("string");
					expect(result.length).toBeGreaterThan(0);
				},
			},
			{
				name: "should handle git command and return trimmed output",
				assertions: (result: string) => {
					expect(result).toBe(result.trim());
				},
			},
			{
				name: "should return string from git command",
				assertions: (result: string) => {
					expect(typeof result).toBe("string");
				},
			},
		];

		getCurrentBranchTests.forEach(({ name, assertions }) => {
			it(name, async () => {
				setupBunMocks({
					command: {
						text: "test",
						exitCode: 0,
					},
				});

				const result = await branch.getCurrentBranch();
				assertions(result);

				restoreBunMocks();
			});
		});
	});

	describe("validate", () => {
		describe("with string input", () => {
			const stringInputTests = [
				{
					name: "should validate valid branch name",
					input: "feature/user-auth",
					expected: true as const,
				},
				{
					name: "should validate default branch",
					input: "main",
					expected: true as const,
				},
				{
					name: "should validate branch without prefixes when prefixes array is empty",
					input: "any-branch-name",
					setup: () => {
						const configWithoutPrefixes: BranchConfig = {
							...mockConfig,
							prefixes: [],
						};
						return new EntityBranch(configWithoutPrefixes);
					},
					expected: true as const,
				},
			];

			stringInputTests.forEach(({ name, input, setup, expected }) => {
				it(name, () => {
					const testBranch = setup ? setup() : branch;
					const result = testBranch.validate(input);
					expect(result).toBe(expected);
				});
			});
		});

		describe("with ParsedBranch input", () => {
			const parsedBranchTests = [
				{
					name: "should validate valid parsed branch",
					input: {
						prefix: "feature",
						name: "user-auth",
						fullName: "feature/user-auth",
					} as ParsedBranch,
					expected: true as const,
				},
				{
					name: "should validate default branch when parsed",
					input: {
						prefix: "main",
						name: "",
						fullName: "main",
					} as ParsedBranch,
					expected: true as const,
				},
			];

			parsedBranchTests.forEach(({ name, input, expected }) => {
				it(name, () => {
					const result = branch.validate(input);
					expect(result).toBe(expected);
				});
			});
		});

		describe("validation rules", () => {
			const validationRuleTests = [
				{
					name: "should reject empty branch name",
					input: "",
					expected: "branch name is empty",
				},
				{
					name: "should reject branch name shorter than minLength",
					input: "ab",
					expected: "branch name should be at least 3 characters long",
				},
				{
					name: "should reject branch name longer than maxLength",
					input: "a".repeat(51),
					expected: "branch name should be max 50 characters, received: 51",
				},
				{
					name: "should reject branch name with invalid characters",
					input: "feature/user@auth",
					expected:
						"branch name can only contain letters, numbers, hyphens, underscores, and forward slashes",
				},
				{
					name: "should reject branch name with consecutive separators",
					input: "feature--user-auth",
					expected: "branch name should not have consecutive separators",
				},
				{
					name: "should reject branch name with leading separator",
					input: "-feature/user-auth",
					expected: "branch name should not start or end with separators",
				},
				{
					name: "should reject branch name with trailing separator",
					input: "feature/user-auth-",
					expected: "branch name should not start or end with separators",
				},
				{
					name: "should reject branch name without prefix when prefixes are required",
					input: "user-auth",
					expected: "branch name should have a name",
				},
				{
					name: "should reject branch name with prefix but no name",
					input: "feature",
					expected: "branch name should have a name",
				},
			];

			validationRuleTests.forEach(({ name, input, expected }) => {
				it(name, () => {
					const result = branch.validate(input);
					expect(result).toBe(expected);
				});
			});
		});

		describe("edge cases", () => {
			const edgeCaseTests = [
				{
					name: "should handle branch names with only separators",
					input: "---",
					expected: "branch name should not have consecutive separators",
				},
				{
					name: "should handle branch names with mixed separators",
					input: "feature_-user",
					expected: "branch name should not have consecutive separators",
				},
				{
					name: "should handle very long branch names",
					input: "a".repeat(100),
					expected: "branch name should be max 50 characters, received: 100",
				},
				{
					name: "should handle branch names with special characters",
					input: "feature/user#auth",
					expected:
						"branch name can only contain letters, numbers, hyphens, underscores, and forward slashes",
				},
			];

			edgeCaseTests.forEach(({ name, input, expected }) => {
				it(name, () => {
					const result = branch.validate(input);
					expect(result).toBe(expected);
				});
			});
		});
	});

	describe("constructor and configuration", () => {
		it("should create instance with provided config", () => {
			expect(branch).toBeInstanceOf(EntityBranch);
		});

		const configTests = [
			{
				name: "should handle config with no length restrictions",
				setup: () => {
					const configWithoutLength: BranchConfig = {
						...mockConfig,
						name: {
							...mockConfig.name,
							minLength: 0,
							maxLength: 0,
						},
					};
					return new EntityBranch(configWithoutLength);
				},
				input: "a",
				expected: "branch name should have a name",
			},
			{
				name: "should handle config with no character restrictions",
				setup: () => {
					const configWithoutChars: BranchConfig = {
						...mockConfig,
						name: {
							...mockConfig.name,
							allowedCharacters: /.*/,
						},
					};
					return new EntityBranch(configWithoutChars);
				},
				input: "feature/user@auth",
				expected: true as const,
			},
		];

		configTests.forEach(({ name, setup, input, expected }) => {
			it(name, () => {
				const testBranch = setup();
				const result = testBranch.validate(input);
				expect(result).toBe(expected);
			});
		});
	});
});
