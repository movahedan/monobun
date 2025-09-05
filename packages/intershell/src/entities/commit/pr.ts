import { EntityBranch, type ParsedBranch } from "../branch";
import type { IConfig, PRCategory } from "../config/types";
import { entitiesShell } from "../entities.shell";
import type { ParsedCommitData, PRStats } from "./types";

export class EntityPr {
	private readonly defaultBranch: string | undefined;
	constructor(readonly config: IConfig) {
		this.defaultBranch = config?.branch?.defaultBranch;
	}

	async getPRInfo(
		parseByHash: (hash: string) => Promise<ParsedCommitData>,
		hash: string,
		message: ParsedCommitData["message"],
	): Promise<ParsedCommitData["pr"]> {
		try {
			const prNumber = extractPRNumber(message);

			if (!prNumber) {
				return undefined;
			}

			const prCommits = await getPRCommits(hash, parseByHash);

			return {
				prNumber: extractPRNumber(message) || "",
				prCategory: categorizePR(prCommits, message),
				prStats: getPRStats(prCommits),
				prCommits: prCommits.length > 0 ? prCommits : [],
				prBranchName: this.getPrBranch({ message }),
			};
		} catch (error) {
			console.warn(`Failed to get PR info for commit ${hash}: ${error}`);
			return undefined;
		}
	}

	public getPrBranch({ message }: ParsedCommitData): ParsedBranch {
		if (!message.isMerge) {
			return {
				name: this.defaultBranch || "",
				fullName: this.defaultBranch || "",
			};
		}

		const mainMessage = message.bodyLines?.join("\n") || "";
		if (!mainMessage.includes("from ")) {
			return {
				name: this.defaultBranch || "",
				fullName: this.defaultBranch || "",
			};
		}

		const fromIndex = mainMessage.indexOf("from ");
		const afterFrom = mainMessage.substring(fromIndex + 5);
		let firstLine = afterFrom.split("\n")[0].trim();
		const originalFullName = firstLine; // Store the original full name

		if (firstLine.includes(":")) {
			firstLine = firstLine.split(":").reverse()[0];
		}

		// Remove remote prefix if present (e.g., "origin/feature-branch" -> "feature-branch")
		const parts = firstLine.split("/");
		if (parts.length > 1) {
			const firstPart = parts[0];
			// Check if first part is a remote name (like origin, upstream, etc.) or username
			const validPrefixes = this.config?.branch?.prefixes || [];
			if (
				!validPrefixes.includes(firstPart) &&
				(firstPart === "origin" || firstPart === "upstream" || firstPart.includes("/"))
			) {
				// First part is likely a remote name or username, remove it
				firstLine = parts.slice(1).join("/");
			}
		}

		const branchInstance = new EntityBranch();
		const parsed = branchInstance.parseByName(firstLine);

		// Return the extracted branch name with the original full name
		return {
			name: parsed.name || parsed.fullName,
			fullName: originalFullName, // Keep the original full name from the commit
		};
	}
}

function extractPRNumber(mergeMessage: ParsedCommitData["message"]): string | undefined {
	// Try different merge commit patterns
	const patterns = [
		/Merge pull request #(\d+)/, // "Merge pull request #123"
		/Merge PR #(\d+)/, // "Merge PR #123"
		/Merge.*#(\d+)/, // "Merge branch 'feature' into main #123"
		/#(\d+)/, // Any message containing #123 (secure pattern)
	];

	for (const pattern of patterns) {
		const match = mergeMessage.description.match(pattern);
		if (match) {
			return match[1];
		}
	}

	return undefined;
}

async function getPRCommits(
	mergeCommitHash: string,
	parseByHash: (hash: string) => Promise<ParsedCommitData>,
): Promise<ParsedCommitData[]> {
	try {
		// First, try the regular merge approach
		const result = await entitiesShell.gitLogHashes([`${mergeCommitHash}^..${mergeCommitHash}^2`]);

		if (result.exitCode === 0) {
			const commitHashes = result.text().trim().split("\n").filter(Boolean);

			// If we found multiple commits, this is a regular merge
			if (commitHashes.length > 1) {
				const prCommits = await Promise.all(
					commitHashes.map(async (hash) => {
						try {
							return await parseByHash(hash);
						} catch (error) {
							console.warn(`Failed to parse PR commit ${hash}: ${error}`);
							// Fallback to basic info if parsing fails
							return {
								message: {
									type: "other",
									description: "Failed to parse commit",
									isMerge: false,
									isDependency: false,
									isBreaking: false,
								},
								info: {
									hash: hash.trim(),
								},
							} as ParsedCommitData;
						}
					}),
				);

				const validCommits = prCommits.filter(
					(commit) => commit.info?.hash && commit.message.description,
				);
				return validCommits;
			}

			// If we only found 1 commit, this might be a squash merge
			// For squash merges, we can't recover individual commits from git history
			// But we can create a synthetic commit representing the squashed changes
			if (commitHashes.length === 1) {
				const squashedHash = commitHashes[0];
				try {
					const squashedCommit = await parseByHash(squashedHash);
					// Mark this as a squashed commit so the changelog can handle it appropriately
					return [
						{
							...squashedCommit,
							message: {
								...squashedCommit.message,
								description: `Squashed changes from PR (${squashedCommit.message.description})`,
							},
						},
					];
				} catch (error) {
					console.warn(`Failed to parse squashed commit ${squashedHash}: ${error}`);
					return [];
				}
			}
		}

		// Fallback: return empty array if no commits found
		return [];
	} catch (_error) {
		return [];
	}
}

function categorizePR(
	prCommits: ParsedCommitData[],
	mergeMessage: ParsedCommitData["message"],
): PRCategory {
	if (
		mergeMessage.description.includes("renovate") ||
		mergeMessage.description.includes("dependabot") ||
		mergeMessage.bodyLines.some((line) => line.toLowerCase().includes("dependency"))
	) {
		return "dependencies";
	}

	const scores = {
		features: 0,
		bugfixes: 0,
		dependencies: 0,
		infrastructure: 0,
		documentation: 0,
		refactoring: 0,
	};

	for (const commit of prCommits) {
		const commitType = commit.message.type;

		switch (commitType) {
			case "feat":
				scores.features += 3;
				break;
			case "fix":
				scores.bugfixes += 2;
				break;
			case "deps":
			case "chore":
				if (
					commit.message.description.includes("dep") ||
					commit.message.description.includes("update") ||
					commit.message.description.includes("upgrade")
				) {
					scores.dependencies += 5;
				} else if (
					commit.message.description.includes("ci") ||
					commit.message.description.includes("build") ||
					commit.message.description.includes("workflow")
				) {
					scores.infrastructure += 2;
				}
				break;
			case "docs":
				scores.documentation += 2;
				break;
			case "refactor":
			case "style":
			case "perf":
				scores.refactoring += 2;
				break;
			case "ci":
			case "build":
				scores.infrastructure += 3;
				break;
		}
	}

	const maxScore = Math.max(...Object.values(scores));
	if (maxScore === 0) return "other";

	const winner = Object.entries(scores).find(([_, score]) => score === maxScore);
	return winner ? (winner[0] as PRCategory) : "other";
}

function getPRStats(prCommits: ParsedCommitData[]): PRStats {
	return {
		commitCount: prCommits.length,
	};
}
