import { $ } from "bun";
import { EntityPackages } from "../packages";
import { tagRules } from "./rules";
import type { ParsedTag, TagValidationResult } from "./types";

export * from "./types";

const defaultPrefix = tagRules.getConfig().prefix.list[0];
export const EntityTag = {
	parseByName(tagName: string): ParsedTag {
		const format = EntityTag.detectFormat(tagName);
		const prefix = EntityTag.detectPrefix(tagName);
		const name = tagName;

		return {
			name,
			prefix,
			format,
		};
	},

	toTag(version: string): string {
		return `${EntityTag.getPrefix()}${version}`;
	},

	validate(tag: string | ParsedTag): TagValidationResult {
		const parsedTag = typeof tag === "string" ? EntityTag.parseByName(tag) : tag;
		const rules = tagRules.getRules();
		const errors = [];

		for (const rule of rules) {
			const result = rule.validator(parsedTag);
			if (result !== true) {
				errors.push(result);
			}
		}

		return { isValid: errors.length === 0, errors };
	},

	getPrefix(): string {
		return defaultPrefix;
	},

	async getBaseTagSha(from?: string): Promise<string> {
		if (!from) {
			// No from specified, get the base tag
			const tag = await EntityTag._getBaseTag(defaultPrefix);
			if (tag) {
				return tag;
			}
			return await EntityTag._getFirstCommit();
		}

		// First check if it's a semver tag
		const fromIsSemver = EntityTag.parseByName(from).format === "semver";
		if (fromIsSemver) {
			const isExistingTag = await EntityTag.tagExists(from);
			if (isExistingTag) {
				return from;
			}
		}

		// Check if it's a commit hash or branch name
		const result = await $`git rev-parse ${from}`.nothrow().quiet();
		const sha = result.text().trim();
		if (sha) return sha;

		// If we get here, the reference wasn't found
		throw new Error(`Invalid reference: ${from}. Not found as tag, branch, or commit.`);
	},
	async _getBaseTag(prefix: string): Promise<string | undefined> {
		const result = await $`git tag --sort=-version:refname --list "${prefix}*" | head -1`
			.nothrow()
			.quiet();

		if (result.exitCode === 0) {
			const tag = result.text().trim();
			return tag || undefined;
		}
		return undefined;
	},
	async _getTagSha(tagName: string): Promise<string> {
		const result = await $`git rev-parse ${tagName}`.nothrow().quiet();
		if (result.exitCode === 0) {
			return result.text().trim();
		}
		throw new Error(`Tag ${tagName} not found`);
	},
	async _getFirstCommit(): Promise<string> {
		const result = await $`git rev-list --max-parents=0 HEAD`.nothrow().quiet();
		if (result.exitCode === 0) {
			return result.text().trim();
		}
		throw new Error("Could not find first commit");
	},

	async getTagInfo(tagName: string): Promise<{ date: string; message: string }> {
		const result =
			await $`git tag -l --format='%(creatordate:iso8601)%0a%(contents:subject)' ${tagName}`
				.nothrow()
				.quiet();

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
	},

	async listTags(prefix: string): Promise<string[]> {
		const result = await $`git tag --list "${prefix}*" --sort=-version:refname`.nothrow().quiet();
		return result.text().trim().split("\n").filter(Boolean);
	},

	async getTagsInRange(
		from: string,
		to: string,
	): Promise<Array<{ tag: string; previousTag?: string }>> {
		const prefix = EntityTag.getPrefix();
		const allTags = await EntityTag.listTags(prefix);

		const fromIndex = allTags.indexOf(from);
		const toIndex = allTags.indexOf(to);

		if (fromIndex === -1 || toIndex === -1) {
			return [];
		}

		const startIndex = Math.min(fromIndex, toIndex);
		const endIndex = Math.max(fromIndex, toIndex);
		const tagsInRange = allTags.slice(startIndex, endIndex + 1);

		return tagsInRange.map((tag, index) => ({
			previousTag: index > 0 ? tagsInRange[index - 1] : undefined,
			tag,
		}));
	},

	/**
	 * Get package version history from git tags
	 */
	async getPackageVersionHistory(packageName: string): Promise<{
		packageName: string;
		versions: Array<{
			tag: string;
			version: string;
			commitHash: string;
			date: Date;
		}>;
	}> {
		try {
			// Get all tags
			const prefix = EntityTag.getPrefix();
			const tags = await EntityTag.listTags(prefix);

			const versions: Array<{
				tag: string;
				version: string;
				commitHash: string;
				date: Date;
			}> = [];

			for (const tag of tags) {
				try {
					const versionData = await EntityTag.getPackageVersionAtTag(tag, packageName);
					if (versionData) {
						versions.push(versionData);
					}
				} catch (error) {
					console.warn(`Failed to get version for tag ${tag}:`, error);
				}
			}

			// Sort by semantic version (newest first)
			versions.sort((a, b) =>
				EntityTag.compareVersions(EntityTag.toTag(b.version), EntityTag.toTag(a.version)),
			);

			return {
				packageName,
				versions,
			};
		} catch (error) {
			console.warn("Failed to get git tags:", error);
			return {
				packageName,
				versions: [],
			};
		}
	},

	/**
	 * Get the version of each package.json at a specific git tag
	 */
	async getPackageVersionAtTag(
		tag: string,
		packageName: string,
	): Promise<{
		tag: string;
		version: string;
		commitHash: string;
		date: Date;
	} | null> {
		try {
			if (tag === "HEAD") {
				return {
					tag,
					version: new EntityPackages(packageName).readVersion(),
					commitHash: await EntityTag._getTagSha(tag),
					date: new Date(),
				};
			}

			// Get commit hash for the tag using EntityTag
			const commitHash = await EntityTag._getTagSha(tag);

			// Get tag info using EntityTag
			const tagInfo = await EntityTag.getTagInfo(tag);
			const date = new Date(tagInfo.date);

			// Get package.json content at this tag
			const packageJsonPath = new EntityPackages(packageName).getJsonPath();

			// Use git show to get file content at specific tag without checking out
			const packageJsonResult = await $`git show ${tag}:${packageJsonPath}`.nothrow().quiet();
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
			return {
				tag,
				version: EntityTag.getVersionFromTag(tag),
				commitHash: await EntityTag._getTagSha(tag),
				date: new Date((await EntityTag.getTagInfo(tag)).date),
			};
		}
	},
	/**
	 * Get the latest version for a package
	 */
	async getLatestPackageVersionInHistory(packageName: string): Promise<string | null> {
		const history = await this.getPackageVersionHistory(packageName);
		return history.versions.length > 0 ? history.versions[0].version : null;
	},
	/**
	 * Check if a version exists for a package
	 */
	async packageVersionExistsInHistory(packageName: string, version: string): Promise<boolean> {
		const history = await this.getPackageVersionHistory(packageName);
		return history.versions.some((v) => v.version === version);
	},

	compareVersions(tagA: string, tagB: string): number {
		const parseVersion = (tag: string) => {
			const match = tag.match(new RegExp(`^${EntityTag.getPrefix()}?(\\d+)\\.(\\d+)\\.(\\d+)`));
			if (!match) return [0, 0, 0];
			return [
				Number.parseInt(match[1], 10),
				Number.parseInt(match[2], 10),
				Number.parseInt(match[3], 10),
			];
		};

		const [majorA, minorA, patchA] = parseVersion(tagA);
		const [majorB, minorB, patchB] = parseVersion(tagB);

		if (majorA !== majorB) return majorA - majorB;
		if (minorA !== minorB) return minorA - minorB;
		return patchA - patchB;
	},

	async createTag(
		tagName: string,
		message: string,
		options: { force?: boolean; push?: boolean } = {},
	): Promise<void> {
		const { force = false, push = false } = options;

		if (!force && (await EntityTag.tagExists(tagName))) {
			throw new Error(`Tag ${tagName} already exists, use --force to override`);
		}
		const validation = EntityTag.validate(tagName);
		if (!validation.isValid) {
			throw new Error(`Tag ${tagName} is invalid: ${validation.errors.join(", ")}`);
		}

		try {
			const forceFlag = force ? "-f" : "";
			await $`git tag ${forceFlag} -a ${tagName} -m "${message}"`;
		} catch (error) {
			throw new Error(
				`Failed to create tag ${tagName}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}

		if (push) {
			try {
				await $`git push origin ${tagName}`;
			} catch (error) {
				throw new Error(
					`Failed to push tag ${tagName}: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		}
	},
	async deleteTag(tagName: string, deleteRemote = false): Promise<void> {
		if (!(await EntityTag.tagExists(tagName))) {
			throw new Error(`Tag ${tagName} does not exist`);
		}

		try {
			await $`git tag -d ${tagName}`;
		} catch (error) {
			throw new Error(
				`Failed to delete tag ${tagName}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}

		if (deleteRemote) {
			try {
				await $`git push origin :refs/tags/${tagName}`;
			} catch (error) {
				throw new Error(
					`Failed to delete remote tag ${tagName}: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		}
	},
	async tagExists(tagName: string): Promise<boolean> {
		const result = await $`git tag --list ${tagName}`.nothrow().quiet();
		return result.exitCode === 0 && result.text().trim() === tagName;
	},

	detectFormat(tagName: string): "semver" | "calver" | "custom" | undefined {
		if (!tagName) return undefined; // empty tag
		if (/^v?\d+\.\d+\.\d+/.test(tagName)) return "semver"; // v1.0.0
		if (/^\d{4}\.\d{2}\.\d{2}/.test(tagName)) return "calver"; // 2025.08.18
		return "custom"; // custom-format
	},

	detectPrefix(tagName: string): string | undefined {
		if (!tagName) return undefined; // empty tag
		const firstPart = tagName.split(".")[0].replace(/[0-9]/g, ""); // v1.0.0 -> v
		if (/^[a-zA-Z]+/.test(firstPart)) return firstPart; // v1.0.0 -> v
		return undefined; // 1.0.0 -> undefined
	},

	getVersionFromTag(tag: string): string {
		const versionMatch = tag.match(
			new RegExp(`^${EntityTag.getPrefix()}?(\\d+)\\.(\\d+)\\.(\\d+)`),
		);
		if (!versionMatch) return "";
		return versionMatch[1];
	},
};
