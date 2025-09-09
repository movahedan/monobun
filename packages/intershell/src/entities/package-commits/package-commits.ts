import type { ParsedCommitData } from "../commit";
import { EntityCommit } from "../commit";
import { entitiesShell } from "../entities.shell";
import { EntityPackage } from "../package";
import { EntityDependencyAnalyzer } from "./dependency-analyzer";

export class EntityPackageCommits {
	private package: EntityPackage;
	private commit: EntityCommit;
	private dependencyAnalyzer: EntityDependencyAnalyzer;

	constructor(packageInstance: EntityPackage) {
		this.package = packageInstance;
		this.commit = new EntityCommit();
		this.dependencyAnalyzer = new EntityDependencyAnalyzer(this.package);
	}

	/**
	 * Get the first commit for this package
	 */
	async getFirstCommitForPackage(): Promise<string> {
		if (this.package.getName() === "root") {
			// For root package, use the very first commit of the repository
			const result = await entitiesShell.gitFirstCommit();
			if (result.exitCode !== 0) {
				throw new Error("Could not find first commit");
			}
			return result.text().trim();
		}

		// For sub-packages, find the first commit where the package directory was introduced
		const packagePath = this.package.getPath();
		const result = await entitiesShell.gitLogHashes([packagePath]);

		if (result.exitCode !== 0 || !result.text().trim()) {
			// If no commits found for this package path, fall back to first commit
			const firstCommitResult = await entitiesShell.gitFirstCommit();
			if (firstCommitResult.exitCode !== 0) {
				throw new Error("Could not find first commit");
			}
			return firstCommitResult.text().trim();
		}

		// Get the last commit hash from the result (since git log returns newest first)
		const commitHashes = result.text().trim().split("\n").filter(Boolean);
		if (commitHashes.length === 0) {
			const firstCommitResult = await entitiesShell.gitFirstCommit();
			if (firstCommitResult.exitCode !== 0) {
				throw new Error("Could not find first commit");
			}
			return firstCommitResult.text().trim();
		}

		// Return the last commit (which is the first chronologically)
		return commitHashes[commitHashes.length - 1];
	}

	/**
	 * Get commits in a range for this package with dependency filtering
	 */
	async getCommitsInRange(from: string, to: string): Promise<ParsedCommitData[]> {
		const gitRange = from === "0.0.0" ? to : `${from}..${to}`;

		try {
			// Get all commit hashes (both regular and merge commits)
			const [allHashesResult, mergeHashesResult] = await Promise.all([
				entitiesShell.gitLogHashes([gitRange]),
				entitiesShell.gitLogHashes([gitRange, "--merges"]),
			]);

			const allHashes =
				allHashesResult.exitCode === 0
					? allHashesResult.text().trim().split("\n").filter(Boolean)
					: [];
			const mergeHashes =
				mergeHashesResult.exitCode === 0
					? mergeHashesResult.text().trim().split("\n").filter(Boolean)
					: [];

			// For non-root packages, filter merge commits by package path
			const commitHashes = await this.filterMergeCommitsByPackage(allHashes, mergeHashes);

			// Parse all commits
			const allCommits = await Promise.all(
				commitHashes.map((hash) => this.commit.parseByHash(hash)),
			);

			// Filter commits based on package dependencies at each commit
			const relevantCommits: ParsedCommitData[] = [];
			for (const commit of allCommits) {
				// Check if commit affects this package or its dependencies
				const affected = await this.getCommitAffectedPackages(commit);

				// Include commit if it affects this package directly or any of its dependencies
				if (affected.direct !== null || affected.dependencies.length > 0) {
					relevantCommits.push(commit);
				}
			}

			// Sort commits: merge commits first, then orphan commits, both by date
			return this.sortCommits(relevantCommits);
		} catch (error) {
			console.warn("Failed to get commits in range:", error);
			return [];
		}
	}

	/**
	 * Get which packages are affected by a commit (direct and dependencies)
	 * Analyzes the commit's file changes against package dependencies
	 */
	async getCommitAffectedPackages(commit: ParsedCommitData): Promise<{
		direct: string | null;
		dependencies: string[];
	}> {
		if (!commit.files?.length) {
			return { direct: null, dependencies: [] };
		}

		// Get package dependencies at the commit
		const commitHash = commit.info?.hash || "HEAD";
		const packageDeps = await this.dependencyAnalyzer.getPackageDependenciesAtRef(commitHash);

		// Check if commit affects this package directly
		const packagePath = this.package.getPath();
		const affectsDirect = this.package.isRoot()
			? commit.files.length > 0 // For root package, any file change affects it
			: commit.files.some((file) => file.startsWith(packagePath));

		// Check if commit affects any dependencies
		const affectedDependencies: string[] = [];
		for (const dep of packageDeps) {
			const depPackage = new EntityPackage(dep);
			const depPath = depPackage.getPath();
			if (commit.files.some((file) => file.startsWith(depPath))) {
				affectedDependencies.push(dep);
			}
		}

		return {
			direct: affectsDirect ? this.package.getName() : null,
			dependencies: affectedDependencies,
		};
	}

	/**
	 * Deduplicate merge commits - remove hashes that are already included in merge commits
	 */
	private async filterMergeCommitsByPackage(
		allHashes: string[],
		mergeHashes: string[],
	): Promise<string[]> {
		// For each merge commit, get the individual commits inside it
		const individualCommits = new Set<string>();

		for (const mergeHash of mergeHashes) {
			const prCommitsResult = await entitiesShell.gitLogHashes([`${mergeHash}^..${mergeHash}^2`]);
			if (prCommitsResult.exitCode === 0) {
				const prHashes = prCommitsResult.text().trim().split("\n").filter(Boolean);
				prHashes.forEach((hash) => {
					individualCommits.add(hash);
				});
			}
		}

		// Remove individual commits that are already included in merge commits
		const filteredHashes = allHashes.filter((hash) => !individualCommits.has(hash));

		// Return merge commits + filtered individual commits
		return [...new Set([...filteredHashes, ...mergeHashes])];
	}

	/**
	 * Sort commits: merge commits first, then orphan commits, both by date (newest first)
	 */
	private sortCommits(commits: ParsedCommitData[]): ParsedCommitData[] {
		const mergeCommits = commits.filter((commit) => commit.message.isMerge);
		const orphanCommits = commits.filter(
			(commit) =>
				!commit.message.isMerge &&
				!mergeCommits.some((mergeCommit) =>
					mergeCommit.pr?.prCommits?.some((prCommit) => prCommit.info?.hash === commit.info?.hash),
				),
		);

		const sortByDate = (a: ParsedCommitData, b: ParsedCommitData) =>
			new Date(b.info?.date || "0").getTime() - new Date(a.info?.date || "0").getTime();

		return [...mergeCommits.sort(sortByDate), ...orphanCommits.sort(sortByDate)];
	}
}
