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
			const { entitiesConfig } = await import("./config");
			const config = entitiesConfig.getConfig();

			expect(config.commit.conventional).toEqual([]);
			expect(config.commit.staged).toEqual([]);
		});

		it("should have default branch configuration", async () => {
			const { entitiesConfig } = await import("./config");
			const config = entitiesConfig.getConfig();

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
			const { entitiesConfig } = await import("./config");
			const config = entitiesConfig.getConfig();

			expect(config.tag).toEqual([]);
		});

		it("should have default branch name validation rules", async () => {
			const { entitiesConfig } = await import("./config");
			const config = entitiesConfig.getConfig();

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
					conventional: ["feat", "fix"],
					staged: ["*.ts", "*.tsx"],
				},
			};

			// Test the Config class directly instead of entitiesConfig
			const { Config } = await import("./config");
			const config = new Config(customConfig);
			const result = config.getConfig();

			expect(result.commit.conventional).toEqual(["feat", "fix"]);
			expect(result.commit.staged).toEqual(["*.ts", "*.tsx"]);
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
			expect(config.commit.conventional).toEqual([]);
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
			expect(config.commit.conventional).toEqual([]);
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

			expect(result).toEqual(defaultConfig);
		});

		it("should merge custom config when provided", async () => {
			// Import the Config class and default config
			const { Config } = await import("./config");

			const customConfig: CustomConfigJson = {
				commit: {
					conventional: ["feat", "fix"],
					staged: ["*.ts", "*.tsx"],
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
			expect(result.commit.conventional).toEqual(["feat", "fix"]);
			expect(result.commit.staged).toEqual(["*.ts", "*.tsx"]);
			expect(result.branch.defaultBranch).toBe("develop");
			expect(result.branch.protectedBranches).toEqual(["main"]);
			expect(result.tag).toEqual(["v1.0.0", "v1.0.1"]);
		});
	});
});
