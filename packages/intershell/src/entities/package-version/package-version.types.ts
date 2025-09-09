export interface VersionHistory {
	readonly packageName: string;
	readonly versions: TagVersion[];
	readonly latestVersion: string;
}

export interface TagVersion {
	readonly tag: string;
	readonly version: string;
	readonly commit: string;
	readonly date: Date;
	readonly message: string;
}

export type EntityPackageVersionBumpType = "major" | "minor" | "patch" | "none" | "synced";

export interface EntityPackageVersionData {
	readonly currentVersion: string;
	readonly bumpType: EntityPackageVersionBumpType;
	readonly shouldBump: boolean;
	readonly targetVersion: string;
	readonly reason: string;
}

export interface EntityGitTagVersion {
	readonly tag: string;
	readonly version: string;
	readonly commitHash: string;
	readonly date: Date;
}

export interface EntityPackageVersionHistory {
	readonly packageName: string;
	readonly versions: EntityGitTagVersion[];
}
