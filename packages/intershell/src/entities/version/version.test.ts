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

	describe("utility methods", () => {
		test("should compare versions correctly", () => {
			expect(entityVersion.compareVersions("1.0.0", "2.0.0")).toBeLessThan(0);
			expect(entityVersion.compareVersions("2.0.0", "1.0.0")).toBeGreaterThan(0);
			expect(entityVersion.compareVersions("1.0.0", "1.0.0")).toBe(0);
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
