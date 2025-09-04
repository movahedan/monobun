import { entitiesConfig } from "../config/config";
import { entitiesShell } from "../entities.shell";
import type { ParsedBranch } from "./types";

export class EntityBranch {
	parseByName(branchName: string): ParsedBranch {
		const [prefix, ...name] = branchName.split("/");
		return {
			prefix,
			name: prefix ? name.join("/") : branchName,
			fullName: branchName,
		};
	}

	async getCurrentBranch(): Promise<string> {
		const result = await entitiesShell.gitBranchShowCurrent();
		return result.text().trim();
	}

	validate(input: string | ParsedBranch): true | string {
		const branch = typeof input === "string" ? this.parseByName(input) : input;

		return this.mainValidator(branch);
	}

	private mainValidator(branch: ParsedBranch): true | string {
		const config = entitiesConfig.getConfig().branch;

		if (!branch.fullName) return "branch name is empty";
		if (config.name.minLength && branch.fullName.length < config.name.minLength)
			return `branch name should be at least ${config.name.minLength} characters long`;
		if (config.name.maxLength && branch.fullName.length > config.name.maxLength)
			return `branch name should be max ${config.name.maxLength} characters, received: ${branch.fullName.length}`;
		if (config.name.allowedCharacters && !config.name.allowedCharacters.test(branch.fullName))
			return "branch name can only contain letters, numbers, hyphens, underscores, and forward slashes";
		if (config.name.noConsecutiveSeparators && /[-_/]{2,}/.test(branch.fullName))
			return "branch name should not have consecutive separators";
		if (config.name.noLeadingTrailingSeparators && /(^[-_/]|[-_/]$)/.test(branch.fullName))
			return "branch name should not start or end with separators";

		if (branch.fullName === config.defaultBranch) {
			return true;
		}

		if (config.prefixes.length === 0) {
			return true;
		}

		const prefix = branch.prefix ?? "";
		const name = branch.name;
		if (!prefix) {
			return `branch name should have a prefix. valid prefixes: ${config.prefixes.join(", ")}`;
		}

		if (!name) {
			return "branch name should have a name";
		}

		return true;
	}
}
