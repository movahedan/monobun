import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { ParsedCommitData } from "../commit";
import { createMockCommit } from "../commit/commit.test";
import { type EntitiesShellMock, mockEntitiesShell } from "../entities.shell.test";
import { EntityVersion } from "./version";

describe("EntityVersion", () => {
	let entityVersion: EntityVersion;
	let mockedEntityPackages: {
		readVersion: ReturnType<typeof mock>;
		getTagSeriesName: ReturnType<typeof mock>;
		getJsonPath: ReturnType<typeof mock>;
	};
	let mockVersionShell: EntitiesShellMock;

	beforeEach(() => {
		// Mock EntityPackages instance methods
		mockedEntityPackages = {
			readVersion: mock(() => "1.0.0"),
			getTagSeriesName: mock(() => "test-v"),
			getJsonPath: mock(() => "packages/test/package.json"),
		};

		mockVersionShell = {
			gitTagList: mock(() => ({
				exitCode: 0,
				text: () => ["test-v1.0.0", "test-v1.1.0"].join("\n"),
			})),
			gitTagInfo: mock(() => ({
				exitCode: 0,
				text: () => ["2024-01-01T00:00:00Z", "test message"].join("\n"),
			})),
			gitRevParse: mock(() => ({ exitCode: 0, text: () => "abc123" })),
			gitShowPackageJsonAtTag: mock(() => ({ exitCode: 0, text: () => '{"version": "1.0.0"}' })),
			gitTagExists: mock(() => ({ exitCode: 0, text: () => "test-v1.0.0" })),
		};

		mockEntitiesShell(mockVersionShell);

		// Create a mock EntityPackages constructor that returns our mock instance
		const MockEntityPackages = mock(() => mockedEntityPackages);

		// Mock the packages module to return our mock constructor
		mock.module("../packages", () => ({
			EntityPackages: MockEntityPackages,
		}));

		entityVersion = new EntityVersion("test-package");
	});

	describe("constructor", () => {
		test("should create instance with package name", () => {
			const version = new EntityVersion("test-package");
			expect(version).toBeInstanceOf(EntityVersion);
		});
	});

	describe("getCurrentVersion", () => {
		test("should return version when available", async () => {
			mockedEntityPackages.readVersion.mockReturnValue("1.0.0");

			const version = await entityVersion.getCurrentVersion();
			expect(version).toBe("1.0.0");
		});

		test("should throw error when no version found", async () => {
			mockedEntityPackages.readVersion.mockReturnValue(undefined);

			expect(entityVersion.getCurrentVersion()).rejects.toThrow(
				"No version found for package test-package",
			);
		});
	});

	describe("getNextVersion", () => {
		test("should calculate major version correctly", async () => {
			mockedEntityPackages.readVersion.mockReturnValue("1.0.0");

			const nextVersion = await entityVersion.getNextVersion("major");
			expect(nextVersion).toBe("2.0.0");
		});

		test("should calculate minor version correctly", async () => {
			mockedEntityPackages.readVersion.mockReturnValue("1.0.0");

			const nextVersion = await entityVersion.getNextVersion("minor");
			expect(nextVersion).toBe("1.1.0");
		});

		test("should calculate patch version correctly", async () => {
			mockedEntityPackages.readVersion.mockReturnValue("1.0.0");

			const nextVersion = await entityVersion.getNextVersion("patch");
			expect(nextVersion).toBe("1.0.1");
		});

		test("should handle invalid version format", async () => {
			mockedEntityPackages.readVersion.mockReturnValue("invalid");

			await expect(entityVersion.getNextVersion("patch")).rejects.toThrow(
				"Invalid version: invalid",
			);
		});
	});

	describe("calculateBumpType", () => {
		test("should return major for breaking changes", async () => {
			const mockCommits: ParsedCommitData[] = [
				createMockCommit({
					message: { type: "feat", isBreaking: true },
					files: ["test.ts"],
				}),
			];

			const bumpType = await entityVersion.calculateBumpType(mockCommits);
			expect(bumpType).toBe("major");
		});

		test("should return minor for feature commits", async () => {
			const mockCommits: ParsedCommitData[] = [
				createMockCommit({ message: { type: "feat" }, files: ["test.ts"] }),
			];

			const bumpType = await entityVersion.calculateBumpType(mockCommits);
			expect(bumpType).toBe("minor");
		});

		test("should return patch for other commits", async () => {
			const mockCommits: ParsedCommitData[] = [
				createMockCommit({ message: { type: "fix" }, files: ["test.ts"] }),
			];

			const bumpType = await entityVersion.calculateBumpType(mockCommits);
			expect(bumpType).toBe("patch");
		});
	});

	describe("root package bump logic", () => {
		beforeEach(() => {
			entityVersion = new EntityVersion("root");
		});

		test("should return major for workspace-level breaking changes", async () => {
			const mockCommits: ParsedCommitData[] = [
				createMockCommit({ message: { type: "feat", isBreaking: true }, files: [".gitignore"] }),
			];

			const bumpType = await entityVersion.calculateBumpType(mockCommits);
			expect(bumpType).toBe("major");
		});

		test("should return minor for app-level breaking changes", async () => {
			const mockCommits: ParsedCommitData[] = [
				createMockCommit({
					message: { type: "feat", isBreaking: true },
					files: ["apps/test/src/app/page.tsx"],
				}),
			];

			const bumpType = await entityVersion.calculateBumpType(mockCommits);
			expect(bumpType).toBe("minor");
		});

		test("should return minor for workspace-level features", async () => {
			const mockCommits: ParsedCommitData[] = [
				createMockCommit({ message: { type: "feat" }, files: ["turbo.json"] }),
			];

			const bumpType = await entityVersion.calculateBumpType(mockCommits);
			expect(bumpType).toBe("minor");
		});

		test("should return patch for internal dependency changes", async () => {
			const mockCommits: ParsedCommitData[] = [
				createMockCommit({ message: { type: "fix" }, files: ["packages/test/src/index.ts"] }),
			];

			const bumpType = await entityVersion.calculateBumpType(mockCommits);
			expect(bumpType).toBe("patch");
		});
	});

	describe("version history methods", () => {
		beforeEach(() => {
			mockedEntityPackages.getTagSeriesName.mockReturnValue("test-v");
		});

		test("should get package version history", async () => {
			const history = await entityVersion.getPackageVersionHistory();
			expect(history.packageName).toBe("test-package");
			expect(history.versions).toBeDefined();
		});

		test("should get latest package version in history", async () => {
			const latestVersion = await entityVersion.getLatestPackageVersionInHistory();
			expect(latestVersion).toBeDefined();
		});

		test("should check if package version exists in history", async () => {
			const exists = await entityVersion.packageVersionExistsInHistory("1.0.0");
			expect(typeof exists).toBe("boolean");
		});
	});

	describe("git operations", () => {
		test("should list tags with prefix", async () => {
			const tags = await entityVersion.listTags("test-v");
			expect(tags).toEqual(["test-v1.0.0", "test-v1.1.0"]);
		});

		test("should get tag info", async () => {
			mockVersionShell.gitTagInfo?.mockResolvedValue({
				exitCode: 0,
				text: () => "2024-01-01T00:00:00Z\ntest message",
			});

			const tagInfo = await entityVersion.getTagInfo("test-v1.0.0");
			expect(tagInfo.date).toBe("2024-01-01T00:00:00Z");
			expect(tagInfo.message).toBe("test message");
		});

		test("should get tag SHA", async () => {
			mockVersionShell.gitRevParse?.mockResolvedValue({
				exitCode: 0,
				text: () => "abc123",
			});

			const sha = await entityVersion.getTagSha("test-v1.0.0");
			expect(sha).toBe("abc123");
		});

		test("should check if tag exists", async () => {
			mockVersionShell.gitTagExists?.mockResolvedValue({
				exitCode: 0,
				text: () => "test-v1.0.0",
			});

			const exists = await entityVersion.tagExists("test-v1.0.0");
			expect(exists).toBe(true);
		});
	});

	describe("utility methods", () => {
		test("should compare versions correctly", () => {
			expect(entityVersion.compareVersions("1.0.0", "2.0.0")).toBeLessThan(0);
			expect(entityVersion.compareVersions("2.0.0", "1.0.0")).toBeGreaterThan(0);
			expect(entityVersion.compareVersions("1.0.0", "1.0.0")).toBe(0);
		});

		test("should extract version from tag", () => {
			mockedEntityPackages.getTagSeriesName.mockReturnValue("test-v");

			const version = entityVersion.getVersionFromTag("test-v1.2.3");
			expect(version).toBe("1.2.3");
		});

		test("should handle tag without version", () => {
			mockedEntityPackages.getTagSeriesName.mockReturnValue("test-v");

			const version = entityVersion.getVersionFromTag("invalid-tag");
			expect(version).toBe("");
		});
	});

	describe("version data calculation", () => {
		test("should calculate version data for commits", async () => {
			const mockCommits: ParsedCommitData[] = [
				createMockCommit({ message: { type: "feat" }, files: ["test.ts"] }),
			];

			const versionData = await entityVersion.calculateVersionData("1.0.0", mockCommits);
			expect(versionData.currentVersion).toBe("1.0.0");
			expect(versionData.shouldBump).toBeDefined();
			expect(versionData.bumpType).toBeDefined();
		});
	});
});
