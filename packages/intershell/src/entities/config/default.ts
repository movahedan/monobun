import type { IConfig } from "./types";

export * from "./types";

export const defaultConfig = {
	commit: {
		conventional: [],
		staged: [],
	},
	branch: {
		defaultBranch: "main",
		protectedBranches: ["main"],
		name: {
			minLength: 1,
			maxLength: 100,
			allowedCharacters: /^[a-zA-Z0-9\-_/]+$/,
			noConsecutiveSeparators: true,
			noLeadingTrailingSeparators: true,
		},
		prefixes: [
			"feature",
			"fix",
			"hotfix",
			"release",
			"docs",
			"refactor",
			"ci",
			"chore",
			"wip",
			"renovate",
		],
	},
	tag: [],
} as const satisfies IConfig;
