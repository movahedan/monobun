import { describe, expect, mock, test } from "bun:test";

describe("Config", () => {
	// Common mock setup for dependencies
	const setupMocks = async () => {
		// Mock EntityPackages methods
		const { EntityPackages } = await import("../packages");
		EntityPackages.prototype.readJson = mock(() => ({
			name: "test-package",
			version: "1.0.0",
		}));

		return { EntityPackages };
	};

	test("should have default commit configuration", async () => {
		await setupMocks();
		const { getEntitiesConfig } = await import("./config");
		const config = getEntitiesConfig().getConfig();

		expect(config.commit.conventional.type?.list).toBeDefined();
		expect(config.commit.conventional.type?.list?.length).toBeGreaterThan(0);
		expect(config.commit.staged).toBeDefined();
		expect(config.commit.staged?.length).toBeGreaterThan(0);
	});

	test("should have default branch configuration", async () => {
		await setupMocks();
		const { getEntitiesConfig } = await import("./config");
		const config = getEntitiesConfig().getConfig();

		expect(config.branch.defaultBranch).toBe("main");
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

	test("should have default tag configuration", async () => {
		await setupMocks();
		const { getEntitiesConfig } = await import("./config");
		const config = getEntitiesConfig().getConfig();

		expect(config.tag.name.enabled).toBe(true);
		expect(config.tag.name.minLength).toBe(1);
		expect(config.tag.name.maxLength).toBe(100);
		expect(config.tag.name.noSpaces).toBe(true);
		expect(config.tag.name.noSpecialChars).toBe(false);
	});

	test("should merge custom commit configuration", async () => {
		await setupMocks();
		const { getEntitiesConfig } = await import("./config");

		// Mock custom config as a JSON string (as expected by PackageJson interface)
		const customConfig = {
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
			},
		};

		// Mock EntityPackages to return custom config
		const { EntityPackages } = await import("../packages");
		EntityPackages.prototype.readJson = mock(() => ({
			name: "test-package",
			version: "1.0.0",
			intershell: {
				config: JSON.stringify(customConfig),
			},
		}));

		const config = getEntitiesConfig().getConfig();
		expect(config.commit.conventional.type?.list?.[0]?.type).toBe("feat");
		expect(config.commit.conventional.type?.list?.[0]?.emoji).toBe("🚀");
	});

	test("should validate branch name regex pattern", async () => {
		await setupMocks();
		const { getEntitiesConfig } = await import("./config");
		const config = getEntitiesConfig().getConfig();
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
