/** biome-ignore-all lint/correctness/noUnusedPrivateClassMembers: wip */

import type { ParsedCommitData } from "../commit";
import { entitiesShell } from "../entities.shell";
import { EntityPackages } from "../packages";
import { EntityTag } from "../tag";
import type {
	EntityGitTagVersion,
	EntityPackageVersionHistory,
	EntityVersionBumpType,
	EntityVersionData,
} from "./types";

export class EntityVersion {
	packageName: string;
	constructor(packageName: string) {
		this.packageName = packageName;
	}

	// Version calculation and management
	async getCurrentVersion(): Promise<string> {
		const packageInstance = new EntityPackages(this.packageName);
		const version = packageInstance.readVersion();
		if (!version) {
			throw new Error(`No version found for package ${this.packageName}`);
		}
		return version;
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

	// Package-specific tag operations
	async getTagPrefix(): Promise<string> {
		const packageInstance = new EntityPackages(this.packageName);
		return packageInstance.getTagSeriesName() || "v";
	}

	async getTagPattern(): Promise<string> {
		const prefix = await this.getTagPrefix();
		return `${prefix}*`;
	}

	async getLatestPackageTag(): Promise<string | null> {
		const pattern = await this.getTagPattern();
		return await EntityTag.getLatestTag(pattern);
	}

	async createPackageTag(version: string, message?: string): Promise<void> {
		const prefix = await this.getTagPrefix();
		const tagName = `${prefix}${version}`;
		const tagMessage = message || `Release ${this.packageName} version ${version}`;

		await EntityTag.createTag(tagName, tagMessage);
	}

	async listPackageTags(): Promise<string[]> {
		const pattern = await this.getTagPattern();
		return await EntityTag.listTags(pattern);
	}

	async packageTagExists(version: string): Promise<boolean> {
		const prefix = await this.getTagPrefix();
		const tagName = `${prefix}${version}`;
		return await EntityTag.tagExists(tagName);
	}

	// Convenience methods for changelog and scripts
	async getBaseTagShaForPackage(from?: string): Promise<string> {
		if (!from) {
			const latestTag = await this.getLatestPackageTag();
			if (latestTag) {
				return await EntityTag.getTagSha(latestTag);
			}
			return await EntityTag.getBaseCommitSha();
		}

		// Check if it's already a valid reference
		try {
			return await EntityTag.getTagSha(from);
		} catch {
			// Fall back to generic commit resolution
			return await EntityTag.getBaseCommitSha(from);
		}
	}

	async getTagsInRangeForPackage(
		from: string,
		to: string,
	): Promise<Array<{ tag: string; previousTag?: string }>> {
		const allTags = await this.listPackageTags();

		// Find tags between from and to commits
		const tagsInRange: Array<{ tag: string; previousTag?: string }> = [];

		for (let i = 0; i < allTags.length; i++) {
			const tag = allTags[i];
			try {
				const tagSha = await EntityTag.getTagSha(tag);

				// Check if tag is in the commit range using git merge-base
				const isAfterFrom = await entitiesShell.gitMergeBaseIsAncestor(from, tagSha);
				const isBeforeTo = await entitiesShell.gitMergeBaseIsAncestor(tagSha, to);

				if (isAfterFrom.exitCode === 0 && isBeforeTo.exitCode === 0) {
					tagsInRange.push({
						tag,
						previousTag: i < allTags.length - 1 ? allTags[i + 1] : undefined,
					});
				}
			} catch (error) {
				console.warn(`Failed to process tag ${tag}:`, error);
			}
		}

		return tagsInRange;
	}

	// Version history and tracking
	async getPackageVersionHistory(): Promise<EntityPackageVersionHistory> {
		try {
			const tags = await this.listPackageTags();
			const versions: EntityGitTagVersion[] = [];

			for (const tag of tags) {
				try {
					const versionData = await this.getPackageVersionAtTag(tag, this.packageName);
					if (versionData) {
						versions.push(versionData);
					}
				} catch (error) {
					console.warn(`Failed to get version for tag ${tag}:`, error);
				}
			}

			// Sort by semantic version (newest first)
			versions.sort((a, b) => this.compareVersions(a.version, b.version));

			return {
				packageName: this.packageName,
				versions,
			};
		} catch (error) {
			console.warn("Failed to get git tags:", error);
			return {
				packageName: this.packageName,
				versions: [],
			};
		}
	}

	async getLatestPackageVersionInHistory(): Promise<string | null> {
		const history = await this.getPackageVersionHistory();
		return history.versions.length > 0 ? history.versions[0].version : null;
	}

	async packageVersionExistsInHistory(version: string): Promise<boolean> {
		const history = await this.getPackageVersionHistory();
		return history.versions.some((v) => v.version === version);
	}

	async getPackageVersionAtTag(
		tagName: string,
		packageName: string,
	): Promise<EntityGitTagVersion | null> {
		try {
			const packageInstance = new EntityPackages(packageName);
			const packageJsonPath = packageInstance.getJsonPath().replace(/^\.\//, "");

			const result = await entitiesShell.gitShowPackageJsonAtTag(tagName, packageJsonPath);
			if (result.exitCode !== 0) {
				return null;
			}

			const packageJson = JSON.parse(result.text());
			const version = packageJson.version;
			if (!version) {
				return null;
			}

			const tagInfo = await EntityTag.getTagInfo(tagName);
			const tagSha = await EntityTag.getTagSha(tagName);

			return {
				tag: tagName,
				version,
				commitHash: tagSha,
				date: new Date(tagInfo.date),
			};
		} catch (error) {
			console.warn(`Failed to get package version at tag ${tagName}:`, error);
			return null;
		}
	}

	// Version bump calculation
	async calculateBumpType(commits: ParsedCommitData[]): Promise<EntityVersionBumpType> {
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

		// Check for internal dependency changes
		const hasInternalChanges = await this.hasInternalDependencyChanges();
		if (hasInternalChanges) {
			return "patch";
		}

		return "patch";
	}

	private async hasInternalDependencyChanges(): Promise<boolean> {
		// For now, always assume internal changes require root bump
		return true;
	}

	// Version data calculation (moved from EntityChangelog)
	async calculateVersionData(
		currentVersion: string,
		commits: ParsedCommitData[],
	): Promise<EntityVersionData> {
		// If no commits, no version change needed
		if (commits.length === 0) {
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
		const versionAlreadyExists = await this.packageVersionExistsInHistory(nextVersion);
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

		const latestPackageVersionInHistory = await this.getLatestPackageVersionInHistory();
		if (latestPackageVersionInHistory && latestPackageVersionInHistory !== currentVersion) {
			throw new Error(
				`Package version ${currentVersion} is behind git tag version ${latestPackageVersionInHistory}`,
			);
		}

		// Normal version bump - if we have commits and the next version doesn't exist, we should bump
		return {
			currentVersion,
			shouldBump: true,
			targetVersion: nextVersion,
			bumpType,
			reason: `New ${bumpType} version bump to ${nextVersion}`,
		};
	}

	// Utility methods
	compareVersions(versionA: string, versionB: string): number {
		const parseVersion = (version: string) =>
			version.split(".").map((part) => Number.parseInt(part.replace(/[^\d]/g, ""), 10));

		const [majorA, minorA, patchA] = parseVersion(versionA);
		const [majorB, minorB, patchB] = parseVersion(versionB);

		if (majorA !== majorB) return majorA - majorB;
		if (minorA !== minorB) return minorA - minorB;
		return patchA - patchB;
	}

	extractVersionFromTag(tagName: string): string {
		const prefix = EntityTag.detectPrefix(tagName) || "";
		return tagName.replace(prefix, "");
	}

	// Legacy methods for backward compatibility with tests
	async getNextVersion(bumpType: EntityVersionBumpType): Promise<string> {
		const currentVersion = await this.getCurrentVersion();
		return this.calculateNextVersion(currentVersion, bumpType);
	}

	async listTags(prefix: string): Promise<string[]> {
		const result = await entitiesShell.gitTagList(prefix);
		return result.text().trim().split("\n").filter(Boolean);
	}

	async getTagInfo(tagName: string): Promise<{ date: string; message: string }> {
		const result = await entitiesShell.gitTagInfo(tagName);

		if (result.exitCode === 0) {
			const lines = result.text?.().trim?.().split("\n").filter(Boolean) ?? [];
			if (lines.length >= 2) {
				return {
					date: lines[0],
					message: lines[1],
				};
			}
		}
		throw new Error(`Could not get info for tag ${tagName}`);
	}

	async getTagSha(tagName: string): Promise<string> {
		const result = await entitiesShell.gitRevParse(tagName);
		if (result.exitCode === 0) {
			return result.text().trim();
		}
		throw new Error(`Tag ${tagName} not found`);
	}

	async tagExists(tagName: string): Promise<boolean> {
		const result = await entitiesShell.gitTagExists(tagName);
		return result.exitCode === 0 && result.text().trim() === tagName;
	}

	getVersionFromTag(tagName: string): string {
		return this.extractVersionFromTag(tagName);
	}
}
