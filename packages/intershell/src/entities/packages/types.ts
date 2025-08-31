export interface PackageJson {
	intershell?: {
		config: string;
	};
	name: string;
	version?: string; // Make version optional since private packages shouldn't have versions
	description?: string;
	main?: string;
	scripts?: Record<string, string>;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	author?: string;
	license?: string;
	repository?: string | RepositoryInfo;
	bugs?: string | BugsInfo;
	homepage?: string;
	keywords?: string[];
	private?: boolean;
	workspaces?: string[];
	[key: string]: unknown;
}

export interface RepositoryInfo {
	type: string;
	url: string;
}

export interface BugsInfo {
	url: string;
	email?: string;
}
