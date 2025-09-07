import type { ParsedCommitData } from "../commit";
import { EntityCommit } from "../commit";
import { entitiesShell } from "../entities.shell";
import { EntityPackages } from "../packages";

export class EntityCommitPackage {
	private packages: EntityPackages;
	private isRoot: boolean;

	constructor(packageName: string) {
		this.packages = new EntityPackages(packageName);
		this.isRoot = packageName === "root";
	}

	/**
	 * Get the first commit for this package
	 */
	async getFirstCommitForPackage(): Promise<string> {
		if (this.isRoot) {
			// For root package, use the very first commit of the repository
			const result = await entitiesShell.gitFirstCommit();
			if (result.exitCode !== 0) {
				throw new Error("Could not find first commit");
			}
			return result.text().trim();
		}

		// For sub-packages, find the first commit where the package directory was introduced
		const packagePath = this.packages.getPath();
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
	 * Get commits in a range for this package with dependency analysis
	 */
	async getCommitsInRange(from: string, to: string): Promise<ParsedCommitData[]> {
		const entityCommit = new EntityCommit();
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

			// For package-specific commits, filter merge commits by package path
			let commitHashes = [...new Set([...allHashes, ...mergeHashes])];
			if (!this.isRoot) {
				commitHashes = await this.filterCommitsByPackage(commitHashes, mergeHashes);
			}

			// Parse commits and apply dependency analysis
			const commits = await Promise.all(commitHashes.map(entityCommit.parseByHash));
			const relevantCommits = this.isRoot
				? commits
				: await this.filterRelevantCommits(commits, from);

			// Sort commits: merge commits first, then orphan commits, both by date
			return this.sortCommits(relevantCommits);
		} catch (error) {
			console.warn("Failed to get commits in range:", error);
			return [];
		}
	}

	/**
	 * Filter commits by package path (for merge commits)
	 */
	private async filterCommitsByPackage(
		allHashes: string[],
		mergeHashes: string[],
	): Promise<string[]> {
		const packagePath = this.packages.getPath();
		const relevantMergeHashes: string[] = [];

		// Check which merge commits affect this package
		for (const hash of mergeHashes) {
			const prCommitsResult = await entitiesShell.gitLogHashes([
				`${hash}^..${hash}^2`,
				"--",
				packagePath,
			]);
			if (prCommitsResult.exitCode === 0) {
				const prHashes = prCommitsResult.text().trim().split("\n").filter(Boolean);
				if (prHashes.length > 0) {
					relevantMergeHashes.push(hash);
				}
			}
		}

		return [...new Set([...allHashes, ...relevantMergeHashes])];
	}

	/**
	 * Filter commits to only include those relevant to this package
	 */
	async filterRelevantCommits(
		commits: ParsedCommitData[],
		fromTag: string,
	): Promise<ParsedCommitData[]> {
		const dependencies = await this.getDependenciesAtTag(fromTag);

		return commits.filter(
			(commit) =>
				this.affectsPackageDirectly(commit) || this.affectsDependencies(commit, dependencies),
		);
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

	/**
	 * Get dependencies for this package at a specific tag
	 */
	async getDependenciesAtTag(tagName: string): Promise<string[]> {
		try {
			const result = await entitiesShell.gitShowPackageJsonAtTag(
				tagName,
				this.packages.getJsonPath(),
			);

			if (result.exitCode !== 0) {
				return [];
			}

			const packageJson = JSON.parse(result.text()) as Record<string, unknown>;
			const deps = [
				...(packageJson.dependencies
					? Object.keys(packageJson.dependencies as Record<string, string>)
					: []),
				...(packageJson.devDependencies
					? Object.keys(packageJson.devDependencies as Record<string, string>)
					: []),
				...(packageJson.peerDependencies
					? Object.keys(packageJson.peerDependencies as Record<string, string>)
					: []),
			];
			return [...new Set(deps)];
		} catch {
			return [];
		}
	}

	/**
	 * Check if a commit affects the package directly
	 */
	affectsPackageDirectly(commit: ParsedCommitData): boolean {
		const packagePath = this.packages.getPath();
		return commit.files?.some((file) => file.startsWith(packagePath)) ?? false;
	}

	/**
	 * Check if a commit affects any of the package's dependencies
	 */
	affectsDependencies(commit: ParsedCommitData, dependencies: string[]): boolean {
		if (!commit.files?.length || !dependencies.length) return false;

		return commit.files.some((file) =>
			dependencies.some((dep) => {
				const depPath = dep.startsWith("@repo/") ? dep.replace("@repo/", "") : dep;
				return (
					file.includes(dep) ||
					file.includes(`node_modules/${dep}`) ||
					file.includes(`packages/${depPath}`) ||
					file.includes(`apps/${depPath}`)
				);
			}),
		);
	}
}
