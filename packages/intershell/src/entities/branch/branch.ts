import { $ } from "bun";
import type { BranchConfig, ParsedBranch } from "./types";

export class EntityBranch {
	private config: BranchConfig;

	constructor(config: BranchConfig) {
		this.config = config;
	}

	static parseByName(branchName: string): ParsedBranch {
		const [prefix, ...name] = branchName.split("/");
		return {
			prefix,
			name: name.join("/"),
			fullName: branchName,
		};
	}

	async getCurrentBranch(): Promise<string> {
		const result = await $`git branch --show-current`;
		return result.stdout.toString().trim();
	}

	validate(input: string | ParsedBranch): true | string {
		const branch = typeof input === "string" ? EntityBranch.parseByName(input) : input;

		return this.mainValidator(branch);
	}

	private mainValidator(branch: ParsedBranch): true | string {
		if (!branch.fullName) return "branch name is empty";
		if (this.config.name.minLength && branch.fullName.length < this.config.name.minLength)
			return `branch name should be at least ${this.config.name.minLength} characters long`;
		if (this.config.name.maxLength && branch.fullName.length > this.config.name.maxLength)
			return `branch name should be max ${this.config.name.maxLength} characters, received: ${branch.fullName.length}`;
		if (
			this.config.name.allowedCharacters &&
			!this.config.name.allowedCharacters.test(branch.fullName)
		)
			return "branch name can only contain letters, numbers, hyphens, underscores, and forward slashes";
		if (this.config.name.noConsecutiveSeparators && /[-_/]{2,}/.test(branch.fullName))
			return "branch name should not have consecutive separators";
		if (this.config.name.noLeadingTrailingSeparators && /(^[-_/]|[-_/]$)/.test(branch.fullName))
			return "branch name should not start or end with separators";

		if (branch.fullName === this.config.defaultBranch) {
			return true;
		}

		if (this.config.prefixes.length === 0) {
			return true;
		}

		const prefix = branch.prefix ?? "";
		const name = branch.name;
		if (!prefix) {
			return `branch name should have a prefix. valid prefixes: ${this.config.prefixes.join(", ")}`;
		}

		if (!name) {
			return "branch name should have a name";
		}

		return true;
	}
}
