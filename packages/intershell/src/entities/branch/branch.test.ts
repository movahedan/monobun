import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { $ } from "bun";
import type { IConfig } from "../config/types";
import { EntityBranch } from "./branch";
import type { ParsedBranch } from "./types";

// Mock the entitiesConfig module
const mockEntitiesConfig = {
	getConfig: mock(() => ({
		branch: {
			defaultBranch: "main",
			prefixes: ["feature", "bugfix", "hotfix"],
			name: {
				minLength: 3,
				maxLength: 50,
				allowedCharacters: /^[a-zA-Z0-9\-_/]+$/,
				noConsecutiveSeparators: true,
				noLeadingTrailingSeparators: true,
			},
		},
	})),
};

// Mock the config module
mock.module("../config/config", () => ({
	entitiesConfig: mockEntitiesConfig,
}));

type BranchConfig = IConfig["branch"];

describe("EntityBranch", () => {
	let branch: InstanceType<typeof EntityBranch>;
	let mockConfig: BranchConfig;

	beforeEach(() => {
		mockConfig = {
			defaultBranch: "main",
			prefixes: ["feature", "bugfix", "hotfix"],
			name: {
				minLength: 3,
				maxLength: 50,
				allowedCharacters: /^[a-zA-Z0-9\-_/]+$/,
				noConsecutiveSeparators: true,
				noLeadingTrailingSeparators: true,
			},
		};

		// Set up the mock config
		mockEntitiesConfig.getConfig.mockReturnValue({
			branch: mockConfig,
		});

		branch = new EntityBranch();
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
				const result = new EntityBranch().parseByName(input);
				expect(result).toEqual(expected);
			});
		});
	});

	describe("getCurrentBranch", () => {
		// keep the trailing space to test the trim() function
		const mockCurrentBranch = "test-branch ";

		beforeEach(async () => {
			// Import and mock entitiesShell methods directly
			const { entitiesShell } = await import("../entities.shell");

			// Mock gitBranchShowCurrent directly
			entitiesShell.gitBranchShowCurrent = mock(
				() =>
					({
						exitCode: 0,
						text: () => mockCurrentBranch,
					}) as unknown as $.ShellPromise,
			);
		});

		it("should handle git command and return trimmed output", async () => {
			const result = await branch.getCurrentBranch();
			expect(result).toBe(mockCurrentBranch.trim());
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
						mockEntitiesConfig.getConfig.mockReturnValue({
							branch: {
								...mockConfig,
								prefixes: [] as string[],
							},
						} as IConfig);
						return new EntityBranch();
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
					mockEntitiesConfig.getConfig.mockReturnValue({
						branch: {
							...mockConfig,
							name: {
								...mockConfig.name,
								minLength: 0,
								maxLength: 0,
							},
						},
					} as IConfig);
					return new EntityBranch();
				},
				input: "a",
				expected: "branch name should have a name",
			},
			{
				name: "should handle config with no character restrictions",
				setup: () => {
					mockEntitiesConfig.getConfig.mockReturnValue({
						branch: {
							...mockConfig,
							name: {
								...mockConfig.name,
								allowedCharacters: /.*/,
							},
						},
					} as IConfig);
					return new EntityBranch();
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
