import { type ParsedCommitData, prCategories } from "../commit";
import { entitiesConfig } from "../config/config";
import { EntityTag } from "../tag";
import { ChangelogTemplate } from "./template";

const DEFAULT_BADGE_COLOR = "6B7280";
const prefix = EntityTag.getPrefix();
const validTypes = entitiesConfig.getConfig().commit.conventional.type?.list ?? [];

export class DefaultChangelogTemplate extends ChangelogTemplate {
	protected generateChangelogHeader(packageName: string): string {
		return [
			`## Changelog (${packageName})`,
			"",
			"[![Keep a Changelog](https://img.shields.io/badge/changelog-Keep%20a%20Changelog%20v1.0.0-$E05735)](https://keepachangelog.com)",
			"[![Semantic Versioning](https://img.shields.io/badge/semver-semantic%20versioning%20v2.0.0-%23E05735)](https://semver.org)",
			"",
			"All notable changes to this project will be documented in this file.",
			"The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),",
			"and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).",
			"",
		].join("\n");
	}

	protected generateChangelogVersionHeader(version: string): string {
		return ["", `## ${version === "[Unreleased]" ? "" : prefix}${version}`, ""].join("\n");
	}

	protected generateCommitSection(commit: ParsedCommitData, repoUrl: string): string {
		if (commit.pr?.prNumber) {
			return this.generatePrSection(commit, commit.pr.prCommits || [commit], repoUrl);
		}

		return `###### ${this.generateCommitLine(commit, repoUrl)}`;
	}

	private generatePrSection(
		mainCommit: ParsedCommitData,
		allCommits: ParsedCommitData[],
		repoUrl: string,
	): string {
		const { pr: { prNumber, prCategory = "other", prBranchName } = {} } = mainCommit;
		const commitCount = allCommits.length;

		const categoryEmoji = prCategories[prCategory]?.emoji;
		const categoryTitle = prCategories[prCategory]?.label;
		const prCategoryBadge = `<img src="https://img.shields.io/badge/${encodeURIComponent(categoryTitle)}-495057?style=flat" alt="${categoryTitle}" style="vertical-align: middle;" />`;
		const prNumberBadge =
			!!prNumber &&
			`<img src="https://img.shields.io/badge/%23${prNumber}-blue?style=flat" alt="#${prNumber}" style="vertical-align: middle;" />`;
		const commitCountBadge = `<img src="https://img.shields.io/badge/${commitCount}%20commits-green?style=flat" alt="${commitCount} commits" style="vertical-align: middle;" />`;
		const prNumberLink =
			!!prNumberBadge && `<a href="${repoUrl}/pull/${prNumber}">${prNumberBadge}</a>`;

		const prMessages = mainCommit.message.isMerge
			? [
					// mainCommit.message.bodyLines[0], // We don't want the first line: "Merge pull request #154 from feature/custom-version-management"
					// "", // Empty line for separation, if you added the first line above, uncomment this line as well
					...mainCommit.message.bodyLines.slice(1), // Rest of the lines: "Refactors the version management system..."
				]
			: [mainCommit.message.description, "", ...mainCommit.message.bodyLines];

		return [
			// Format: emoji branch-name category-title #PR-number commit-count
			// Example: 🔄 refactor/test-versioning Code Quality & Refactoring #144 9 commits
			"",
			`### ${categoryEmoji} ${prBranchName?.fullName} ${prCategoryBadge} ${prNumberLink} ${commitCountBadge}`,
			"",
			...prMessages,
			"",
			"<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>",
			"",
			...allCommits.map((commit) => `- ${this.generateCommitLine(commit, repoUrl)}`),
			"",
			"</details>",
			"",
		].join("\n");
	}

	private generateCommitLine(commit: ParsedCommitData, repoUrl: string): string {
		const {
			info: { hash, author = "Unknown" } = {},
			message: { type, description, scopes = [] },
		} = commit;

		const hashKey = hash?.substring(0, 7) || "unknown";
		const hashUrl = hash ? `${repoUrl}/commit/${hash}` : undefined;

		const scopeSection =
			scopes && scopes.length > 0
				? scopes.map((s: string) => s.toLowerCase().replace("-", "%20")).join(",")
				: "";

		const badgeText = `${type}-(${scopeSection || "noscope"})`;
		const badgeColor = validTypes.find((t) => t.type === type)?.badgeColor || DEFAULT_BADGE_COLOR;
		const badge = `<img src="https://img.shields.io/badge/${badgeText}-${badgeColor}?style=flat" alt="${type}" style="vertical-align: middle;" />`;
		const badgeUrl = hashUrl ? `<a href="${hashUrl}">${badge}</a>` : badge;

		const hashLink = hashUrl ? `([${hashKey}](${hashUrl}))` : `[${hashKey}]`;

		return [
			badgeUrl,
			description,
			hashLink,
			author && (author.includes("@") ? `by [${author}](mailto:${author})` : `by **${author}**`),
		]
			.filter(Boolean)
			.join(" ")
			.trim();
	}
}
