import type { ParsedCommitData } from "../commit";
import { EntityPackages } from "../packages";
import type { ChangelogData } from "./types";

export interface TemplateEngine {
	generateContent(data: ChangelogData): string;
	parseVersions(content: string): ChangelogData;
	sortVersions(versionA: string, versionB: string): number;
}
export type TemplateEngineData = ChangelogData;

const repoUrl = EntityPackages.getRepoUrl();

export class ChangelogTemplate implements TemplateEngine {
	readonly packageName: string;
	readonly prefix: string;

	constructor(packageName: string, prefix: string) {
		this.packageName = packageName;
		this.prefix = prefix;
	}

	generateContent(changelogData: TemplateEngineData): string {
		let changelog = this.generateChangelogHeader(this.packageName);

		const sortedVersions = Array.from(changelogData.keys()).sort((a, b) => this.sortVersions(b, a));
		for (const version of sortedVersions) {
			const commits = changelogData.get(version) || [];
			if (typeof commits === "string") {
				changelog += `\n${commits}`;
				continue;
			}

			const versionHeader = this.generateChangelogVersionHeader(version);
			changelog += versionHeader;
			changelog += commits.map((commit) => this.generateCommitSection(commit, repoUrl)).join("\n");
		}

		return changelog;
	}

	parseVersions(content: string): TemplateEngineData {
		const versions: TemplateEngineData = new Map();
		const lines = content.split("\n");
		const headerEnd = lines.findIndex((line, i) => i > 0 && line.startsWith("## "));

		if (headerEnd === -1) return versions;

		let currentVersion = "";
		let currentContent: string[] = [];

		for (let i = headerEnd; i < lines.length; i++) {
			const line = lines[i];
			const isVersionLine =
				line.match(/## \[Unreleased\]/) ||
				line.match(new RegExp(`^## ${this.prefix}?\\d+\\.\\d+\\.\\d+`));

			if (isVersionLine) {
				if (currentVersion) {
					versions.set(currentVersion, currentContent.join("\n"));
				}

				// Extract clean version number from the header line
				let cleanVersion = line;
				if (line.includes("[Unreleased]")) {
					cleanVersion = "[Unreleased]";
				} else {
					// Extract version from "## v1.2.3" format
					const versionMatch = line.match(/## (v?\d+\.\d+\.\d+)/);
					if (versionMatch) {
						cleanVersion = versionMatch[1].replace(this.prefix, "");
					}
				}

				currentVersion = cleanVersion;
				currentContent = [line];
			} else {
				currentContent.push(line);
			}
		}

		if (currentVersion) {
			versions.set(currentVersion, currentContent.join("\n"));
		}

		return versions;
	}

	sortVersions(versionA: string, versionB: string): number {
		const partsA = versionA.split(".").map(Number);
		const partsB = versionB.split(".").map(Number);

		while (partsA.length < 3) partsA.push(0);
		while (partsB.length < 3) partsB.push(0);

		if (partsA[0] !== partsB[0]) {
			return partsA[0] - partsB[0]; // Descending order (newest first)
		}

		if (partsA[1] !== partsB[1]) {
			return partsA[1] - partsB[1]; // Descending order
		}

		return partsA[2] - partsB[2]; // Descending order
	}

	protected generateChangelogHeader(_packageName: string): string {
		return "";
	}

	protected generateChangelogVersionHeader(_version: string): string {
		return "";
	}

	protected generateCommitSection(_commit: ParsedCommitData, _repoUrl: string): string {
		return "";
	}
}
