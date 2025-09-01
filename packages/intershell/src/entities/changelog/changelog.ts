import type { ParsedCommitData } from "../commit";
import { EntityCommit } from "../commit";
import { EntityPackages } from "../packages";
import { EntityTag } from "../tag";
import { EntityVersion } from "../version";
import { changelogShell } from "./changelog.shell";
import type { TemplateEngine } from "./template";
import type { ChangelogData, VersionData } from "./types";

export class EntityChangelog {
	private packageName: string;
	private package: EntityPackages;
	private entityVersion: EntityVersion;
	private fromSha?: string;
	private toSha?: string;

	private changelogData: ChangelogData | undefined;
	private versionData: VersionData | undefined;
	private templateEngine: TemplateEngine;
	private versionMode: boolean;

	constructor(packageName: string, templateEngine: TemplateEngine, versionMode = true) {
		this.packageName = packageName;
		this.package = new EntityPackages(this.packageName);
		this.entityVersion = new EntityVersion(this.packageName);
		this.templateEngine = templateEngine;
		this.versionMode = versionMode;
	}

	async calculateRange(from: string, to?: string): Promise<void> {
		this.fromSha = from;
		this.toSha = to || "HEAD";
		if (!this.fromSha || !this.toSha) {
			throw new Error(`Range not set: from=${this.fromSha}, to=${this.toSha}`);
		}

		const unreleasedCommits = await this.getCommitsInRange(
			await EntityTag.getBaseTagSha(),
			this.toSha,
		);

		const { version: currentVersion } = (await this.entityVersion.getPackageVersionAtTag(
			await EntityTag.getBaseTagSha(),
			this.packageName,
		)) || { version: "0.0.0" };

		if (!currentVersion) {
			throw new Error(
				`Could not get current version for package ${this.packageName} at tag ${await EntityTag.getBaseTagSha()}`,
			);
		}

		const versionData = await this.entityVersion.calculateVersionData(
			currentVersion,
			unreleasedCommits,
		);
		const versionOnDisk = this.package.readVersion();

		const changelogData: ChangelogData = new Map();

		const tagsInRange = await EntityTag.getTagsInRange(this.fromSha, this.toSha);

		const versionTags = tagsInRange;
		if (versionData.shouldBump) {
			versionTags.push({
				tag: this.toSha,
				previousTag: await EntityTag.getBaseTagSha(),
			});
		}

		for (const tag of versionTags) {
			const commits = await this.getCommitsInRange(tag.previousTag as string, tag.tag);
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

			const packageVersion = await this.entityVersion.getPackageVersionAtTag(
				tag.tag,
				this.packageName,
			);
			if (!packageVersion) {
				throw new Error(
					`Could not get version for tag ${tag.tag} in package ${this.packageName} in the range ${this.fromSha}..${this.toSha}`,
				);
			}

			changelogData.set(this.versionMode ? packageVersion.version : "[Unreleased]", sortedCommits);
		}

		this.changelogData = changelogData;
		this.versionData = {
			...versionData,
			bumpType: versionOnDisk === versionData.targetVersion ? "synced" : versionData.bumpType,
			shouldBump: versionOnDisk === versionData.targetVersion ? false : versionData.shouldBump,
		};
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

	private async getCommitsInRange(from: string, to: string): Promise<ParsedCommitData[]> {
		const gitRange = from === "0.0.0" ? to : `${from}..${to}`;

		try {
			let commitHashes: string[];

			if (this.packageName === "root") {
				const allHashes = await changelogShell.gitLog(gitRange, {
					path: ".",
				});

				const mergeHashes = await changelogShell.gitLog(gitRange, {
					merges: true,
				});

				commitHashes = [...new Set([...allHashes, ...mergeHashes])];
			} else {
				const packageHashes = await changelogShell.gitLog(gitRange, {
					path: this.package.getPath(),
				});
				const mergeHashes = await changelogShell.gitLog(gitRange, {
					merges: true,
				});

				const relevantMergeHashes: string[] = [];
				for (const hash of mergeHashes) {
					const prCommitsResult = await changelogShell.gitLog(`${hash}^..${hash}^2`, {
						path: this.package.getPath(),
					});

					if (prCommitsResult.length > 0) {
						relevantMergeHashes.push(hash);
					}
				}

				commitHashes = [...new Set([...packageHashes, ...relevantMergeHashes])];
			}

			const commits: ParsedCommitData[] = [];
			for (const hash of commitHashes) {
				const commit = await EntityCommit.parseByHash(hash);
				commits.push(commit);
			}

			return commits;
		} catch (error) {
			console.warn("Failed to get commits in range:", error);
			return [];
		}
	}
}
