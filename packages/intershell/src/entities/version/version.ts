/** biome-ignore-all lint/correctness/noUnusedPrivateClassMembers: wip */
import type { ParsedCommitData } from "../commit";
import { entitiesShell } from "../entities.shell";
import { EntityPackages } from "../packages";
import type {
	EntityGitTagVersion,
	EntityPackageVersionHistory,
	EntityVersionBumpType,
	EntityVersionData,
} from "./types";

export class EntityVersion {
	constructor(private packageName: string) {}

	// Version calculation and management
	async getCurrentVersion(): Promise<string> {
		const packageInstance = new EntityPackages(this.packageName);
		const version = packageInstance.readVersion();
		if (!version) {
			throw new Error(`No version found for package ${this.packageName}`);
		}
		return version;
	}

	async getNextVersion(bumpType: EntityVersionBumpType): Promise<string> {
		const currentVersion = await this.getCurrentVersion();
		return this.calculateNextVersion(currentVersion, bumpType);
	}

	private calculateNextVersion(currentVersion: string, bumpType: EntityVersionBumpType): string {
		const [major, minor, patch] = currentVersion.split(".").map(Number);
		if (Number.isNaN(major) || Number.isNaN(minor) || Number.isNaN(patch)) {
			throw new Error(`Invalid version: ${currentVersion}`);
		}

		switch (bumpType) {
			case "major":
				return `${major + 1}.0.0`;
			case "minor":
				return `${major}.${minor + 1}.0`;
			case "patch":
				return `${major}.${minor}.${patch + 1}`;
			default:
				throw new Error(`Invalid bump type: ${bumpType}`);
		}
	}

	// Version history and tracking
	async getPackageVersionHistory(): Promise<EntityPackageVersionHistory> {
		try {
			const packageInstance = new EntityPackages(this.packageName);
			const prefix = packageInstance.getTagSeriesName() || "v";
			const tags = await this.listTags(prefix);

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

	// Version bump type calculation (moved from EntityChangelog)
	async calculateBumpType(commits: ParsedCommitData[]): Promise<EntityVersionBumpType> {
		if (this.packageName === "root") {
			return await this.calculateRootBumpType(commits);
		}
		return await this.calculatePackageBumpType(commits);
	}

	private async calculateRootBumpType(commits: ParsedCommitData[]): Promise<EntityVersionBumpType> {
		// Check for workspace-level breaking changes
		const hasWorkspaceBreaking = commits.some(
			(c) => c.message.isBreaking && this.isWorkspaceLevelCommit(c),
		);
		if (hasWorkspaceBreaking) return "major";

		// Check for app-level breaking changes
		const hasAppBreaking = commits.some((c) => c.message.isBreaking && this.isAppLevelCommit(c));
		if (hasAppBreaking) return "minor";

		// Check for features, fixes, or refactors
		const hasSignificantChanges = commits.some(
			(c) => ["feat", "fix", "refactor"].includes(c.message.type) && this.isWorkspaceLevelCommit(c),
		);
		if (hasSignificantChanges) return "minor";

		// Check for any internal changes (force patch bump)
		const hasInternalChanges = await this.hasInternalDependencyChanges();
		if (hasInternalChanges) return "patch";

		return "none";
	}

	private async calculatePackageBumpType(
		commits: ParsedCommitData[],
	): Promise<EntityVersionBumpType> {
		// Package-specific bump type calculation
		let hasBreaking = false;
		let hasFeature = false;

		for (const commit of commits) {
			if (commit.message.isBreaking) hasBreaking = true;
			if (commit.message.type === "feat") hasFeature = true;
		}

		if (hasBreaking) return "major";
		if (hasFeature) return "minor";
		return "patch";
	}

	private isWorkspaceLevelCommit(commit: ParsedCommitData): boolean {
		return (
			commit.files?.some(
				(file) =>
					file.startsWith(".") ||
					file.includes("turbo.json") ||
					file.includes("package.json") ||
					file.includes("docker-compose"),
			) ?? false
		);
	}

	private isAppLevelCommit(commit: ParsedCommitData): boolean {
		return (
			commit.files?.some((file) => file.startsWith("apps/") || file.includes("src/app/")) ?? false
		);
	}

	private async hasInternalDependencyChanges(): Promise<boolean> {
		// Simple check: if any internal packages changed, root should bump
		// This replaces the complex dependency analyzer
		return true; // For now, always assume internal changes require root bump
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

	// Git operations (moved from EntityTag)
	async listTags(prefix: string): Promise<string[]> {
		const result = await entitiesShell.gitTagList(prefix);
		console.log("result", result.exitCode, result.text());
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

	async getPackageVersionAtTag(
		tag: string,
		packageName: string,
	): Promise<EntityGitTagVersion | null> {
		try {
			if (tag === "HEAD") {
				const version = new EntityPackages(packageName).readVersion();
				if (!version) {
					return null;
				}
				return {
					tag,
					version,
					commitHash: await this.getTagSha(tag),
					date: new Date(),
				};
			}

			// Get commit hash for the tag
			const commitHash = await this.getTagSha(tag);

			// Get tag info
			const tagInfo = await this.getTagInfo(tag);
			const date = new Date(tagInfo.date);

			// Get package.json content at this tag
			const packageJsonPath = new EntityPackages(packageName).getJsonPath();
			const packageJsonResult = await entitiesShell.gitShowPackageJsonAtTag(tag, packageJsonPath);

			if (packageJsonResult.exitCode !== 0) {
				return null;
			}

			const packageJsonContent = packageJsonResult.text().trim();

			// Parse version from package.json
			const versionMatch = packageJsonContent.match(/"version":\s*"([^"]+)"/);
			if (!versionMatch) {
				return null;
			}

			const version = versionMatch[1];

			return {
				tag,
				version,
				commitHash,
				date,
			};
		} catch (error) {
			console.error(`Failed to get package version at tag ${tag}:`, error);
			return null;
		}
	}

	async tagExists(tagName: string): Promise<boolean> {
		const result = await entitiesShell.gitTagExists(tagName);
		return result.exitCode === 0 && result.text().trim() === tagName;
	}

	// Utility methods
	compareVersions(versionA: string, versionB: string): number {
		const parseVersion = (version: string) => {
			const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
			if (!match) return [0, 0, 0];
			return [
				Number.parseInt(match[1], 10),
				Number.parseInt(match[2], 10),
				Number.parseInt(match[3], 10),
			];
		};

		const [majorA, minorA, patchA] = parseVersion(versionA);
		const [majorB, minorB, patchB] = parseVersion(versionB);

		if (majorA !== majorB) return majorA - majorB;
		if (minorA !== minorB) return minorA - minorB;
		return patchA - patchB;
	}

	getVersionFromTag(tag: string): string {
		const packageInstance = new EntityPackages(this.packageName);
		const prefix = packageInstance.getTagSeriesName() || "v";
		const versionMatch = tag.match(new RegExp(`^${prefix}?(\\d+\\.\\d+\\.\\d+)`));
		if (!versionMatch) return "";
		return versionMatch[1];
	}
}
