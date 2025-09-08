export type PRCategory =
	| "features"
	| "bugfixes"
	| "dependencies"
	| "infrastructure"
	| "documentation"
	| "refactoring"
	| "other";

type Validator = (commit: unknown) => true | string;

export interface CommitConfig {
	conventional: {
		type?: {
			list?: CommitTypeDefinition[];
			validator?: Validator;
		};
		scopes?: {
			list?: string[];
			validator?: Validator;
		};
		description?: {
			minLength?: number;
			maxLength?: number;
			shouldNotEndWithPeriod?: boolean;
			shouldNotStartWithType?: boolean;
			validator?: Validator;
		};
		bodyLines?: {
			minLength?: number;
			maxLength?: number;
			validator?: Validator;
		};
		isBreaking?: {
			validator?: Validator;
		};
		isMerge?: {
			validator?: Validator;
		};
		isDependency?: {
			validator?: Validator;
		};
	};
	staged?: StagedConfig;
}

export interface CommitTypeDefinition {
	readonly type: string;
	readonly label: string;
	readonly description: string;
	readonly category: PRCategory;
	readonly emoji: string;
	readonly badgeColor: string;
	readonly breakingAllowed: boolean;
}

export type StagedConfig = {
	filePattern: RegExp[];
	contentPattern?: RegExp[];
	description: string;
	disabled?: boolean;
	ignore?: {
		mode: "create" | "update";
	};
}[];

interface BranchConfig {
	readonly defaultBranch: string;
	readonly prefixes: string[];
	readonly name: {
		readonly minLength: number;
		readonly maxLength: number;
		readonly allowedCharacters: RegExp;
		readonly noConsecutiveSeparators: boolean;
		readonly noLeadingTrailingSeparators: boolean;
	};
}

interface PackageValidationConfig {
	readonly selectiveVersioning: {
		readonly enabled: boolean;
		readonly description: string;
	};
	readonly semanticVersioning: {
		readonly enabled: boolean;
		readonly description: string;
	};
	readonly description: {
		readonly enabled: boolean;
		readonly description: string;
	};
}

interface TagValidationConfig {
	readonly name: {
		readonly enabled: boolean;
		readonly description: string;
		readonly minLength: number;
		readonly maxLength: number;
		readonly allowedCharacters: RegExp;
		readonly noSpaces: boolean;
		readonly noSpecialChars: boolean;
		readonly validator?: Validator;
	};
}

export interface IConfig {
	readonly commit: CommitConfig;
	readonly branch: BranchConfig;
	readonly package: PackageValidationConfig;
	readonly tag: TagValidationConfig;
}

type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type CustomConfigJson = DeepPartial<IConfig>;
