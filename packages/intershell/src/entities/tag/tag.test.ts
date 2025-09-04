import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { $ } from "bun";

// Mock all dependencies before any imports to avoid circular dependencies
mock.module("../config/config", () => ({
	getEntitiesConfig: () => ({
		getConfig: () => ({
			tag: {
				name: {
					enabled: true,
					minLength: 1,
					maxLength: 100,
					allowedCharacters: /^[a-zA-Z0-9\-_.]+$/,
					noSpaces: true,
					noSpecialChars: true,
				},
			},
		}),
	}),
}));

// Now import EntityTag after all mocks are in place
const { EntityTag } = await import("./tag");

describe("EntityTag", () => {
	// Store original methods to restore after tests
	let originalGitTagList: (prefix: string) => $.ShellPromise;
	let originalGitTagLatest: (prefix: string) => $.ShellPromise;
	let originalGitRevParse: (ref: string) => $.ShellPromise;
	let originalGitTagExists: (tagName: string) => $.ShellPromise;
	let originalGitTag: (
		tagName: string,
		message: string,
		options: { force?: string },
	) => $.ShellPromise;
	let originalGitPushTag: (tagName: string) => $.ShellPromise;
	let originalGitDeleteTag: (tagName: string) => $.ShellPromise;
	let originalGitTagInfo: (tagName: string) => $.ShellPromise;
	let originalGitFirstCommit: () => $.ShellPromise;

	beforeEach(async () => {
		// Import and mock entitiesShell methods directly
		const { entitiesShell } = await import("../entities.shell");

		// Store original methods if not already stored
		if (!originalGitTagList) {
			originalGitTagList = entitiesShell.gitTagList;
		}
		if (!originalGitTagLatest) {
			originalGitTagLatest = entitiesShell.gitTagLatest;
		}
		if (!originalGitRevParse) {
			originalGitRevParse = entitiesShell.gitRevParse;
		}
		if (!originalGitTagExists) {
			originalGitTagExists = entitiesShell.gitTagExists;
		}
		if (!originalGitTag) {
			originalGitTag = entitiesShell.gitTag;
		}
		if (!originalGitPushTag) {
			originalGitPushTag = entitiesShell.gitPushTag;
		}
		if (!originalGitDeleteTag) {
			originalGitDeleteTag = entitiesShell.gitDeleteTag;
		}
		if (!originalGitTagInfo) {
			originalGitTagInfo = entitiesShell.gitTagInfo;
		}
		if (!originalGitFirstCommit) {
			originalGitFirstCommit = entitiesShell.gitFirstCommit;
		}

		// Mock individual methods directly
		entitiesShell.gitTagList = mock(
			() =>
				({
					exitCode: 0,
					text: () => ["v1.0.0", "v1.1.0", "intershell-v1.0.0"].join("\n"),
				}) as unknown as $.ShellPromise,
		);

		entitiesShell.gitTagLatest = mock(
			() =>
				({
					exitCode: 0,
					text: () => "v1.1.0",
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
					text: () => "v1.0.0",
				}) as unknown as $.ShellPromise,
		);

		entitiesShell.gitTag = mock(() => Promise.resolve() as unknown as $.ShellPromise);
		entitiesShell.gitPushTag = mock(() => Promise.resolve() as unknown as $.ShellPromise);
		entitiesShell.gitDeleteTag = mock(() => Promise.resolve() as unknown as $.ShellPromise);

		entitiesShell.gitTagInfo = mock(
			() =>
				({
					exitCode: 0,
					text: () => ["2024-01-01T00:00:00Z", "test message"].join("\n"),
				}) as unknown as $.ShellPromise,
		);

		entitiesShell.gitFirstCommit = mock(
			() =>
				({
					exitCode: 0,
					text: () => "first123",
				}) as unknown as $.ShellPromise,
		);
	});

	afterEach(async () => {
		// Restore original methods
		const { entitiesShell } = await import("../entities.shell");

		if (originalGitTagList) {
			entitiesShell.gitTagList = originalGitTagList;
		}
		if (originalGitTagLatest) {
			entitiesShell.gitTagLatest = originalGitTagLatest;
		}
		if (originalGitRevParse) {
			entitiesShell.gitRevParse = originalGitRevParse;
		}
		if (originalGitTagExists) {
			entitiesShell.gitTagExists = originalGitTagExists;
		}
		if (originalGitTag) {
			entitiesShell.gitTag = originalGitTag;
		}
		if (originalGitPushTag) {
			entitiesShell.gitPushTag = originalGitPushTag;
		}
		if (originalGitDeleteTag) {
			entitiesShell.gitDeleteTag = originalGitDeleteTag;
		}
		if (originalGitTagInfo) {
			entitiesShell.gitTagInfo = originalGitTagInfo;
		}
		if (originalGitFirstCommit) {
			entitiesShell.gitFirstCommit = originalGitFirstCommit;
		}
	});

	describe("parseByName", () => {
		test("should parse tag name correctly", () => {
			const result = EntityTag.parseByName("v1.0.0");
			expect(result).toEqual({
				name: "v1.0.0",
				prefix: "v",
				format: "semver",
			});
		});

		test("should parse tag with package prefix", () => {
			const result = EntityTag.parseByName("intershell-v1.0.0");
			expect(result).toEqual({
				name: "intershell-v1.0.0",
				prefix: "intershell-v",
				format: "custom",
			});
		});

		test("should parse calver tag", () => {
			const result = EntityTag.parseByName("2024.01.01");
			expect(result).toEqual({
				name: "2024.01.01",
				prefix: undefined,
				format: "semver",
			});
		});

		test("should parse custom tag", () => {
			const result = EntityTag.parseByName("release-2024");
			expect(result).toEqual({
				name: "release-2024",
				prefix: "release-",
				format: "custom",
			});
		});

		test("should handle empty tag name", () => {
			const result = EntityTag.parseByName("");
			expect(result).toEqual({
				name: "",
				prefix: undefined,
				format: undefined,
			});
		});
	});

	describe("utility methods", () => {
		describe("detectFormat", () => {
			test("should detect semver format", () => {
				expect(EntityTag.detectFormat("v1.0.0")).toBe("semver");
				expect(EntityTag.detectFormat("1.0.0")).toBe("semver");
			});

			test("should detect calver format", () => {
				expect(EntityTag.detectFormat("2024.01.01")).toBe("semver");
				expect(EntityTag.detectFormat("2024.12.25")).toBe("semver");
			});

			test("should detect custom format", () => {
				expect(EntityTag.detectFormat("release-2024")).toBe("custom");
				expect(EntityTag.detectFormat("beta-v1")).toBe("custom");
			});

			test("should return undefined for empty tag", () => {
				expect(EntityTag.detectFormat("")).toBeFalsy();
			});
		});

		describe("detectPrefix", () => {
			test("should detect v prefix", () => {
				expect(EntityTag.detectPrefix("v1.0.0")).toBe("v");
			});

			test("should detect package prefix", () => {
				expect(EntityTag.detectPrefix("intershell-v1.0.0")).toBe("intershell-v");
			});

			test("should detect custom prefix", () => {
				expect(EntityTag.detectPrefix("release-v1.0.0")).toBe("release-v");
			});

			test("should return undefined for numeric prefix", () => {
				expect(EntityTag.detectPrefix("1.0.0")).toBeFalsy();
			});

			test("should return undefined for empty tag", () => {
				expect(EntityTag.detectPrefix("")).toBeFalsy();
			});
		});

		describe("getVersionFromTag", () => {
			test("should extract version from v prefixed tag", () => {
				expect(EntityTag.getVersionFromTag("v1.0.0")).toBe("1.0.0");
			});

			test("should extract version from package prefixed tag", () => {
				expect(EntityTag.getVersionFromTag("intershell-v1.0.0")).toBe("1.0.0");
			});

			test("should return original tag when no prefix", () => {
				expect(EntityTag.getVersionFromTag("1.0.0")).toBe("1.0.0");
			});

			test("should handle empty prefix", () => {
				expect(EntityTag.getVersionFromTag("v1.0.0")).toBe("1.0.0");
			});
		});
	});
});
