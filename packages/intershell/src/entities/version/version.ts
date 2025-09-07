import type { ParsedCommitData } from "../commit";
import { EntityCommitPackage } from "../commit-package";
import { EntityTagPackage } from "../tag-package";
import type { EntityVersionBumpType, EntityVersionData } from "./types";

export class EntityVersion {
	packageName: string;
	private tagPackage: EntityTagPackage;
	private commitPackage: EntityCommitPackage;

	constructor(packageName: string) {
		this.packageName = packageName;
		this.tagPackage = new EntityTagPackage(packageName);
		this.commitPackage = new EntityCommitPackage(packageName);
	}

	async calculateVersionData(
		versionOnDisk: string,
		currentVersion: string,
		commits: ParsedCommitData[],
	): Promise<EntityVersionData> {
		// Check if version on disk is higher than the current version (early validation)
		const currentVersionComparison = this.tagPackage.compareVersions(versionOnDisk, currentVersion);
		if (currentVersionComparison > 0) {
			throw new Error(
				`Package version on disk (${versionOnDisk}) is higher than current git tag version (${currentVersion}). ` +
					`Please clean up the disk changes and revert package.json to version ${currentVersion} before running version preparation.`,
			);
		}

		// If no commits, check if this is a first version (0.0.0)
		if (commits.length === 0) {
			if (currentVersion === "0.0.0") {
				// First version - bump to 0.1.0 even with no commits
				return {
					currentVersion,
					shouldBump: true,
					targetVersion: "0.1.0",
					bumpType: "minor",
					reason: "First version bump from 0.0.0",
				};
			}
			// No new commits, no version change needed
			return {
				currentVersion,
				shouldBump: false,
				targetVersion: currentVersion,
				bumpType: "none",
				reason: "No commits in range",
			};
		}

		const bumpType = await this.calculateBumpType(commits);
		if (bumpType === "none") {
			return {
				currentVersion,
				shouldBump: false,
				targetVersion: currentVersion,
				bumpType: "none",
				reason: "No version bump needed",
			};
		}

		const nextVersion = this.calculateNextVersion(currentVersion, bumpType);
		const versionAlreadyExists = await this.tagPackage.packageVersionExistsInHistory(nextVersion);
		if (versionAlreadyExists) {
			return {
				currentVersion,
				shouldBump: false,
				targetVersion: currentVersion,
				bumpType: "none",
				reason: `Version ${nextVersion} already exists in git tags`,
			};
		}

		if (currentVersion === nextVersion) {
			return {
				currentVersion,
				shouldBump: false,
				targetVersion: currentVersion,
				bumpType: "none",
				reason: `Package version ${currentVersion} already matches next version ${nextVersion}`,
			};
		}

		const latestPackageVersionInHistory = await this.tagPackage.getLatestPackageVersionInHistory();
		if (latestPackageVersionInHistory && latestPackageVersionInHistory !== currentVersion) {
			// Check if current version is actually behind the git tag version
			const versionComparison = this.tagPackage.compareVersions(
				currentVersion,
				latestPackageVersionInHistory,
			);
			if (versionComparison < 0) {
				throw new Error(
					`Package version ${currentVersion} is behind git tag version ${latestPackageVersionInHistory}`,
				);
			}
			// If current version is ahead of git tag version, that's fine - we can proceed
		}

		// Check if version on disk is already synced
		if (versionOnDisk === nextVersion) {
			return {
				currentVersion: versionOnDisk,
				shouldBump: false,
				targetVersion: nextVersion,
				bumpType: "synced",
				reason: `Package version on disk is already synced to ${nextVersion}`,
			};
		}

		// Normal version bump - if we have commits and the next version doesn't exist, we should bump
		return {
			currentVersion: versionOnDisk,
			shouldBump: true,
			targetVersion: nextVersion,
			bumpType,
			reason: `New ${bumpType} version bump to ${nextVersion}`,
		};
	}

	private calculateNextVersion(currentVersion: string, bumpType: EntityVersionBumpType): string {
		const versionParts = currentVersion.split(".").map(Number);

		if (versionParts.length !== 3 || versionParts.some(Number.isNaN)) {
			throw new Error(`Invalid version: ${currentVersion}`);
		}

		const [major, minor, patch] = versionParts;

		switch (bumpType) {
			case "major":
				return `${major + 1}.0.0`;
			case "minor":
				return `${major}.${minor + 1}.0`;
			case "patch":
				return `${major}.${minor}.${patch + 1}`;
			case "none":
				return currentVersion;
			default:
				throw new Error(`Invalid bump type: ${bumpType}`);
		}
	}

	// Version bump calculation
	private async calculateBumpType(commits: ParsedCommitData[]): Promise<EntityVersionBumpType> {
		if (commits.length === 0) {
			return "none";
		}

		// Root package has special bump logic
		if (this.packageName === "root") {
			return await this.calculateRootBumpType(commits);
		}

		// Regular package bump logic
		const hasBreaking = commits.some((commit) => commit.message.isBreaking);
		if (hasBreaking) {
			return "major";
		}

		const hasFeature = commits.some((commit) => commit.message.type === "feat");
		if (hasFeature) {
			return "minor";
		}

		return "patch";
	}

	private async calculateRootBumpType(commits: ParsedCommitData[]): Promise<EntityVersionBumpType> {
		// Check for app-level breaking changes first (should be minor for root)
		const hasAppBreaking = commits.some(
			(commit) =>
				commit.message.isBreaking && commit.files?.some((file) => file.startsWith("apps/")),
		);
		if (hasAppBreaking) {
			return "minor";
		}

		// Check for workspace-level breaking changes
		const hasWorkspaceBreaking = commits.some(
			(commit) =>
				commit.message.isBreaking &&
				(commit.message.scopes?.includes("root") || commit.message.scopes?.length === 0),
		);
		if (hasWorkspaceBreaking) {
			return "major";
		}

		// Check for root-level features
		const hasWorkspaceFeature = commits.some(
			(commit) =>
				commit.message.type === "feat" &&
				(commit.message.scopes?.includes("root") || commit.message.scopes?.length === 0),
		);
		if (hasWorkspaceFeature) {
			return "minor";
		}

		// Check for dependency changes
		const hasDependencyChanges = await this.hasDependencyChanges();
		if (hasDependencyChanges) {
			return "patch";
		}

		return "patch";
	}

	/**
	 * Check if commits have dependency-related changes for this package
	 */
	private async hasDependencyChanges(): Promise<boolean> {
		try {
			const latestTag = await this.tagPackage.getLatestPackageVersionInHistory();
			if (!latestTag) return true;

			const commits = await this.commitPackage.getCommitsInRange(latestTag, "HEAD");

			if (this.packageName === "root") {
				// For root, check if any commits affect internal packages
				return commits.some(
					(commit) =>
						commit.files?.some(
							(file) => file.startsWith("packages/") || file.startsWith("apps/"),
						) ?? false,
				);
			}

			// For regular packages, check if commits affect dependencies
			const dependencies = await this.commitPackage.getDependenciesAtTag(latestTag);
			return commits.some((commit) => this.commitPackage.affectsDependencies(commit, dependencies));
		} catch {
			return true;
		}
	}
}
