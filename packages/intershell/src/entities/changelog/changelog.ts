import { EntityPackages } from "../packages";
import { EntityVersion } from "../version";
import type { TemplateEngine } from "./template";
import type { ChangelogData, VersionData } from "./types";

export class EntityChangelog {
	private packageName: string;
	private package: EntityPackages;

	private changelogData: ChangelogData | undefined;
	private versionData: VersionData | undefined;
	private templateEngine: TemplateEngine;
	private versionMode: boolean;

	constructor(packageName: string, templateEngine: TemplateEngine, versionMode = true) {
		this.packageName = packageName;
		this.package = new EntityPackages(this.packageName);
		this.templateEngine = templateEngine;
		this.versionMode = versionMode;
	}

	async calculateRange(from: string, to?: string): Promise<void> {
		const fromSha = from;
		const toSha = to || "HEAD";
		if (!fromSha || !toSha) {
			throw new Error(`Range not set: from=${fromSha}, to=${toSha}`);
		}

		const packageVersionEntity = new EntityVersion(this.packageName);

		// Use the provided from SHA, or auto-detect if not provided
		const baseTagSha = fromSha;
		const unreleasedCommits = await packageVersionEntity.getCommitsInRange(baseTagSha, toSha);

		// Get the current version from git tags (what git thinks the current version is)
		let currentVersionFromGit: string;
		const isTagName = /^[a-zA-Z0-9\-_.]+$/.test(baseTagSha) && !/^[a-f0-9]{40}$/i.test(baseTagSha);

		if (isTagName) {
			const versionData = await packageVersionEntity.getPackageVersionAtTag(
				baseTagSha,
				this.packageName,
			);
			currentVersionFromGit = versionData?.version || "0.0.0";
		} else {
			// baseTagSha is a commit hash, try to get the latest git tag version first
			const latestVersion = await packageVersionEntity.getLatestPackageVersionInHistory();
			if (latestVersion) {
				currentVersionFromGit = latestVersion;
			} else {
				// No git tags exist, use current package.json version for first-time versioning
				currentVersionFromGit = this.package.readVersion() || "0.0.0";
			}
		}

		// Get the version from package.json (what's actually on disk)
		const versionOnDisk = this.package.readVersion() || "0.0.0";

		if (!currentVersionFromGit || !versionOnDisk) {
			throw new Error(`Could not get versions for package ${this.packageName}`);
		}

		// Pass both versions to calculateVersionData for proper decision making
		this.versionData = await packageVersionEntity.calculateVersionData(
			versionOnDisk,
			currentVersionFromGit,
			unreleasedCommits,
		);

		const tagsInRange = await packageVersionEntity.getTagsInRangeForPackage(fromSha, toSha);
		if (this.versionData.shouldBump) {
			// Only add toSha to tags if it's actually a tag (not HEAD or a commit hash)
			const isTag = await packageVersionEntity.packageTagExists(toSha);
			if (isTag) {
				tagsInRange.push({
					tag: toSha,
					previousTag: await packageVersionEntity.getBaseTagShaForPackage(),
				});
			}
		}

		const changelogData: ChangelogData = new Map();

		// Handle existing tags in range
		for (const tag of tagsInRange) {
			const commits = await packageVersionEntity.getCommitsInRange(
				tag.previousTag as string,
				tag.tag,
			);
			const mergeCommits = commits.filter((commit) => commit.message.isMerge);
			const orphanCommits = commits.filter(
				(commit) =>
					!commit.message.isMerge &&
					!mergeCommits.some((mergeCommit) =>
						mergeCommit.pr?.prCommits?.some(
							(prCommit) => prCommit.info?.hash === commit.info?.hash,
						),
					),
			);
			const sortedCommits = [...mergeCommits, ...orphanCommits].sort(
				(a, b) => new Date(b.info?.date || "0").getTime() - new Date(a.info?.date || "0").getTime(),
			);

			const packageVersion = await packageVersionEntity.getPackageVersionAtTag(
				tag.tag,
				this.packageName,
			);
			if (!packageVersion) {
				throw new Error(
					`Could not get version for tag ${tag.tag} in package ${this.packageName} in the range ${fromSha}..${toSha}`,
				);
			}

			// Use target version if there's a version bump, otherwise use the tag version
			const versionToUse = this.versionData.shouldBump
				? this.versionData.targetVersion
				: packageVersion.version;
			changelogData.set(this.versionMode ? versionToUse : "[Unreleased]", sortedCommits);
		}

		// If we have a version bump and there are existing tags, also include commits from the last tag to HEAD
		if (this.versionData.shouldBump && tagsInRange.length > 0) {
			const lastTag = tagsInRange[tagsInRange.length - 1];
			const commitsFromLastTag = await packageVersionEntity.getCommitsInRange(lastTag.tag, toSha);
			const mergeCommits = commitsFromLastTag.filter((commit) => commit.message.isMerge);
			const orphanCommits = commitsFromLastTag.filter(
				(commit) =>
					!commit.message.isMerge &&
					!mergeCommits.some((mergeCommit) =>
						mergeCommit.pr?.prCommits?.some(
							(prCommit) => prCommit.info?.hash === commit.info?.hash,
						),
					),
			);
			const sortedCommits = [...mergeCommits, ...orphanCommits].sort(
				(a, b) => new Date(b.info?.date || "0").getTime() - new Date(a.info?.date || "0").getTime(),
			);

			// Add commits from last tag to HEAD for the target version
			changelogData.set(
				this.versionMode ? this.versionData.targetVersion : "[Unreleased]",
				sortedCommits,
			);
		}

		// Handle first-time versioning: if no tags exist but we have commits, create changelog for target version
		if (tagsInRange.length === 0 && unreleasedCommits.length > 0 && this.versionData.shouldBump) {
			const mergeCommits = unreleasedCommits.filter((commit) => commit.message.isMerge);
			const orphanCommits = unreleasedCommits.filter(
				(commit) =>
					!commit.message.isMerge &&
					!mergeCommits.some((mergeCommit) =>
						mergeCommit.pr?.prCommits?.some(
							(prCommit) => prCommit.info?.hash === commit.info?.hash,
						),
					),
			);
			const sortedCommits = [...mergeCommits, ...orphanCommits].sort(
				(a, b) => new Date(b.info?.date || "0").getTime() - new Date(a.info?.date || "0").getTime(),
			);

			// Use the target version for first-time versioning
			const targetVersion = this.versionData.targetVersion;
			changelogData.set(this.versionMode ? targetVersion : "[Unreleased]", sortedCommits);
		}

		this.changelogData = changelogData;
	}

	getVersionData(): VersionData {
		if (!this.versionData) {
			throw new Error("Version data not determined. Call calculateRange() first.");
		}
		return this.versionData;
	}

	generateChangelog(): string {
		if (!this.changelogData) {
			throw new Error("Data not analyzed. Call calculateRange() first.");
		}
		if (!this.versionData) {
			throw new Error("Version data not determined. Call calculateRange() first.");
		}
		if (!this.templateEngine) {
			throw new Error("Template engine not set.");
		}

		const changelog = this.templateEngine.generateContent(this.changelogData);
		return changelog;
	}

	generateMergedChangelog(): string {
		if (!this.changelogData) {
			throw new Error("Data not analyzed. Call calculateRange() first.");
		}
		if (!this.versionData) {
			throw new Error("Version data not determined. Call calculateRange() first.");
		}
		if (!this.templateEngine) {
			throw new Error("Template engine not set.");
		}

		const mergedChangelogData: ChangelogData = new Map();

		const existingChangelog = this.package.readChangelog();
		const existingChangelogData = this.templateEngine.parseVersions(existingChangelog);

		for (const [version, content] of existingChangelogData) {
			mergedChangelogData.set(version, content);
		}
		for (const [version, content] of this.changelogData) {
			mergedChangelogData.set(version, content);
		}

		const mergedChangelog = this.templateEngine.generateContent(mergedChangelogData);
		return mergedChangelog;
	}

	getCommitCount(): number {
		if (!this.changelogData) {
			throw new Error("Data not analyzed. Call calculateRange() first.");
		}
		return this.changelogData.values().reduce((acc, curr) => {
			return (
				acc +
				(Array.isArray(curr)
					? curr.reduce((acc, curr) => acc + 1 + (curr.pr?.prCommits?.length ?? 0), 0)
					: 0)
			);
		}, 0);
	}
}
