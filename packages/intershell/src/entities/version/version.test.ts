import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { $ } from "bun";
import type { ParsedCommitData } from "../commit";
import type { PackageJson } from "../packages/types";

// Mock setup and cleanup
let originalPackagesShellReadJsonFile: ((filePath: string) => PackageJson) | undefined;

async function setupMocks() {
	const { packagesShell } = await import("../packages/packages.shell");
	if (!originalPackagesShellReadJsonFile) {
		originalPackagesShellReadJsonFile = packagesShell.readJsonFile;
	}
	if (!originalPackagesShellReadJsonFile) {
		originalPackagesShellReadJsonFile = packagesShell.readJsonFile;
	}

	// Mock packagesShell.readJsonFile to prevent file reading errors
	packagesShell.readJsonFile = mock(() => ({ name: "api", version: "1.0.0" }));

	// Mock entitiesShell methods
	const { entitiesShell } = await import("../entities.shell");
	entitiesShell.gitTagList = mock(
		() =>
			({
				exitCode: 0,
				text: () => ["api-v1.0.0", "api-v1.1.0"].join("\n"),
			}) as unknown as $.ShellPromise,
	);
	entitiesShell.gitTagInfo = mock(
		() =>
			({
				exitCode: 0,
				text: () => ["2024-01-01T00:00:00Z", "api message"].join("\n"),
			}) as unknown as $.ShellPromise,
	);
	entitiesShell.gitRevParse = mock(
		() =>
			({
				exitCode: 0,
				text: () => "abc123",
			}) as unknown as $.ShellPromise,
	);
	entitiesShell.gitTagExists = mock(
		() =>
			({
				exitCode: 0,
				text: () => "api-v1.0.0",
			}) as unknown as $.ShellPromise,
	);
	entitiesShell.gitMergeBaseIsAncestor = mock(
		() =>
			({
				exitCode: 0,
				text: () => "true",
			}) as unknown as $.ShellPromise,
	);
	entitiesShell.gitLogHashes = mock(
		() =>
			({
				exitCode: 0,
				text: () => "commit1\ncommit2",
			}) as unknown as $.ShellPromise,
	);
	entitiesShell.gitShow = mock(
		() =>
			({
				exitCode: 0,
				text: () => "abc123\nAuthor: Test User\n2024-01-01T00:00:00Z\nTest commit\n\nBody content",
			}) as unknown as $.ShellPromise,
	);
	entitiesShell.gitShowNameOnly = mock(
		() =>
			({
				exitCode: 0,
				text: () => "file1.ts\nfile2.ts",
			}) as unknown as $.ShellPromise,
	);
	entitiesShell.gitStatus = mock(
		() =>
			({
				exitCode: 0,
				text: () => "M  file1.ts\nA  file2.ts",
			}) as unknown as $.ShellPromise,
	);
	entitiesShell.gitDiff = mock(
		() =>
			({
				exitCode: 0,
				text: () => "+new line\n-old line",
			}) as unknown as $.ShellPromise,
	);
}

async function cleanupMocks() {
	const { packagesShell } = await import("../packages/packages.shell");
	if (originalPackagesShellReadJsonFile) {
		packagesShell.readJsonFile = originalPackagesShellReadJsonFile;
		originalPackagesShellReadJsonFile = undefined;
	}
}

// Helper function to create mock commit data
function createMockCommit(overrides: Partial<ParsedCommitData> = {}): ParsedCommitData {
	const defaultMessage = {
		subject: "test commit",
		type: "feat",
		scopes: [],
		description: "test commit",
		bodyLines: [],
		isMerge: false,
		isBreaking: false,
		isDependency: false,
	};

	return {
		message: {
			...defaultMessage,
			...(overrides.message ? { ...defaultMessage, ...overrides.message } : {}),
		},
		info: {
			hash: "abc123",
			author: "Test User",
			date: "2024-01-01T00:00:00Z",
		},
		pr: undefined,
		files: ["file1.ts", "file2.ts"],
		...overrides,
	};
}

describe("EntityVersion", () => {
	beforeEach(async () => {
		await setupMocks();
	});

	afterEach(async () => {
		await cleanupMocks();
	});

	test("should handle getCommitsInRange for root package", async () => {
		const { EntityVersion } = await import("./version");
		const { EntityCommit } = await import("../commit");
		const { entitiesShell } = await import("../entities.shell");

		const entityVersion = new EntityVersion("root");

		// Mock git log operations for root package
		entitiesShell.gitLogHashes = mock(
			() =>
				({
					exitCode: 0,
					text: () => "commit1\ncommit2",
				}) as unknown as $.ShellPromise,
		);

		// Mock EntityCommit.parseByHash
		const mockParseByHash = mock(() =>
			Promise.resolve(createMockCommit({ info: { hash: "commit1" } })),
		);
		EntityCommit.prototype.parseByHash = mockParseByHash;

		const commits = await entityVersion.getCommitsInRange("abc123", "def456");
		expect(commits).toHaveLength(2);
		expect(mockParseByHash).toHaveBeenCalledTimes(2);

		// Cleanup mocks
		await cleanupMocks();
	});

	test("should handle getCommitsInRange for sub-package", async () => {
		const { EntityVersion } = await import("./version");
		const { EntityCommit } = await import("../commit");
		const { entitiesShell } = await import("../entities.shell");

		const entityVersion = new EntityVersion("api");

		// Mock git log operations for sub-package
		entitiesShell.gitLogHashes = mock(
			() =>
				({
					exitCode: 0,
					text: () => "commit1\ncommit2",
				}) as unknown as $.ShellPromise,
		);

		// Mock EntityCommit.parseByHash
		const mockParseByHash = mock(() =>
			Promise.resolve(createMockCommit({ info: { hash: "commit1" } })),
		);
		EntityCommit.prototype.parseByHash = mockParseByHash;

		const commits = await entityVersion.getCommitsInRange("abc123", "def456");
		expect(commits).toHaveLength(2);
		expect(mockParseByHash).toHaveBeenCalledTimes(2);

		// Cleanup mocks
		await cleanupMocks();
	});

	test("should handle getCommitsInRange with git log failures", async () => {
		const { EntityVersion } = await import("./version");
		const { entitiesShell } = await import("../entities.shell");

		const entityVersion = new EntityVersion("api");

		// Mock git log failure
		entitiesShell.gitLogHashes = mock(
			() =>
				({
					exitCode: 1,
					text: () => "Error",
				}) as unknown as $.ShellPromise,
		);

		const commits = await entityVersion.getCommitsInRange("abc123", "def456");
		expect(commits).toEqual([]);

		// Cleanup mocks
		await cleanupMocks();
	});

	test("should handle getCommitsInRange with merge commits for sub-package", async () => {
		const { EntityVersion } = await import("./version");
		const { EntityCommit } = await import("../commit");
		const { entitiesShell } = await import("../entities.shell");

		const entityVersion = new EntityVersion("api");

		// Mock git log operations
		entitiesShell.gitLogHashes = mock(
			() =>
				({
					exitCode: 0,
					text: () => "commit1\ncommit2",
				}) as unknown as $.ShellPromise,
		);

		// Mock EntityCommit.parseByHash to return merge commits
		const mockParseByHash = mock(() =>
			Promise.resolve(
				createMockCommit({
					info: { hash: "commit1" },
				}),
			),
		);
		EntityCommit.prototype.parseByHash = mockParseByHash;

		const commits = await entityVersion.getCommitsInRange("abc123", "def456");
		expect(commits).toHaveLength(2);

		// Cleanup mocks
		await cleanupMocks();
	});

	test("should handle getCommitsInRange with 0.0.0 from version", async () => {
		const { EntityVersion } = await import("./version");
		const { EntityCommit } = await import("../commit");
		const { entitiesShell } = await import("../entities.shell");

		const entityVersion = new EntityVersion("api");

		// Mock git log operations
		entitiesShell.gitLogHashes = mock(
			() =>
				({
					exitCode: 0,
					text: () => "commit1",
				}) as unknown as $.ShellPromise,
		);

		// Mock EntityCommit.parseByHash
		const mockParseByHash = mock(() =>
			Promise.resolve(createMockCommit({ info: { hash: "commit1" } })),
		);
		EntityCommit.prototype.parseByHash = mockParseByHash;

		const commits = await entityVersion.getCommitsInRange("0.0.0", "def456");
		expect(commits).toHaveLength(1);

		// Cleanup mocks
		await cleanupMocks();
	});

	test("should handle detectTagPrefix method", async () => {
		const { EntityVersion } = await import("./version");

		const entityVersion = new EntityVersion("api");

		const detectTagPrefix = (
			entityVersion as unknown as { detectTagPrefix: (tag: string) => string | undefined }
		).detectTagPrefix.bind(entityVersion);

		expect(detectTagPrefix("v1.0.0")).toBe("v");
		expect(detectTagPrefix("api-v1.0.0")).toBe("api-v");
		expect(detectTagPrefix("intershell-v2.0.0")).toBe("intershell-v");
		expect(detectTagPrefix("1.0.0")).toBeUndefined();
		expect(detectTagPrefix("")).toBeUndefined();
		expect(detectTagPrefix("123.0.0")).toBeUndefined();
	});
});
