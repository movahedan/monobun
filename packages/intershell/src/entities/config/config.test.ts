import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import type { CustomConfigJson } from "./types";

describe("Config", () => {
	beforeEach(() => {
		mock.module("../packages", () => ({
			EntityPackages: mock(() => ({ readJson: () => ({}) })),
		}));
	});

	afterEach(() => {
		mock.restore();
	});

	describe("default configuration", () => {
		it("should have default commit configuration", async () => {
			const { getEntitiesConfig } = await import("./config");
			const config = getEntitiesConfig().getConfig();

			expect(config.commit.conventional.type?.list).toBeDefined();
			expect(config.commit.conventional.type?.list?.length).toBeGreaterThan(0);
			expect(config.commit.staged).toBeDefined();
			expect(config.commit.staged?.length).toBeGreaterThan(0);
		});

		it("should have default branch configuration", async () => {
			const { getEntitiesConfig } = await import("./config");
			const config = getEntitiesConfig().getConfig();

			expect(config.branch.defaultBranch).toBe("main");
			expect(config.branch.protectedBranches).toEqual(["main"]);
			expect(config.branch.prefixes).toEqual([
				"feature",
				"fix",
				"hotfix",
				"release",
				"docs",
				"refactor",
				"ci",
				"chore",
				"wip",
				"renovate",
			]);
		});

		it("should have default tag configuration", async () => {
			const { getEntitiesConfig } = await import("./config");
			const config = getEntitiesConfig().getConfig();

			expect(config.tag).toEqual([]);
		});

		it("should have default branch name validation rules", async () => {
			const { getEntitiesConfig } = await import("./config");
			const config = getEntitiesConfig().getConfig();

			expect(config.branch.name.minLength).toBe(1);
			expect(config.branch.name.maxLength).toBe(100);
			expect(config.branch.name.allowedCharacters).toBeInstanceOf(RegExp);
			expect(config.branch.name.noConsecutiveSeparators).toBe(true);
			expect(config.branch.name.noLeadingTrailingSeparators).toBe(true);
		});
	});

	describe("custom configuration merging", () => {
		it("should merge custom commit configuration", async () => {
			const customConfig: CustomConfigJson = {
				commit: {
					conventional: {
						type: {
							list: [
								{
									type: "feat",
									label: "Features",
									description: "A new feature",
									category: "features" as const,
									emoji: "🚀",
									badgeColor: "00D4AA",
									breakingAllowed: true,
								},
							],
						},
					},
					staged: [
						{
							filePattern: [/\.ts$/],
							description: "TypeScript files",
						},
					],
				},
			};

			// Test the Config class directly instead of entitiesConfig
			const { Config } = await import("./config");
			const config = new Config(customConfig);
			const result = config.getConfig();

			expect(result.commit.conventional.type?.list).toHaveLength(1);
			expect(result.commit.conventional.type?.list?.[0]?.type).toBe("feat");
			expect(result.commit.staged).toHaveLength(1);
			expect(result.commit.staged?.[0]?.description).toBe("TypeScript files");
		});

		it("should merge custom branch configuration", async () => {
			const customConfig: CustomConfigJson = {
				branch: {
					defaultBranch: "develop",
					protectedBranches: ["main", "develop", "staging"],
					prefixes: ["feature", "bugfix"],
					name: {
						minLength: 5,
						maxLength: 50,
					},
				},
			};

			// Test the Config class directly instead of entitiesConfig
			const { Config } = await import("./config");
			const config = new Config(customConfig);
			const result = config.getConfig();

			expect(result.branch.defaultBranch).toBe("develop");
			expect(result.branch.protectedBranches).toEqual(["main", "develop", "staging"]);
			expect(result.branch.prefixes).toEqual(["feature", "bugfix"]);
			expect(result.branch.name.minLength).toBe(5);
			expect(result.branch.name.maxLength).toBe(50);
		});

		it("should preserve default values for unspecified properties", async () => {
			const customConfig: CustomConfigJson = {
				branch: {
					defaultBranch: "develop",
					// Only override defaultBranch, keep other defaults
				},
			};

			// Test the Config class directly instead of entitiesConfig
			const { Config } = await import("./config");
			const config = new Config(customConfig);
			const result = config.getConfig();

			// Custom value should be applied
			expect(result.branch.defaultBranch).toBe("develop");
			// Default values should be preserved
			expect(result.branch.protectedBranches).toEqual(["main"]);
			expect(result.branch.prefixes).toEqual([
				"feature",
				"fix",
				"hotfix",
				"release",
				"docs",
				"refactor",
				"ci",
				"chore",
				"wip",
				"renovate",
			]);
		});
	});

	describe("configuration file handling", () => {
		it("should handle missing config file gracefully", async () => {
			const { entitiesConfig } = await import("./config");
			const config = entitiesConfig.getConfig();

			// Should fall back to default config
			expect(config.branch.defaultBranch).toBe("main");
			expect(config.commit.conventional.type?.list).toBeDefined();
		});

		it("should handle invalid JSON gracefully", async () => {
			// Mock EntityPackages to return config path
			mock.module("../packages", () => ({
				EntityPackages: mock(() => ({
					readJson: () => ({
						intershell: {
							config: "test-config.json",
						},
					}),
				})),
			}));

			// Mock readFileSync to throw error (invalid JSON)
			mock.module("node:fs", () => ({
				readFileSync: mock(() => {
					throw new Error("Invalid JSON");
				}),
			}));

			const { entitiesConfig } = await import("./config");
			const config = entitiesConfig.getConfig();

			// Should fall back to default config
			expect(config.branch.defaultBranch).toBe("main");
			expect(config.commit.conventional.type?.list).toBeDefined();
		});
	});

	describe("configuration validation", () => {
		it("should validate branch name regex pattern", async () => {
			// Mock the EntityPackages module
			mock.module("../packages", () => ({
				EntityPackages: mock(() => ({
					readJson: () => ({
						// No intershell config
					}),
				})),
			}));

			const { entitiesConfig } = await import("./config");
			const config = entitiesConfig.getConfig();
			const allowedCharacters = config.branch.name.allowedCharacters;

			expect(allowedCharacters).toBeInstanceOf(RegExp);

			// Test valid characters
			expect(allowedCharacters.test("feature-branch")).toBe(true);
			expect(allowedCharacters.test("fix_bug_123")).toBe(true);
			expect(allowedCharacters.test("docs/update-readme")).toBe(true);

			// Test invalid characters
			expect(allowedCharacters.test("feature branch")).toBe(false); // space
			expect(allowedCharacters.test("fix@bug")).toBe(false); // @ symbol
			expect(allowedCharacters.test("docs#update")).toBe(false); // # symbol
		});
	});

	describe("Config class", () => {
		it("should create instance with default config when no custom config provided", async () => {
			// Import the Config class and default config
			const { defaultConfig } = await import("./default");
			const { Config } = await import("./config");

			// Create a new instance without custom config
			const config = new Config();
			const result = config.getConfig();

			// The scopes list will be dynamically populated, so we can't do a direct equality check
			// Instead, check that the structure is correct
			expect(result.branch).toEqual(defaultConfig.branch);
			expect(result.tag).toEqual(defaultConfig.tag);
			expect(result.commit.conventional.type).toEqual(defaultConfig.commit.conventional.type);
			expect(result.commit.conventional.description).toEqual(
				defaultConfig.commit.conventional.description,
			);
			expect(result.commit.conventional.bodyLines).toEqual(
				defaultConfig.commit.conventional.bodyLines,
			);
			expect(result.commit.staged).toEqual(defaultConfig.commit.staged);
			// Check that scopes list exists and has at least one item (root)
			expect(result.commit.conventional.scopes?.list).toBeDefined();
			expect(result.commit.conventional.scopes?.list?.length).toBeGreaterThan(0);
			expect(result.commit.conventional.scopes?.list).toContain("root");
		});

		it("should merge custom config when provided", async () => {
			// Import the Config class and default config
			const { Config } = await import("./config");

			const customConfig: CustomConfigJson = {
				commit: {
					conventional: {
						type: {
							list: [
								{
									type: "feat",
									label: "Features",
									description: "A new feature",
									category: "features" as const,
									emoji: "🚀",
									badgeColor: "00D4AA",
									breakingAllowed: true,
								},
							],
						},
					},
					staged: [
						{
							filePattern: [/\.ts$/],
							description: "TypeScript files",
						},
					],
				},
				branch: {
					defaultBranch: "develop",
				},
				tag: ["v1.0.0", "v1.0.1"],
			};

			// Create a new instance with custom config
			const config = new Config(customConfig);
			const result = config.getConfig();

			// Custom values should be applied
			expect(result.commit.conventional.type?.list).toHaveLength(1);
			expect(result.commit.conventional.type?.list?.[0]?.type).toBe("feat");
			expect(result.commit.staged).toHaveLength(1);
			expect(result.branch.defaultBranch).toBe("develop");
			expect(result.branch.protectedBranches).toEqual(["main"]);
			expect(result.tag).toEqual(["v1.0.0", "v1.0.1"]);
		});
	});
});
