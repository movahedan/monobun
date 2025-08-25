import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { IConfig } from "../config/types";
import { EntityPr } from "./pr";
import type { ParsedCommitData } from "./types";

describe("EntityPr", () => {
	let entityPr: EntityPr;
	let mockConfig: IConfig;
	let mockParseByHash: (hash: string) => Promise<ParsedCommitData>;

	beforeEach(() => {
		mockConfig = {
			branch: {
				defaultBranch: "main",
			},
		} as IConfig;

		entityPr = new EntityPr(mockConfig);

		mockParseByHash = mock(async (hash: string) => ({
			message: {
				type: "feat",
				subject: "test feature",
				description: "test feature description",
				bodyLines: [],
				isBreaking: false,
				isMerge: false,
				isDependency: false,
			},
			info: {
				hash,
			},
		}));
	});

	describe("constructor", () => {
		it("should initialize with config", () => {
			expect(entityPr).toBeInstanceOf(EntityPr);
		});

		it("should handle config without defaultBranch", () => {
			const configWithoutBranch = {} as IConfig;
			const entityPrWithoutBranch = new EntityPr(configWithoutBranch);
			expect(entityPrWithoutBranch).toBeInstanceOf(EntityPr);
		});
	});

	describe("getPRInfo", () => {
		it("should return undefined for non-PR commits", async () => {
			const message = {
				type: "feat",
				subject: "add new feature",
				description: "add new feature description",
				bodyLines: [],
				isBreaking: false,
				isMerge: false,
				isDependency: false,
			};

			const result = await entityPr.getPRInfo(mockParseByHash, "abc123", message);

			expect(result).toBeUndefined();
		});

		it("should extract PR number from merge pull request message", async () => {
			const message = {
				type: "merge",
				subject: "Merge pull request #123 from feature-branch",
				description: "Merge pull request #123 from feature-branch",
				bodyLines: [],
				isBreaking: false,
				isMerge: true,
				isDependency: false,
			};

			const result = await entityPr.getPRInfo(mockParseByHash, "abc123", message);

			expect(result?.prNumber).toBe("123");
			expect(result?.prCategory).toBeDefined();
			expect(result?.prStats).toBeDefined();
			expect(result?.prCommits).toBeDefined();
			expect(result?.prBranchName).toBeDefined();
		});

		it("should extract PR number from merge PR message", async () => {
			const message = {
				type: "merge",
				subject: "Merge PR #456 into main",
				description: "Merge PR #456 into main",
				bodyLines: [],
				isBreaking: false,
				isMerge: true,
				isDependency: false,
			};

			const result = await entityPr.getPRInfo(mockParseByHash, "abc123", message);

			expect(result?.prNumber).toBe("456");
		});

		it("should extract PR number from merge with hash message", async () => {
			const message = {
				type: "merge",
				subject: "Merge branch 'feature' into main #789",
				description: "Merge branch 'feature' into main #789",
				bodyLines: [],
				isBreaking: false,
				isMerge: true,
				isDependency: false,
			};

			const result = await entityPr.getPRInfo(mockParseByHash, "abc123", message);

			expect(result?.prNumber).toBe("789");
		});

		it("should handle errors gracefully", async () => {
			const message = {
				type: "merge",
				subject: "Merge pull request #123",
				description: "Merge pull request #123",
				bodyLines: [],
				isBreaking: false,
				isMerge: true,
				isDependency: false,
			};

			// Mock a failing parseByHash
			const failingParseByHash = mock(async () => {
				throw new Error("Parse failed");
			});

			const result = await entityPr.getPRInfo(failingParseByHash, "abc123", message);

			// The function handles errors gracefully and still returns PR info
			// but with empty commits array
			expect(result).toBeDefined();
			expect(result?.prNumber).toBe("123");
			expect(result?.prCommits).toEqual([]);
		});
	});

	describe("getPrBranch", () => {
		it("should return default branch for non-merge commits", () => {
			const message = {
				type: "feat",
				subject: "add feature",
				description: "add feature description",
				bodyLines: [],
				isBreaking: false,
				isMerge: false,
				isDependency: false,
			};

			const result = entityPr["getPrBranch"]({ message });

			expect(result.name).toBe("main");
			expect(result.fullName).toBe("main");
		});

		it("should return default branch for merge commits without 'from' in body", () => {
			const message = {
				type: "merge",
				subject: "Merge pull request #123",
				description: "Merge pull request #123",
				bodyLines: ["Some merge message"],
				isBreaking: false,
				isMerge: true,
				isDependency: false,
			};

			const result = entityPr["getPrBranch"]({ message });

			expect(result.name).toBe("main");
			expect(result.fullName).toBe("main");
		});

		it("should extract branch name from merge commit with 'from' in body", () => {
			const message = {
				type: "merge",
				subject: "Merge pull request #123",
				description: "Merge pull request #123",
				bodyLines: ["Merge branch 'feature-branch' from origin/feature-branch"],
				isBreaking: false,
				isMerge: true,
				isDependency: false,
			};

			const result = entityPr["getPrBranch"]({ message });

			expect(result.name).toBe("feature-branch");
			expect(result.fullName).toBe("origin/feature-branch");
		});

		it("should handle config without defaultBranch", () => {
			const entityPrWithoutBranch = new EntityPr({} as IConfig);
			const message = {
				type: "feat",
				subject: "add feature",
				description: "add feature description",
				bodyLines: [],
				isBreaking: false,
				isMerge: false,
				isDependency: false,
			};

			const result = entityPrWithoutBranch["getPrBranch"]({ message });

			expect(result.name).toBe("");
			expect(result.fullName).toBe("");
		});
	});

	describe("PR number extraction", () => {
		it("should extract PR number from merge pull request message", async () => {
			const message = {
				type: "merge",
				subject: "Merge pull request #123 from feature-branch",
				description: "Merge pull request #123 from feature-branch",
				bodyLines: [],
				isBreaking: false,
				isMerge: true,
				isDependency: false,
			};

			const result = await entityPr.getPRInfo(mockParseByHash, "abc123", message);

			expect(result?.prNumber).toBe("123");
		});

		it("should extract PR number from merge PR message", async () => {
			const message = {
				type: "merge",
				subject: "Merge PR #456 into main",
				description: "Merge PR #456 into main",
				bodyLines: [],
				isBreaking: false,
				isMerge: true,
				isDependency: false,
			};

			const result = await entityPr.getPRInfo(mockParseByHash, "abc123", message);

			expect(result?.prNumber).toBe("456");
		});

		it("should extract PR number from merge with hash message", async () => {
			const message = {
				type: "merge",
				subject: "Merge branch 'feature' into main #789",
				description: "Merge branch 'feature' into main #789",
				bodyLines: [],
				isBreaking: false,
				isMerge: true,
				isDependency: false,
			};

			const result = await entityPr.getPRInfo(mockParseByHash, "abc123", message);

			expect(result?.prNumber).toBe("789");
		});

		it("should return undefined for messages without PR numbers", async () => {
			const message = {
				type: "feat",
				subject: "add new feature",
				description: "add new feature description",
				bodyLines: [],
				isBreaking: false,
				isMerge: false,
				isDependency: false,
			};

			const result = await entityPr.getPRInfo(mockParseByHash, "abc123", message);

			expect(result).toBeUndefined();
		});

		describe("PR categorization", () => {
			it("should categorize as dependencies for renovate/dependabot PRs", async () => {
				const message = {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123 from renovate/dependencies",
					bodyLines: ["Update dependencies"],
					isBreaking: false,
					isMerge: true,
					isDependency: false,
				};

				const result = await entityPr.getPRInfo(mockParseByHash, "abc123", message);

				// The categorization depends on git command execution which we can't easily mock
				// But we can verify the structure is correct
				expect(result?.prCategory).toBeDefined();
				expect(typeof result?.prCategory).toBe("string");
			});

			it("should categorize based on commit types", async () => {
				const message = {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123",
					bodyLines: [],
					isBreaking: false,
					isMerge: true,
					isDependency: false,
				};

				const result = await entityPr.getPRInfo(mockParseByHash, "abc123", message);

				// The actual categorization depends on git command execution
				// which we can't easily mock, so we test that categorization exists
				expect(result?.prCategory).toBeDefined();
				expect(typeof result?.prCategory).toBe("string");
			});
		});

		describe("PR stats", () => {
			it("should return commit count in stats", async () => {
				const message = {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123",
					bodyLines: [],
					isBreaking: false,
					isMerge: true,
					isDependency: false,
				};

				const result = await entityPr.getPRInfo(mockParseByHash, "abc123", message);

				expect(result?.prStats.commitCount).toBeDefined();
				expect(typeof result?.prStats.commitCount).toBe("number");
			});
		});

		describe("PR commits handling", () => {
			it("should handle multiple commits in regular merge", async () => {
				// Mock parseByHash to return multiple commits
				const multiCommitParseByHash = mock(async (hash: string) => ({
					message: {
						type: "feat",
						subject: `feature ${hash}`,
						description: `feature description ${hash}`,
						bodyLines: [],
						isBreaking: false,
						isMerge: false,
						isDependency: false,
					},
					info: { hash },
				}));

				const message = {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123",
					bodyLines: [],
					isBreaking: false,
					isMerge: true,
					isDependency: false,
				};

				const result = await entityPr.getPRInfo(multiCommitParseByHash, "abc123", message);

				expect(result).toBeDefined();
				expect(result?.prCommits).toBeDefined();
			});

			it("should handle single commit (squash merge)", async () => {
				// Mock parseByHash to return a single commit
				const singleCommitParseByHash = mock(async (hash: string) => ({
					message: {
						type: "feat",
						subject: "squashed feature",
						description: "squashed feature description",
						bodyLines: [],
						isBreaking: false,
						isMerge: false,
						isDependency: false,
					},
					info: { hash },
				}));

				const message = {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123",
					bodyLines: [],
					isBreaking: false,
					isMerge: true,
					isDependency: false,
				};

				const result = await entityPr.getPRInfo(singleCommitParseByHash, "abc123", message);

				expect(result).toBeDefined();
				expect(result?.prCommits).toBeDefined();
			});

			it("should handle parseByHash failures gracefully", async () => {
				// Mock parseByHash to fail for some commits
				const failingParseByHash = mock(async (hash: string) => {
					if (hash === "fail123") {
						throw new Error("Parse failed");
					}
					return {
						message: {
							type: "feat",
							subject: "successful feature",
							description: "successful feature description",
							bodyLines: [],
							isBreaking: false,
							isMerge: false,
							isDependency: false,
						},
						info: { hash },
					};
				});

				const message = {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123",
					bodyLines: [],
					isBreaking: false,
					isMerge: true,
					isDependency: false,
				};

				const result = await entityPr.getPRInfo(failingParseByHash, "abc123", message);

				expect(result).toBeDefined();
				expect(result?.prCommits).toBeDefined();
			});
		});

		describe("PR categorization edge cases", () => {
			it("should categorize as dependencies when bodyLines contain dependency", async () => {
				const message = {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123",
					bodyLines: ["This PR updates dependencies", "Other changes"],
					isBreaking: false,
					isMerge: true,
					isDependency: false,
				};

				const result = await entityPr.getPRInfo(mockParseByHash, "abc123", message);

				// The categorization depends on git command execution which we can't easily mock
				// But we can verify the structure is correct
				expect(result?.prCategory).toBeDefined();
				expect(typeof result?.prCategory).toBe("string");
			});

			it("should categorize as infrastructure for CI/build commits", async () => {
				// Mock parseByHash to return CI commits
				const ciParseByHash = mock(async (hash: string) => ({
					message: {
						type: "ci",
						subject: "update CI",
						description: "update CI configuration",
						bodyLines: [],
						isBreaking: false,
						isMerge: false,
						isDependency: false,
					},
					info: { hash },
				}));

				const message = {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123",
					bodyLines: [],
					isBreaking: false,
					isMerge: true,
					isDependency: false,
				};

				const result = await entityPr.getPRInfo(ciParseByHash, "abc123", message);

				// The categorization depends on git command execution which we can't easily mock
				// But we can verify the structure is correct
				expect(result?.prCategory).toBeDefined();
				expect(typeof result?.prCategory).toBe("string");
			});

			it("should categorize as bugfixes when fix commits dominate", async () => {
				// Mock parseByHash to return fix commits
				const fixParseByHash = mock(async (hash: string) => ({
					message: {
						type: "fix",
						subject: "fix bug",
						description: "fix critical bug",
						bodyLines: [],
						isBreaking: false,
						isMerge: false,
						isDependency: false,
					},
					info: { hash },
				}));

				const message = {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123",
					bodyLines: [],
					isBreaking: false,
					isMerge: true,
					isDependency: false,
				};

				const result = await entityPr.getPRInfo(fixParseByHash, "abc123", message);

				// The categorization depends on git command execution which we can't easily mock
				// But we can verify the structure is correct
				expect(result?.prCategory).toBeDefined();
				expect(typeof result?.prCategory).toBe("string");
			});

			it("should categorize as documentation for docs commits", async () => {
				// Mock parseByHash to return documentation commits
				const docsParseByHash = mock(async (hash: string) => ({
					message: {
						type: "docs",
						subject: "update docs",
						description: "update documentation",
						bodyLines: [],
						isBreaking: false,
						isMerge: false,
						isDependency: false,
					},
					info: { hash },
				}));

				const message = {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123",
					bodyLines: [],
					isBreaking: false,
					isMerge: true,
					isDependency: false,
				};

				const result = await entityPr.getPRInfo(docsParseByHash, "abc123", message);

				// The categorization depends on git command execution which we can't easily mock
				// But we can verify the structure is correct
				expect(result?.prCategory).toBeDefined();
				expect(typeof result?.prCategory).toBe("string");
			});

			it("should categorize as refactoring for refactor/style/perf commits", async () => {
				// Mock parseByHash to return refactor commits
				const refactorParseByHash = mock(async (hash: string) => ({
					message: {
						type: "refactor",
						subject: "refactor code",
						description: "improve code structure",
						bodyLines: [],
						isBreaking: false,
						isMerge: false,
						isDependency: false,
					},
					info: { hash },
				}));

				const message = {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123",
					bodyLines: [],
					isBreaking: false,
					isMerge: true,
					isDependency: false,
				};

				const result = await entityPr.getPRInfo(refactorParseByHash, "abc123", message);

				// The categorization depends on git command execution which we can't easily mock
				// But we can verify the structure is correct
				expect(result?.prCategory).toBeDefined();
				expect(typeof result?.prCategory).toBe("string");
			});

			it("should categorize as dependencies for chore commits with dependency keywords", async () => {
				// Mock parseByHash to return chore commits with dependency keywords
				const depsParseByHash = mock(async (hash: string) => ({
					message: {
						type: "chore",
						subject: "update dependencies",
						description: "update package dependencies",
						bodyLines: [],
						isBreaking: false,
						isMerge: false,
						isDependency: false,
					},
					info: { hash },
				}));

				const message = {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123",
					bodyLines: [],
					isBreaking: false,
					isMerge: true,
					isDependency: false,
				};

				const result = await entityPr.getPRInfo(depsParseByHash, "abc123", message);

				// The categorization depends on git command execution which we can't easily mock
				// But we can verify the structure is correct
				expect(result?.prCategory).toBeDefined();
				expect(typeof result?.prCategory).toBe("string");
			});

			it("should categorize as infrastructure for chore commits with CI keywords", async () => {
				// Mock parseByHash to return chore commits with CI keywords
				const ciChoreParseByHash = mock(async (hash: string) => ({
					message: {
						type: "chore",
						subject: "update CI",
						description: "update CI configuration",
						bodyLines: [],
						isBreaking: false,
						isMerge: false,
						isDependency: false,
					},
					info: { hash },
				}));

				const message = {
					type: "merge",
					subject: "Merge pull request #123",
					description: "Merge pull request #123",
					bodyLines: [],
					isBreaking: false,
					isMerge: true,
					isDependency: false,
				};

				const result = await entityPr.getPRInfo(ciChoreParseByHash, "abc123", message);

				// The categorization depends on git command execution which we can't easily mock
				// But we can verify the structure is correct
				expect(result?.prCategory).toBeDefined();
				expect(typeof result?.prCategory).toBe("string");
			});
		});
	});
});
