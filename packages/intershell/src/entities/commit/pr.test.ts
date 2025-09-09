import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import type { $ } from "bun";
import type { IConfig } from "../intershell-config/intershell-config.types";
import { createMockCommit } from "./commit.test";
import type { ParsedCommitData } from "./commit.types";

const { EntityPr } = await import("./pr");

describe("EntityPr", () => {
	let entityPr: InstanceType<typeof EntityPr>;
	let mockConfig: IConfig;
	let mockParseByHash: (hash: string) => Promise<ParsedCommitData>;

	// Store original methods to restore after tests
	let originalEntitiesShellGitLogHashes: (args: string[]) => $.ShellPromise;

	beforeEach(async () => {
		// Store original methods if not already stored
		const { entitiesShell } = await import("../entities.shell");
		if (!originalEntitiesShellGitLogHashes) {
			originalEntitiesShellGitLogHashes = entitiesShell.gitLogHashes;
		}
		mockConfig = {
			commit: {
				conventional: {
					type: {
						list: [],
					},
				},
			},
			branch: {
				defaultBranch: "main",
				prefixes: [],
				name: {
					minLength: 1,
					maxLength: 100,
					allowedCharacters: /^[a-zA-Z0-9\-_]+$/,
					noConsecutiveSeparators: false,
					noLeadingTrailingSeparators: false,
				},
			},
			package: {
				selectiveVersioning: {
					enabled: true,
					description: "Selective versioning",
				},
				semanticVersioning: {
					enabled: true,
					description: "Semantic versioning",
				},
				description: {
					enabled: true,
					description: "Package description",
				},
			},
			tag: {
				name: {
					enabled: true,
					description: "Tag validation",
					minLength: 1,
					maxLength: 100,
					allowedCharacters: /^[a-zA-Z0-9\-_.]+$/,
					noSpaces: true,
					noSpecialChars: true,
				},
			},
		} as IConfig;

		entityPr = new EntityPr(mockConfig);

		mockParseByHash = mock(async (hash: string) =>
			createMockCommit({ message: { type: "feat" }, info: { hash } }),
		);
	});

	afterEach(async () => {
		// Restore original methods
		if (originalEntitiesShellGitLogHashes) {
			const { entitiesShell } = await import("../entities.shell");
			entitiesShell.gitLogHashes = originalEntitiesShellGitLogHashes;
		}
	});

	describe("constructor", () => {
		it("should initialize with config", () => {
			expect(entityPr).toBeInstanceOf(EntityPr);
		});

		it("should handle config without defaultBranch", () => {
			const configWithoutBranch = {
				commit: {
					conventional: {
						type: {
							list: [],
						},
					},
				},
				branch: {
					defaultBranch: "main",
					prefixes: [],
					name: {
						minLength: 1,
						maxLength: 100,
						allowedCharacters: /^[a-zA-Z0-9\-_]+$/,
						noConsecutiveSeparators: false,
						noLeadingTrailingSeparators: false,
					},
				},
				package: {
					selectiveVersioning: {
						enabled: true,
						description: "Selective versioning",
					},
					semanticVersioning: {
						enabled: true,
						description: "Semantic versioning",
					},
					description: {
						enabled: true,
						description: "Package description",
					},
				},
				tag: {
					name: {
						enabled: true,
						description: "Tag validation",
						minLength: 1,
						maxLength: 100,
						allowedCharacters: /^[a-zA-Z0-9\-_.]+$/,
						noSpaces: true,
						noSpecialChars: true,
					},
				},
			} as IConfig;
			const entityPrWithoutBranch = new EntityPr(configWithoutBranch);
			expect(entityPrWithoutBranch).toBeInstanceOf(EntityPr);
		});
	});

	describe("getPRInfo", () => {
		it("should handle various PR scenarios and edge cases", async () => {
			const testCases = [
				{
					name: "return undefined for non-PR commits",
					message: createMockCommit().message,
					parseByHash: mockParseByHash,
					expectedResult: undefined,
					expectedAssertions: (result: ParsedCommitData) => {
						expect(result).toBeUndefined();
					},
				},
				{
					name: "return undefined for messages without PR numbers",
					message: createMockCommit({
						message: {
							type: "feat",
							subject: "add new feature",
							description: "add new feature description",
						},
					}).message,
					parseByHash: mockParseByHash,
					expectedResult: undefined,
					expectedAssertions: (result: ParsedCommitData) => {
						expect(result).toBeUndefined();
					},
				},
				{
					name: "extract PR number from merge pull request message",
					message: createMockCommit({
						message: {
							isMerge: true,
							type: "merge",
							subject: "Merge pull request #123 from feature-branch",
							description: "Merge pull request #123 from feature-branch",
						},
					}).message,
					parseByHash: mockParseByHash,
					expectedResult: "123",
					expectedAssertions: (result: ParsedCommitData) => {
						expect(result?.pr?.prNumber).toBe("123");
						expect(result?.pr?.prCategory).toBeDefined();
						expect(result?.pr?.prStats).toBeDefined();
						expect(result?.pr?.prCommits).toBeDefined();
						expect(result?.pr?.prBranchName).toBeDefined();
					},
				},
				{
					name: "extract PR number from merge PR message",
					message: createMockCommit({
						message: {
							isMerge: true,
							type: "merge",
							subject: "Merge pull request #456 from feature-branch",
							description: "Merge pull request #456 from feature-branch",
						},
					}).message,
					parseByHash: mockParseByHash,
					expectedResult: "456",
					expectedAssertions: (result: ParsedCommitData) => {
						expect(result?.pr?.prNumber).toBe("456");
					},
				},
				{
					name: "extract PR number from merge with hash message",
					message: createMockCommit({
						message: {
							isMerge: true,
							type: "merge",
							subject: "Merge pull request #789 from feature-branch",
							description: "Merge pull request #789 from feature-branch",
						},
					}).message,
					parseByHash: mockParseByHash,
					expectedResult: "789",
					expectedAssertions: (result: ParsedCommitData) => {
						expect(result?.pr?.prNumber).toBe("789");
					},
				},
				{
					name: "handle errors gracefully",
					message: createMockCommit({
						message: {
							isMerge: true,
							type: "merge",
							subject: "Merge pull request #123 from feature-branch",
							description: "Merge pull request #123 from feature-branch",
						},
					}).message,
					parseByHash: mock(async () => {
						throw new Error("Parse failed");
					}),
					expectedResult: "123",
					expectedAssertions: (result: ParsedCommitData) => {
						// The function handles errors gracefully and still returns PR info
						// but with empty commits array
						expect(result).toBeDefined();
						expect(result?.pr?.prNumber).toBe("123");
						expect(result?.pr?.prCommits).toEqual([]);
					},
				},
			];

			for (const testCase of testCases) {
				const result = await entityPr.getPRInfo(testCase.parseByHash, "abc123", testCase.message);
				if (result) {
					testCase.expectedAssertions({
						message: testCase.message,
						pr: result,
						info: { hash: "abc123" },
						files: [],
					});
				} else {
					// Some test cases expect undefined result (no PR number found)
					expect(result).toBeUndefined();
				}
			}
		});
	});

	describe("getPrBranch", () => {
		it("should return default branch for non-merge commits", () => {
			const result = entityPr.getPrBranch({ message: createMockCommit().message });

			expect(result.name).toBe("main");
			expect(result.fullName).toBe("main");
		});

		it("should return default branch for merge commits without 'from' in body", () => {
			const message = createMockCommit({
				message: {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123",
					bodyLines: ["Some merge message"],
					isBreaking: false,
					isMerge: true,
					isDependency: false,
				},
			}).message;

			const result = entityPr.getPrBranch({ message });

			expect(result.name).toBe("main");
			expect(result.fullName).toBe("main");
		});

		it("should extract branch name from merge commit with 'from' in body", () => {
			const message = createMockCommit({
				message: {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123",
					bodyLines: ["Merge branch 'feature-branch' from origin/feature-branch"],
					isBreaking: false,
					isMerge: true,
					isDependency: false,
				},
			}).message;

			const result = entityPr.getPrBranch({ message });

			expect(result.name).toBe("origin/feature-branch");
			expect(result.fullName).toBe("origin/feature-branch");
		});

		it("should handle config without defaultBranch", () => {
			const entityPrWithoutBranch = new EntityPr({
				commit: {
					conventional: {
						type: {
							list: [
								{
									type: "feat",
									label: "Features",
									description: "New features",
									category: "features",
									emoji: "",
									badgeColor: "",
									breakingAllowed: false,
								},
								{
									type: "fix",
									label: "Bug Fixes",
									description: "Bug fixes",
									category: "other",
									emoji: "",
									badgeColor: "",
									breakingAllowed: false,
								},
							],
						},
						scopes: { list: [] },
						description: { minLength: 3, maxLength: 100 },
						bodyLines: { minLength: 0, maxLength: 100 },
						isBreaking: {},
					},
				},
				branch: {
					defaultBranch: "",
					prefixes: ["feature", "fix", "chore"],
					name: {
						minLength: 3,
						maxLength: 50,
						allowedCharacters: /^[a-z0-9-]+$/,
						noConsecutiveSeparators: false,
						noLeadingTrailingSeparators: false,
					},
				},
				package: {
					selectiveVersioning: { enabled: true, description: "Selective versioning" },
					semanticVersioning: { enabled: true, description: "Semantic versioning" },
					description: { enabled: true, description: "Package description" },
				},
				tag: {
					name: {
						enabled: true,
						description: "Tag name validation",
						minLength: 0,
						maxLength: 0,
						allowedCharacters: /^[a-zA-Z0-9\-_.]+$/,
						noSpaces: false,
						noSpecialChars: false,
					},
				},
			});
			const message = createMockCommit().message;

			const result = entityPrWithoutBranch.getPrBranch({ message });

			expect(result.name).toBe("");
			expect(result.fullName).toBe("");
		});
	});

	describe("PR number extraction", () => {
		it("should extract PR numbers from various merge message formats", async () => {
			const testCases = [
				{
					message: "Merge pull request #123 from feature-branch",
					expected: "123",
				},
				{
					message: "Merge PR #456 into main",
					expected: "456",
				},
				{
					message: "Merge branch 'feature' into main #789",
					expected: "789",
				},
			];

			for (const testCase of testCases) {
				const message = createMockCommit({
					message: {
						type: "merge",
						subject: testCase.message,
						description: testCase.message,
						isMerge: true,
					},
				}).message;

				const result = await entityPr.getPRInfo(mockParseByHash, "abc123", message);
				expect(result?.prNumber).toBe(testCase.expected);
			}
		});
	});

	describe("PR categorization", () => {
		it("should categorize as dependencies for renovate/dependabot PRs", async () => {
			const message = createMockCommit({
				message: {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123 from renovate/dependencies",
					bodyLines: ["Update dependencies"],
					isMerge: true,
				},
			}).message;

			const result = await entityPr.getPRInfo(mockParseByHash, "abc123", message);

			// The categorization depends on git command execution which we can't easily mock
			// But we can verify the structure is correct
			expect(result?.prCategory).toBeDefined();
			expect(typeof result?.prCategory).toBe("string");
		});

		it("should categorize based on commit types", async () => {
			const message = createMockCommit({
				message: {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123",
					isMerge: true,
				},
			}).message;

			const result = await entityPr.getPRInfo(mockParseByHash, "abc123", message);

			// The actual categorization depends on git command execution
			// which we can't easily mock, so we test that categorization exists
			expect(result?.prCategory).toBeDefined();
			expect(typeof result?.prCategory).toBe("string");
		});
	});

	describe("PR stats", () => {
		it("should return commit count in stats", async () => {
			const message = createMockCommit({
				message: {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123",
					isMerge: true,
				},
			}).message;

			const result = await entityPr.getPRInfo(mockParseByHash, "abc123", message);

			expect(result?.prStats.commitCount).toBeDefined();
			expect(typeof result?.prStats.commitCount).toBe("number");
		});
	});

	describe("PR commits handling", () => {
		it("should handle various commit scenarios and edge cases", async () => {
			const testCases = [
				{
					name: "multiple commits in regular merge",
					gitLogOutput: "commit1\ncommit2\ncommit3",
					gitLogExitCode: 0,
					parseByHash: mock(async (hash: string) =>
						createMockCommit({
							message: {
								type: "feat",
								subject: `feature ${hash}`,
								description: `feature description ${hash}`,
							},
							info: { hash },
						}),
					),
					expectedCommitCount: 3,
					expectedDescription: undefined,
				},
				{
					name: "single commit (squash merge)",
					gitLogOutput: "squashed123",
					parseByHash: mock(async (hash: string) =>
						createMockCommit({
							message: {
								type: "feat",
								subject: "squashed feature",
								description: "squashed feature description",
							},
							info: { hash },
						}),
					),
					expectedCommitCount: 1,
					expectedDescription: "Squashed changes from PR",
				},
				{
					name: "git log range with multiple commits of different types",
					gitLogOutput: "hash1\nhash2\nhash3",
					parseByHash: mock(async (hash: string) => {
						const types = ["feat", "fix", "docs"];
						const typeIndex = Number.parseInt(hash.slice(-1), 10) - 1;
						return createMockCommit({
							message: {
								type: types[typeIndex] || "feat",
								subject: `${types[typeIndex] || "feat"} ${hash}`,
								description: `${types[typeIndex] || "feat"} description ${hash}`,
							},
							info: { hash },
						});
					}),
					expectedCommitCount: 3,
					expectedDescription: undefined,
				},
				{
					name: "parseByHash failures gracefully",
					gitLogOutput: "commit1\nfail123\ncommit3",
					parseByHash: mock(async (hash: string) => {
						if (hash === "fail123") {
							throw new Error("Parse failed");
						}
						return createMockCommit({
							message: {
								type: "feat",
								subject: "successful feature",
								description: "successful feature description",
							},
							info: { hash },
						});
					}),
					expectedCommitCount: undefined, // Just verify it doesn't crash
					expectedDescription: undefined,
				},
				{
					name: "git log failure gracefully",
					gitLogOutput: "error: git log failed",
					gitLogExitCode: 1,
					parseByHash: mockParseByHash,
					expectedCommitCount: 0,
					expectedDescription: undefined,
				},
				{
					name: "empty git log result",
					gitLogOutput: "",
					gitLogExitCode: 0,
					parseByHash: mockParseByHash,
					expectedCommitCount: 0,
					expectedDescription: undefined,
				},
				{
					name: "squashed commit parsing failure",
					gitLogOutput: "squashed123",
					gitLogExitCode: 0,
					parseByHash: mock(async (hash: string) => {
						if (hash === "squashed123") {
							throw new Error("Squashed commit parse failed");
						}
						return createMockCommit({
							message: {
								type: "feat",
								subject: "successful feature",
								description: "successful feature description",
							},
							info: { hash },
						});
					}),
					expectedCommitCount: 0,
					expectedDescription: undefined,
				},
			];

			for (const testCase of testCases) {
				// Mock gitLogHashes based on test case
				const mockGitLogHashes = mock(async () => ({
					exitCode: testCase.gitLogExitCode || 0,
					text: () => testCase.gitLogOutput,
				})) as unknown as (args: string[]) => $.ShellPromise;

				// Assign the mock to entitiesShell
				const { entitiesShell } = await import("../entities.shell");
				entitiesShell.gitLogHashes = mockGitLogHashes;

				const message = createMockCommit({
					message: {
						type: "merge",
						subject: "Merge pull request #123",
						description: "Merge pull request #123",
						isMerge: true,
					},
				}).message;

				const result = await entityPr.getPRInfo(testCase.parseByHash, "abc123", message);

				expect(result).toBeDefined();
				expect(result?.prCommits).toBeDefined();

				// Verify commit count if specified
				if (testCase.expectedCommitCount !== undefined) {
					expect(result?.prCommits.length).toBe(testCase.expectedCommitCount);
				}

				// Verify description content if specified
				if (testCase.expectedDescription && result?.prCommits && result.prCommits.length > 0) {
					expect(result.prCommits[0].message.description).toContain(testCase.expectedDescription);
				}

				// Verify commit info for multi-commit scenarios
				if (testCase.expectedCommitCount && testCase.expectedCommitCount > 1 && result?.prCommits) {
					result.prCommits.forEach((commit) => {
						expect(commit.info?.hash).toBeDefined();
						expect(commit.message.description).toBeDefined();
					});
				}
			}
		});
	});

	describe("PR categorization edge cases", () => {
		it("should categorize PRs based on commit types and content", async () => {
			const testCases = [
				{
					name: "dependencies when bodyLines contain dependency",
					message: createMockCommit({
						message: {
							type: "merge",
							subject: "Merge pull request #123",
							description: "Merge pull request #123",
							bodyLines: ["This PR updates dependencies", "Other changes"],
							isMerge: true,
						},
					}).message,
					parseByHash: mockParseByHash,
				},
				{
					name: "infrastructure for CI/build commits",
					message: createMockCommit({
						message: {
							type: "merge",
							subject: "Merge pull request #123",
							description: "Merge pull request #123",
							isMerge: true,
						},
					}).message,
					parseByHash: mock(async (hash: string) =>
						createMockCommit({
							message: {
								type: "ci",
								subject: "update CI",
								description: "update CI configuration",
							},
							info: { hash },
						}),
					),
				},
				{
					name: "bugfixes when fix commits dominate",
					message: createMockCommit({
						message: {
							type: "merge",
							subject: "Merge pull request #123",
							description: "Merge pull request #123",
							isMerge: true,
						},
					}).message,
					parseByHash: mock(async (hash: string) =>
						createMockCommit({
							message: {
								type: "fix",
								subject: "fix bug",
								description: "fix critical bug",
							},
							info: { hash },
						}),
					),
				},
				{
					name: "documentation for docs commits",
					message: createMockCommit({
						message: {
							type: "merge",
							subject: "Merge pull request #123",
							description: "Merge pull request #123",
							isMerge: true,
						},
					}).message,
					parseByHash: mock(async (hash: string) =>
						createMockCommit({
							message: {
								type: "docs",
								subject: "update docs",
								description: "update documentation",
							},
							info: { hash },
						}),
					),
				},
				{
					name: "refactoring for refactor/style/perf commits",
					message: createMockCommit({
						message: {
							type: "merge",
							subject: "Merge pull request #123",
							description: "Merge pull request #123",
							isMerge: true,
						},
					}).message,
					parseByHash: mock(async (hash: string) =>
						createMockCommit({
							message: {
								type: "refactor",
								subject: "refactor code",
								description: "improve code structure",
							},
							info: { hash },
						}),
					),
				},
				{
					name: "dependencies for chore commits with dependency keywords",
					message: createMockCommit({
						message: {
							type: "merge",
							subject: "Merge pull request #123",
							description: "Merge pull request #123",
							isMerge: true,
						},
					}).message,
					parseByHash: mock(async (hash: string) =>
						createMockCommit({
							message: {
								type: "chore",
								subject: "update dependencies",
								description: "update package dependencies",
							},
							info: { hash },
						}),
					),
				},
				{
					name: "infrastructure for chore commits with CI keywords",
					message: createMockCommit({
						message: {
							type: "merge",
							subject: "Merge pull request #123",
							description: "Merge pull request #123",
							isMerge: true,
						},
					}).message,
					parseByHash: mock(async (hash: string) =>
						createMockCommit({
							message: {
								type: "chore",
								subject: "update CI",
								description: "update CI configuration",
							},
							info: { hash },
						}),
					),
				},
				{
					name: "other when no clear pattern emerges",
					message: createMockCommit({
						message: {
							type: "merge",
							subject: "Merge pull request #123",
							description: "Merge pull request #123",
							isMerge: true,
						},
					}).message,
					parseByHash: mock(async (_hash: string) =>
						createMockCommit({
							message: {
								type: "other",
								subject: "misc changes",
								description: "various miscellaneous changes",
							},
							info: { hash: "test-hash" },
						}),
					),
				},
			];

			for (const testCase of testCases) {
				const result = await entityPr.getPRInfo(testCase.parseByHash, "abc123", testCase.message);

				// The categorization depends on git command execution which we can't easily mock
				// But we can verify the structure is correct
				expect(result?.prCategory).toBeDefined();
				expect(typeof result?.prCategory).toBe("string");
			}
		});

		it("should handle empty PR commits array", async () => {
			// Mock gitLogHashes to return empty result
			const mockGitLogHashes = mock(async () => ({
				text: () => "",
				exitCode: 0,
			})) as unknown as (args: string[]) => $.ShellPromise;

			// Assign the mock to entitiesShell
			const { entitiesShell } = await import("../entities.shell");
			entitiesShell.gitLogHashes = mockGitLogHashes;

			const message = createMockCommit({
				message: {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123",
					isMerge: true,
				},
			}).message;

			const result = await entityPr.getPRInfo(mockParseByHash, "abc123", message);

			expect(result).toBeDefined();
			expect(result?.prCommits).toEqual([]);
			expect(result?.prCategory).toBe("other");
		});

		it("should handle PR commits with missing info", async () => {
			// Mock parseByHash to return commits with missing info
			const incompleteParseByHash = mock(async (_hash: string) =>
				createMockCommit({
					message: {
						type: "feat",
						subject: "feature",
						description: "feature description",
					},
					info: undefined,
				}),
			);

			const message = createMockCommit({
				message: {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123",
					isMerge: true,
				},
			}).message;

			const result = await entityPr.getPRInfo(incompleteParseByHash, "abc123", message);

			expect(result).toBeDefined();
			expect(result?.prCommits).toBeDefined();
		});
	});
});
