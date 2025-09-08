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

export interface TsConfigPaths {
	readonly [key: string]: string[];
}

export interface TsConfig {
	readonly extends?: string;
	readonly compilerOptions?: {
		readonly baseUrl?: string;
		readonly paths?: TsConfigPaths;
		readonly rootDir?: string;
		readonly outDir?: string;
		readonly references?: Array<{ readonly path: string }>;
	};
	readonly include?: string[];
	readonly exclude?: string[];
}

export interface RepositoryInfo {
	type: string;
	url: string;
}

export interface BugsInfo {
	url: string;
	email?: string;
}
