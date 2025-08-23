import type { BranchConfig, BranchRule } from "./types";

const defaultConfig: BranchConfig = {
	defaultBranch: "main",
	protectedBranches: ["main"],
	prefix: {
		list: [
			"master",
			"develop",
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
		] as const,
		validator: (branch) => {
			const prefix = branch.prefix;
			if (!prefix) return "branch name should have a prefix";
			return true;
		},
	},
	name: {
		minLength: 1,
		maxLength: 100,
		allowedCharacters: /^[a-zA-Z0-9\-_/]+$/,
		noConsecutiveSeparators: true,
		noLeadingTrailingSeparators: true,
	},
};

export class BranchRules {
	private config: BranchConfig;
	private rules: BranchRule[] = [];

	constructor(config: BranchConfig = defaultConfig) {
		this.config = this.mergeConfig(config);
		this.rules = this.createRules();
	}

	getConfig(): BranchConfig {
		return this.config;
	}

	getRules(): BranchRule[] {
		return this.rules;
	}

	private mergeConfig(config: Partial<BranchConfig>): BranchConfig {
		return {
			...defaultConfig,
			...config,
			prefix: {
				...defaultConfig.prefix,
				...config.prefix,
			},
			name: {
				...defaultConfig.name,
				...config.name,
			},
		};
	}

	private createRules(): BranchRule[] {
		const config = this.config;
		return [
			{
				section: "prefix",
				question: `🌿 What is the branch prefix?\n=> [${config.prefix.list.join(", ")}]`,
				validator: (branch): true | string => {
					const prefix = branch.prefix;
					if (!prefix) return "branch name should have a prefix";
					if (config.prefix.list.length === 0) return true;
					if (config.protectedBranches.includes(prefix)) {
						console.warn(`⚠️ Branch prefix "${prefix}" is protected`);
						return true;
					}
					const exists = prefix ? config.prefix.list.includes(prefix) : true;

					return (
						config.prefix.validator?.(branch) ||
						exists ||
						`invalid prefix: "${prefix}". valid prefix:\n  => ${config.prefix.list.join(", ")}`
					);
				},
				list: config.prefix.list,
			},
			{
				section: "name",
				question: "📝 Branch name validation",
				validator: (branch): true | string => {
					const length = branch.name.length;
					if (config.protectedBranches.includes(branch.prefix ?? "")) return true;

					if (length < config.name.minLength)
						return `branch name should be at least ${config.name.minLength} characters long`;
					if (length > config.name.maxLength)
						return `branch name should be max ${config.name.maxLength} characters, received: ${length}`;
					if (!config.name.allowedCharacters.test(branch.name))
						return "branch name can only contain letters, numbers, hyphens, underscores, and forward slashes";
					if (config.name.noConsecutiveSeparators && /[-_/]{2,}/.test(branch.name))
						return "branch name should not have consecutive separators";
					if (config.name.noLeadingTrailingSeparators && /(^[-_/]|[-_/]$)/.test(branch.name))
						return "branch name should not start or end with separators";

					return true;
				},
			},
		];
	}
}
