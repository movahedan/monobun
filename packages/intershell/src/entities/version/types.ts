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
