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

		const unreleasedCommits = await packageVersionEntity.getCommitsInRange(
			await packageVersionEntity.getBaseTagShaForPackage(),
			toSha,
		);

		const { version: currentVersion } = (await packageVersionEntity.getPackageVersionAtTag(
			await packageVersionEntity.getBaseTagShaForPackage(),
			this.packageName,
		)) || { version: "0.0.0" };

		if (!currentVersion) {
			throw new Error(
				`Could not get current version for package ${this.packageName} at tag ${await packageVersionEntity.getBaseTagShaForPackage()}`,
			);
		}

		this.versionData = await packageVersionEntity.calculateVersionData(
			currentVersion,
			unreleasedCommits,
		);

		const tagsInRange = await packageVersionEntity.getTagsInRangeForPackage(fromSha, toSha);
		if (this.versionData.shouldBump) {
			tagsInRange.push({
				tag: toSha,
				previousTag: await packageVersionEntity.getBaseTagShaForPackage(),
			});
		}

		const changelogData: ChangelogData = new Map();
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
				(a, b) => new Date(a.info?.date || "0").getTime() - new Date(b.info?.date || "0").getTime(),
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

			changelogData.set(this.versionMode ? packageVersion.version : "[Unreleased]", sortedCommits);
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
