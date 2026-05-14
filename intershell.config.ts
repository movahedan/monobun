import { defaultConfig } from "intershell";

export default {
	...defaultConfig,
	branch: {
		...defaultConfig.branch,
		prefixes: [...defaultConfig.branch.prefixes, "codex", "cursor", "agent"] as const,
	},
} as const;
