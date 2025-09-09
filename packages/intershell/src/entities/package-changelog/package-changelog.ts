import type { ParsedCommitData } from "../commit";
import type { EntityPackage } from "../package";
import type { ChangelogData, VersionData } from "./package-changelog.types";
import type { TemplateEngine } from "./template";

export class EntityPackageChangelog {
	private package: EntityPackage;
	private template: TemplateEngine;
	private versionMode: boolean;

	private changelogData: ChangelogData | undefined;
	private versionData: VersionData | undefined;

	constructor(
		packageInstance: EntityPackage,
		commits: ParsedCommitData[],
		options: { template: TemplateEngine; versionMode?: boolean; versionData?: VersionData },
	) {
		this.package = packageInstance;
		this.template = options.template;
		this.versionMode = options.versionMode ?? true;
		this.versionData = options.versionData;
		this.changelogData = this.getChangelogData(commits);
	}

	generateChangelog(): string {
		if (!this.changelogData) {
			throw new Error("Changelog data not generated.");
		}
		if (!this.template) {
			throw new Error("Template engine not set.");
		}

		const changelog = this.template.generateContent(this.changelogData);
		return changelog;
	}

	generateMergedChangelog(): string {
		if (!this.changelogData) {
			throw new Error("Data not analyzed. Call calculateRange() first.");
		}
		if (!this.versionData) {
			throw new Error("Version data not determined. Call calculateRange() first.");
		}
		if (!this.template) {
			throw new Error("Template engine not set.");
		}

		const mergedChangelogData: ChangelogData = new Map();

		const existingChangelog = this.package.readChangelog();
		const existingChangelogData = this.template.parseVersions(existingChangelog);

		for (const [version, content] of existingChangelogData) {
			mergedChangelogData.set(version, content);
		}
		for (const [version, content] of this.changelogData) {
			mergedChangelogData.set(version, content);
		}

		const mergedChangelog = this.template.generateContent(mergedChangelogData);
		return mergedChangelog;
	}

	private getChangelogData(commits: ParsedCommitData[]): ChangelogData {
		const changelogData: ChangelogData = new Map();

		if (commits.length === 0) {
			return changelogData;
		}

		// Use target version if there's a version bump, otherwise use current version
		const versionToUse = this.versionData?.shouldBump
			? this.versionData.targetVersion
			: this.package.readVersion() || "0.0.0";

		changelogData.set(this.versionMode ? versionToUse : "[Unreleased]", commits);

		return changelogData;
	}
}
