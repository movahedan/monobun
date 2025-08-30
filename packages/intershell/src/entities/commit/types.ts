import type { ParsedBranch } from "../branch/types";
import type { PRCategory } from "../config/types";

export type CommitMessageData =
	| {
			subject: string;
			type: "other";
			scopes?: string[];
			description: string;
			bodyLines: string[];
			isBreaking: boolean;
			isMerge: boolean;
			isDependency: boolean;
	  }
	| {
			subject: string;
			type: string;
			scopes?: string[];
			description: string;
			bodyLines: string[];
			isBreaking: boolean;
			isMerge: boolean;
			isDependency: boolean;
	  };

export interface PRStats {
	readonly commitCount: number;
	readonly fileCount?: number;
	readonly linesAdded?: number;
	readonly linesDeleted?: number;
}

export type PRInfo = {
	prNumber: string;
	prCategory: PRCategory;
	prStats: PRStats;
	prCommits: ParsedCommitData[];
	prBranchName: ParsedBranch;
};

export const prCategories: Record<PRCategory, { emoji: string; label: string }> = {
	features: {
		emoji: "🚀",
		label: "Feature Releases",
	},
	infrastructure: {
		emoji: "🛠️",
		label: "Infrastructure & Tooling",
	},
	bugfixes: {
		emoji: "🐛",
		label: "Bug Fixes & Improvements",
	},
	refactoring: {
		emoji: "🔄",
		label: "Code Quality & Refactoring",
	},
	documentation: {
		emoji: "📚",
		label: "Documentation",
	},
	dependencies: {
		emoji: "📦",
		label: "Dependency Updates",
	},
	other: {
		emoji: "🔄",
		label: "Other Changes",
	},
};

export interface ParsedCommitData {
	message: CommitMessageData;
	info?: {
		hash: string;
		author?: string;
		date?: string;
	};
	pr?: PRInfo;
}
