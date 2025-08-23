export interface BranchConfig {
	readonly defaultBranch: string;
	readonly protectedBranches: readonly string[];
	readonly prefixes: readonly string[];
	readonly name: {
		readonly minLength: number;
		readonly maxLength: number;
		readonly allowedCharacters: RegExp;
		readonly noConsecutiveSeparators: boolean;
		readonly noLeadingTrailingSeparators: boolean;
	};
}

export interface ParsedBranch {
	readonly name: string;
	readonly prefix?: string;
	readonly fullName: string;
}
