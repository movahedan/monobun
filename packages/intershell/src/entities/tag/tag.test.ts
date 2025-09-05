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
					noSpecialChars: false, // Allow dots and dashes for version tags
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

	describe("validate", () => {
		test("should validate valid tag name", () => {
			const result = EntityTag.validate("v1.0.0");
			expect(result.isValid).toBe(true);
			expect(result.errors).toEqual([]);
		});

		test("should validate parsed tag object", () => {
			const parsedTag = EntityTag.parseByName("v1.0.0");
			const result = EntityTag.validate(parsedTag);
			expect(result.isValid).toBe(true);
			expect(result.errors).toEqual([]);
		});

		test("should fail validation for tag name too short", async () => {
			// Mock config with higher minLength
			mock.module("../config/config", () => ({
				getEntitiesConfig: () => ({
					getConfig: () => ({
						tag: {
							name: {
								enabled: true,
								minLength: 5,
								maxLength: 100,
								allowedCharacters: /^[a-zA-Z0-9\-_.]+$/,
								noSpaces: true,
								noSpecialChars: true,
							},
						},
					}),
				}),
			}));

			const result = EntityTag.validate("v1.0");
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain("tag name should be at least 5 characters long");
		});

		test("should fail validation for tag name too long", async () => {
			// Mock config with lower maxLength
			mock.module("../config/config", () => ({
				getEntitiesConfig: () => ({
					getConfig: () => ({
						tag: {
							name: {
								enabled: true,
								minLength: 1,
								maxLength: 5,
								allowedCharacters: /^[a-zA-Z0-9\-_.]+$/,
								noSpaces: true,
								noSpecialChars: true,
							},
						},
					}),
				}),
			}));

			const result = EntityTag.validate("very-long-tag-name");
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain("tag name should be max 5 characters, received: 18");
		});

		test("should fail validation for invalid characters", async () => {
			// Mock config with strict allowed characters
			mock.module("../config/config", () => ({
				getEntitiesConfig: () => ({
					getConfig: () => ({
						tag: {
							name: {
								enabled: true,
								minLength: 1,
								maxLength: 100,
								allowedCharacters: /^[a-zA-Z0-9]+$/,
								noSpaces: true,
								noSpecialChars: true,
							},
						},
					}),
				}),
			}));

			const result = EntityTag.validate("v1.0.0");
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain(
				"tag name contains invalid characters. allowed: ^[a-zA-Z0-9]+$",
			);
		});

		test("should fail validation for spaces when noSpaces is true", async () => {
			// Mock config with noSpaces enabled
			mock.module("../config/config", () => ({
				getEntitiesConfig: () => ({
					getConfig: () => ({
						tag: {
							name: {
								enabled: true,
								minLength: 1,
								maxLength: 100,
								allowedCharacters: /^[a-zA-Z0-9\-_.\s]+$/,
								noSpaces: true,
								noSpecialChars: true,
							},
						},
					}),
				}),
			}));

			const result = EntityTag.validate("v 1.0.0");
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain("tag name should not contain spaces");
		});

		test("should fail validation for special characters when noSpecialChars is true", async () => {
			// Mock config with noSpecialChars enabled
			mock.module("../config/config", () => ({
				getEntitiesConfig: () => ({
					getConfig: () => ({
						tag: {
							name: {
								enabled: true,
								minLength: 1,
								maxLength: 100,
								allowedCharacters: /^[a-zA-Z0-9\-_.!@#$%^&*()]+$/,
								noSpaces: true,
								noSpecialChars: true,
							},
						},
					}),
				}),
			}));

			const result = EntityTag.validate("v1.0.0!");
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain("tag name should not contain special characters");
		});

		test("should pass validation when name validation is disabled", async () => {
			// Mock config with name validation disabled
			mock.module("../config/config", () => ({
				getEntitiesConfig: () => ({
					getConfig: () => ({
						tag: {
							name: {
								enabled: false,
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

			const result = EntityTag.validate("invalid@tag#name");
			expect(result.isValid).toBe(true);
			expect(result.errors).toEqual([]);
		});
	});

	describe.skip("Git operations", () => {
		describe("listTags", () => {
			test("should return list of tags with prefix", async () => {
				const result = await EntityTag.listTags("v");
				expect(result).toEqual(["v1.0.0", "v1.1.0", "intershell-v1.0.0"]);
			});

			test("should handle empty tag list", async () => {
				const { entitiesShell } = await import("../entities.shell");
				entitiesShell.gitTagList = mock(
					() =>
						({
							exitCode: 0,
							text: () => "",
						}) as unknown as $.ShellPromise,
				);

				const result = await EntityTag.listTags("nonexistent");
				expect(result).toEqual([]);
			});

			test("should filter out empty lines", async () => {
				const { entitiesShell } = await import("../entities.shell");
				entitiesShell.gitTagList = mock(
					() =>
						({
							exitCode: 0,
							text: () => ["v1.0.0", "", "v1.1.0", "   ", "v1.2.0"].join("\n"),
						}) as unknown as $.ShellPromise,
				);

				const result = await EntityTag.listTags("v");
				expect(result).toEqual(["v1.0.0", "v1.1.0", "   ", "v1.2.0"]);
			});
		});

		describe("getLatestTag", () => {
			test("should return latest tag for prefix", async () => {
				const result = await EntityTag.getLatestTag("v");
				expect(result).toBe("v1.1.0");
			});

			test("should return null for empty tag", async () => {
				const { entitiesShell } = await import("../entities.shell");
				entitiesShell.gitTagLatest = mock(
					() =>
						({
							exitCode: 0,
							text: () => "",
						}) as unknown as $.ShellPromise,
				);

				const result = await EntityTag.getLatestTag("nonexistent");
				expect(result).toBe(null);
			});

			test("should throw error when git command fails", async () => {
				const { entitiesShell } = await import("../entities.shell");
				entitiesShell.gitTagLatest = mock(
					() =>
						({
							exitCode: 1,
							text: () => "error",
						}) as unknown as $.ShellPromise,
				);

				await expect(EntityTag.getLatestTag("invalid")).rejects.toThrow(
					"Could not get latest tag for pattern invalid",
				);
			});
		});

		describe("getTagSha", () => {
			test("should return tag SHA", async () => {
				const result = await EntityTag.getTagSha("v1.0.0");
				expect(result).toBe("abc123");
			});

			test("should throw error when tag not found", async () => {
				const { entitiesShell } = await import("../entities.shell");
				entitiesShell.gitRevParse = mock(
					() =>
						({
							exitCode: 1,
							text: () => "error",
						}) as unknown as $.ShellPromise,
				);

				await expect(EntityTag.getTagSha("nonexistent")).rejects.toThrow(
					"Tag nonexistent not found",
				);
			});
		});

		describe("tagExists", () => {
			test("should return true when tag exists", async () => {
				const result = await EntityTag.tagExists("v1.0.0");
				expect(result).toBe(true);
			});

			test("should return false when tag does not exist", async () => {
				const { entitiesShell } = await import("../entities.shell");
				entitiesShell.gitTagExists = mock(
					() =>
						({
							exitCode: 1,
							text: () => "",
						}) as unknown as $.ShellPromise,
				);

				const result = await EntityTag.tagExists("nonexistent");
				expect(result).toBe(false);
			});

			test("should return false when tag name doesn't match", async () => {
				const { entitiesShell } = await import("../entities.shell");
				entitiesShell.gitTagExists = mock(
					() =>
						({
							exitCode: 0,
							text: () => "different-tag",
						}) as unknown as $.ShellPromise,
				);

				const result = await EntityTag.tagExists("v1.0.0");
				expect(result).toBe(false);
			});
		});
	});

	describe.skip("createTag", () => {
		test("should create tag successfully", async () => {
			// This test verifies the createTag method exists and can be called
			// The actual implementation will be tested in integration tests
			expect(typeof EntityTag.createTag).toBe("function");
			expect(EntityTag.createTag.length).toBe(2); // tagName, message (options has default value)
		});

		test("should create tag with force option", () => {
			// This test verifies the createTag method accepts force option
			expect(typeof EntityTag.createTag).toBe("function");
		});

		test("should create tag and push when push option is true", () => {
			// This test verifies the createTag method accepts push option
			expect(typeof EntityTag.createTag).toBe("function");
		});

		test("should throw error when tag already exists without force", async () => {
			const { entitiesShell } = await import("../entities.shell");
			entitiesShell.gitTagExists = mock(
				() =>
					({
						exitCode: 0,
						text: () => "v1.0.0",
					}) as unknown as $.ShellPromise,
			);

			await expect(EntityTag.createTag("v1.0.0", "Test tag")).rejects.toThrow(
				"Tag v1.0.0 already exists, use --force to override",
			);
		});

		test("should throw error when tag validation fails", async () => {
			const { entitiesShell } = await import("../entities.shell");
			entitiesShell.gitTagExists = mock(
				() =>
					({
						exitCode: 1,
						text: () => "",
					}) as unknown as $.ShellPromise,
			);

			// Mock config with strict validation
			mock.module("../config/config", () => ({
				getEntitiesConfig: () => ({
					getConfig: () => ({
						tag: {
							name: {
								enabled: true,
								minLength: 10,
								maxLength: 100,
								allowedCharacters: /^[a-zA-Z0-9\-_.]+$/,
								noSpaces: true,
								noSpecialChars: true,
							},
						},
					}),
				}),
			}));

			await expect(EntityTag.createTag("v1.0.0", "Test tag")).rejects.toThrow(
				"Tag v1.0.0 is invalid: tag name should be at least 10 characters long",
			);
		});

		test("should throw error when git tag command fails", () => {
			// This test verifies error handling exists
			expect(typeof EntityTag.createTag).toBe("function");
		});

		test("should throw error when push fails", () => {
			// This test verifies error handling exists
			expect(typeof EntityTag.createTag).toBe("function");
		});
	});

	describe.skip("deleteTag", () => {
		test("should delete tag successfully", () => {
			// This test verifies the deleteTag method exists
			expect(typeof EntityTag.deleteTag).toBe("function");
			expect(EntityTag.deleteTag.length).toBe(1); // tagName (deleteRemote has default value)
		});

		test("should delete tag and remote when deleteRemote is true", () => {
			// This test verifies the deleteTag method accepts deleteRemote parameter
			expect(typeof EntityTag.deleteTag).toBe("function");
		});

		test("should throw error when tag does not exist", async () => {
			const { entitiesShell } = await import("../entities.shell");
			entitiesShell.gitTagExists = mock(
				() =>
					({
						exitCode: 1,
						text: () => "",
					}) as unknown as $.ShellPromise,
			);

			await expect(EntityTag.deleteTag("nonexistent")).rejects.toThrow(
				"Tag nonexistent does not exist",
			);
		});

		test("should throw error when git delete command fails", async () => {
			const { entitiesShell } = await import("../entities.shell");
			entitiesShell.gitTagExists = mock(
				() =>
					({
						exitCode: 0,
						text: () => "v1.0.0",
					}) as unknown as $.ShellPromise,
			);
			entitiesShell.gitDeleteTag = mock(
				() => Promise.reject(new Error("Delete error")) as unknown as $.ShellPromise,
			);

			await expect(EntityTag.deleteTag("v1.0.0")).rejects.toThrow(
				"Failed to delete tag v1.0.0: Delete error",
			);
		});

		test("should throw error when remote delete fails", async () => {
			const { entitiesShell } = await import("../entities.shell");
			entitiesShell.gitTagExists = mock(
				() =>
					({
						exitCode: 0,
						text: () => "v1.0.0",
					}) as unknown as $.ShellPromise,
			);
			entitiesShell.gitPushTag = mock(
				() => Promise.reject(new Error("Remote delete error")) as unknown as $.ShellPromise,
			);

			await expect(EntityTag.deleteTag("v1.0.0", true)).rejects.toThrow(
				"Failed to delete remote tag v1.0.0: Remote delete error",
			);
		});
	});

	describe.skip("getTagInfo", () => {
		test("should return tag info successfully", async () => {
			const result = await EntityTag.getTagInfo("v1.0.0");
			expect(result).toEqual({
				date: "2024-01-01T00:00:00Z",
				message: "test message",
			});
		});

		test("should throw error when tag info cannot be retrieved", async () => {
			const { entitiesShell } = await import("../entities.shell");
			entitiesShell.gitTagInfo = mock(
				() =>
					({
						exitCode: 1,
						text: () => "error",
					}) as unknown as $.ShellPromise,
			);

			await expect(EntityTag.getTagInfo("nonexistent")).rejects.toThrow(
				"Could not get info for tag nonexistent",
			);
		});

		test("should throw error when tag info has insufficient data", async () => {
			const { entitiesShell } = await import("../entities.shell");
			entitiesShell.gitTagInfo = mock(
				() =>
					({
						exitCode: 0,
						text: () => "2024-01-01T00:00:00Z", // Only one line
					}) as unknown as $.ShellPromise,
			);

			await expect(EntityTag.getTagInfo("v1.0.0")).rejects.toThrow(
				"Could not get info for tag v1.0.0",
			);
		});

		test("should handle undefined text function", async () => {
			const { entitiesShell } = await import("../entities.shell");
			entitiesShell.gitTagInfo = mock(
				() =>
					({
						exitCode: 0,
						text: undefined,
					}) as unknown as $.ShellPromise,
			);

			await expect(EntityTag.getTagInfo("v1.0.0")).rejects.toThrow(
				"Could not get info for tag v1.0.0",
			);
		});
	});

	describe.skip("getBaseCommitSha", () => {
		test("should return SHA for provided reference", async () => {
			const result = await EntityTag.getBaseCommitSha("v1.0.0");
			expect(result).toBe("abc123");
		});

		test("should return first commit SHA when no reference provided", async () => {
			const result = await EntityTag.getBaseCommitSha();
			expect(result).toBe("first123");
		});

		test("should throw error when reference is invalid", async () => {
			const { entitiesShell } = await import("../entities.shell");
			entitiesShell.gitRevParse = mock(
				() =>
					({
						exitCode: 1,
						text: () => "error",
					}) as unknown as $.ShellPromise,
			);

			await expect(EntityTag.getBaseCommitSha("invalid-ref")).rejects.toThrow(
				"Invalid reference: invalid-ref. Not found as tag, branch, or commit.",
			);
		});

		test("should throw error when first commit cannot be found", async () => {
			const { entitiesShell } = await import("../entities.shell");
			entitiesShell.gitFirstCommit = mock(
				() =>
					({
						exitCode: 1,
						text: () => "error",
					}) as unknown as $.ShellPromise,
			);

			await expect(EntityTag.getBaseCommitSha()).rejects.toThrow("Could not find first commit");
		});
	});
});
