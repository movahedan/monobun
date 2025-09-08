import { EntityCommitPackage } from "../commit-package";
import { entitiesShell } from "../entities.shell";
import { EntityPackages } from "../packages";
import { EntityTag } from "../tag";
import type { EntityGitTagVersion, EntityPackageVersionHistory } from "../version/types";

export class EntityTagPackage {
	private package: EntityPackages;
	private packageCommits: EntityCommitPackage;

	constructor(packageInstance: EntityPackages) {
		this.package = packageInstance;
		this.packageCommits = new EntityCommitPackage(this.package);
	}

	async getTagPrefix(): Promise<string> {
		return this.package.getTagSeriesName() || "v";
	}

	async createPackageTag(version: string, message?: string): Promise<void> {
		const prefix = await this.getTagPrefix();
		const tagName = `${prefix}${version}`;
		const tagMessage = message || `Release ${this.package.getName()} version ${version}`;

		// Validate the tag prefix for this package before creating the tag
		this.validateTagPrefixForPackage(tagName);

		await EntityTag.createTag(tagName, tagMessage);
	}

	async listPackageTags(): Promise<string[]> {
		return await EntityTag.listTags(await this.getTagPrefix());
	}

	async packageTagExists(version: string): Promise<boolean> {
		const prefix = await this.getTagPrefix();
		const tagName = `${prefix}${version}`;
		return await EntityTag.tagExists(tagName);
	}

	// Convenience methods for changelog and scripts
	async getBaseTagShaForPackage(from?: string): Promise<string> {
		if (!from) {
			const latestTag = await EntityTag.getLatestTag(await this.getTagPrefix());
			if (latestTag) {
				return await EntityTag.getTagSha(latestTag);
			}
			// For first-time versioning, find the first commit where this specific package was introduced
			return await this.packageCommits.getFirstCommitForPackage();
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
					const versionData = await this.getPackageVersionAtTag(tag);
					if (versionData) {
						versions.push(versionData);
					}
				} catch (error) {
					console.warn(`Failed to get version for tag ${tag}:`, error);
				}
			}

			// Sort by semantic version (newest first)
			versions.sort((a, b) => this.compareVersions(b.version, a.version));

			return {
				packageName: this.package.getName(),
				versions,
			};
		} catch (error) {
			console.warn("Failed to get git tags:", error);
			return {
				packageName: this.package.getName(),
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

	async getPackageVersionAtTag(tagName: string): Promise<EntityGitTagVersion | null> {
		try {
			const packageJsonPath = this.package.getJsonPath().replace(/^\.\//, "");

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

	// Package validation methods
	async validateTagPrefixForPackage(tagName: string): Promise<void> {
		const prefix = this.detectTagPrefix(tagName);
		if (prefix) {
			// Extract package name from prefix and check if it should be versioned
			let packageName: string;
			if (prefix === "v") {
				packageName = "root";
			} else if (prefix.endsWith("-v")) {
				// Get all packages and find the one that matches this tag prefix
				const allPackages = await EntityPackages.getAllPackages();
				const matchingPackage = allPackages.find((pkg) => {
					const packageInstance = new EntityPackages(pkg);
					return packageInstance.getTagSeriesName() === prefix;
				});

				if (!matchingPackage) {
					throw new Error(`No package found with tag prefix "${prefix}"`);
				}

				packageName = matchingPackage;
			} else {
				throw new Error(
					`Invalid tag prefix format: "${prefix}". Expected format: v (root) or package-name-v (e.g., api-v, intershell-v)`,
				);
			}

			// Check if this package should be versioned
			const packageInstance = new EntityPackages(packageName);
			if (!packageInstance.shouldVersion()) {
				throw new Error(`Package "${packageName}" should not be versioned (private package)`);
			}
		}
	}

	// Helper methods
	detectTagPrefix(tagName: string): string | undefined {
		// Check for root package tag (v1.0.0)
		if (/^v\d+\.\d+\.\d+/.test(tagName)) {
			return "v";
		}

		// Check for package-specific tag (package-name-v1.0.0)
		const packageTagMatch = tagName.match(/^(.+-v)\d+\.\d+\.\d+/);
		if (packageTagMatch) {
			return packageTagMatch[1];
		}

		return undefined;
	}

	compareVersions(version1: string, version2: string): number {
		const v1Parts = version1.split(".").map(Number);
		const v2Parts = version2.split(".").map(Number);

		for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
			const v1Part = v1Parts[i] || 0;
			const v2Part = v2Parts[i] || 0;

			if (v1Part > v2Part) return 1;
			if (v1Part < v2Part) return -1;
		}

		return 0;
	}
}
