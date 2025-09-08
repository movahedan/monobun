import type { ParsedCommitData } from "../commit";

export type ChangelogData = Map<string, string | ParsedCommitData[]>;

export type VersionBumpType = "major" | "minor" | "patch" | "none" | "synced";

export interface VersionData {
	readonly currentVersion: string;
	readonly bumpType: VersionBumpType;
	readonly shouldBump: boolean;
	readonly targetVersion: string;
	readonly reason: string;
}

export interface ChangelogSnapshot {
	readonly versionData: VersionData;
	readonly changelogData: ChangelogData;
}

export interface GitTagVersion {
	readonly tag: string;
	readonly version: string;
	readonly commitHash: string;
	readonly date: Date;
}

export interface PackageVersionHistory {
	readonly packageName: string;
	readonly versions: GitTagVersion[];
}
