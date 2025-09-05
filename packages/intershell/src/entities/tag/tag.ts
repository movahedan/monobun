import { getEntitiesConfig } from "../config/config";
import { entitiesShell } from "../entities.shell";
import type { ParsedTag, TagValidationResult } from "./types";

export * from "./types";

export const EntityTag = {
	parseByName(tagName: string): ParsedTag {
		const format = EntityTag.detectFormat(tagName);
		const prefix = EntityTag.detectPrefix(tagName);
		const name = tagName;

		return {
			name,
			prefix,
			format,
		};
	},

	validate(tag: string | ParsedTag): TagValidationResult {
		const parsedTag = typeof tag === "string" ? EntityTag.parseByName(tag) : tag;
		const config = getEntitiesConfig().getConfig();
		const errors = [];

		// Name validation
		if (config.tag.name.enabled) {
			const name = parsedTag.name;
			const length = name.length;

			// Check length
			if (length < config.tag.name.minLength) {
				errors.push(`tag name should be at least ${config.tag.name.minLength} characters long`);
			}
			if (length > config.tag.name.maxLength) {
				errors.push(
					`tag name should be max ${config.tag.name.maxLength} characters, received: ${length}`,
				);
			}

			// Check allowed characters
			if (!config.tag.name.allowedCharacters.test(name)) {
				errors.push(
					`tag name contains invalid characters. allowed: ${config.tag.name.allowedCharacters.source}`,
				);
			}

			// Check no spaces
			if (config.tag.name.noSpaces && name.includes(" ")) {
				errors.push("tag name should not contain spaces");
			}

			// Check no special chars
			if (config.tag.name.noSpecialChars) {
				const specialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
				if (specialChars.test(name)) {
					errors.push("tag name should not contain special characters");
				}
			}
		}

		return { isValid: errors.length === 0, errors };
	},

	// Pure Git tag operations (no prefix knowledge)
	async listTags(prefix: string): Promise<string[]> {
		const result = await entitiesShell.gitTagList(prefix);
		return result.text().trim().split("\n").filter(Boolean);
	},

	async getLatestTag(prefix: string): Promise<string | null> {
		const result = await entitiesShell.gitTagLatest(prefix);

		if (result.exitCode !== 0) {
			throw new Error(`Could not get latest tag for pattern ${prefix}`);
		}

		const tag = result.text().trim();
		return tag || null;
	},

	async getTagSha(tagName: string): Promise<string> {
		const result = await entitiesShell.gitRevParse(tagName);
		if (result.exitCode === 0) {
			return result.text().trim();
		}
		throw new Error(`Tag ${tagName} not found`);
	},

	async tagExists(tagName: string): Promise<boolean> {
		const result = await entitiesShell.gitTagExists(tagName);
		return result.exitCode === 0 && result.text().trim() === tagName;
	},

	async createTag(
		tagName: string,
		message: string,
		options: { force?: boolean; push?: boolean } = {},
	): Promise<void> {
		const { force = false, push = false } = options;

		if (!force && (await EntityTag.tagExists(tagName))) {
			throw new Error(`Tag ${tagName} already exists, use --force to override`);
		}

		// Validate tag name structure
		const validation = EntityTag.validate(tagName);
		if (!validation.isValid) {
			throw new Error(`Tag ${tagName} is invalid: ${validation.errors.join(", ")}`);
		}

		try {
			await entitiesShell.gitTag(tagName, message, { force: force ? "-f" : "" });
		} catch (error) {
			throw new Error(
				`Failed to create tag ${tagName}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}

		if (push) {
			try {
				await entitiesShell.gitPushTag(tagName);
			} catch (error) {
				throw new Error(
					`Failed to push tag ${tagName}: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		}
	},

	async deleteTag(tagName: string, deleteRemote = false): Promise<void> {
		if (!(await EntityTag.tagExists(tagName))) {
			throw new Error(`Tag ${tagName} does not exist`);
		}

		try {
			await entitiesShell.gitDeleteTag(tagName);
		} catch (error) {
			throw new Error(
				`Failed to delete tag ${tagName}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}

		if (deleteRemote) {
			try {
				await entitiesShell.gitPushTag(`:refs/tags/${tagName}`);
			} catch (error) {
				throw new Error(
					`Failed to delete remote tag ${tagName}: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		}
	},

	async getTagInfo(tagName: string): Promise<{ date: string; message: string }> {
		const result = await entitiesShell.gitTagInfo(tagName);

		if (result.exitCode === 0) {
			const lines = result.text?.().trim?.().split("\n").filter(Boolean) ?? [];
			if (lines.length >= 2) {
				return {
					date: lines[0],
					message: lines[1],
				};
			}
		}
		throw new Error(`Could not get info for tag ${tagName}`);
	},

	async getBaseCommitSha(from?: string): Promise<string> {
		if (from) {
			// Check if it's a tag, commit hash, or branch
			const result = await entitiesShell.gitRevParse(from);
			if (result.exitCode !== 0) {
				throw new Error(`Invalid reference: ${from}. Not found as tag, branch, or commit.`);
			}

			return result.text().trim();
		}

		// Return first commit if no reference provided
		const result = await entitiesShell.gitFirstCommit();
		if (result.exitCode !== 0) {
			throw new Error("Could not find first commit");
		}

		return result.text().trim();
	},

	// Utility methods
	detectFormat(tagName: string): "semver" | "calver" | "custom" | undefined {
		if (!tagName) return undefined; // empty tag
		if (/^v?\d+\.\d+\.\d+/.test(tagName)) return "semver"; // v1.0.0
		if (/^\d{4}\.\d{2}\.\d{2}/.test(tagName)) return "calver"; // 2025.08.18
		return "custom"; // custom-format
	},

	detectPrefix(tagName: string): string | undefined {
		if (!tagName) return undefined; // empty tag
		const firstPart = tagName.split(".")[0].replace(/[0-9]/g, ""); // v1.0.0 -> v
		if (/^[a-zA-Z-]+/.test(firstPart)) return firstPart; // v1.0.0 -> v, intershell-v1.0.0 -> intershell-v
		return undefined; // 1.0.0 -> undefined
	},

	getVersionFromTag(tagName: string): string {
		const prefix = EntityTag.detectPrefix(tagName) || "";
		return tagName.replace(prefix, "");
	},
};
