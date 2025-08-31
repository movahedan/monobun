/** biome-ignore-all lint/complexity/noStaticOnlyClass: it's a simple util class */
import { $ } from "bun";
import { getEntitiesConfig } from "../config/config";
import type { IConfig } from "../config/types";
import { EntityPr } from "./pr";
import type { CommitMessageData, ParsedCommitData } from "./types";

const conventionalCommitRegex = /^([a-z]+)(\([a-zA-Z0-9@\-,\s/]+\))?(!)?:\s(.+)/;
const depScopes = ["deps", "dependencies", "dep", "renovate", "dependabot"];
const getIsMerge = (message: string) =>
	message.startsWith("Merge pull request") || message.startsWith("Merge branch");
const getIsDependency = (message: string) =>
	message.includes("renovate[bot]") || message.includes("dependabot[bot]");

export class EntityCommitClass {
	private readonly config: IConfig;

	constructor(config: IConfig) {
		this.config = config;
	}

	static parseByMessage(message: string): CommitMessageData {
		const lines = message.split("\n");
		const subject = lines[0];
		const bodyLines = lines.length > 1 ? lines.slice(1).filter((line) => line.trim()) : [];

		const match = subject.match(conventionalCommitRegex);
		if (!match) {
			const type = getIsMerge(message) ? "merge" : getIsDependency(message) ? "deps" : "other";

			return {
				subject,
				type,
				description: subject,
				scopes: [],
				bodyLines: bodyLines,
				isBreaking: false,
				isMerge: type === "merge",
				isDependency: type === "deps",
			};
		}

		const [, type, scope, breaking, description] = match || [];
		const scopes = scope ? scope.replace(/[()]/g, "").split(",") : [];
		const isBreaking = breaking === "!";
		const isMerge = getIsMerge(message);
		const isDependency = scopes.some((s) => depScopes.includes(s)) || getIsDependency(message);

		return { subject, type, scopes, description, bodyLines, isMerge, isBreaking, isDependency };
	}

	validateCommitMessage(message: string): string[] {
		if (!message.trim()) return ["commit message cannot be empty"];
		const match = EntityCommitClass.parseByMessage(message);

		const errors: string[] = [];
		const commitConfig = this.config.commit;

		if (match.isMerge) {
			// Validate merge commit
			if (commitConfig.conventional.isMerge?.validator) {
				const validation = commitConfig.conventional.isMerge.validator({ message: match });
				if (typeof validation === "string") errors.push(`isMerge: ${validation}`);
			}
		} else {
			// Validate conventional commit
			// Type validation
			if (commitConfig.conventional.type?.list && commitConfig.conventional.type.list.length > 0) {
				const validTypes = commitConfig.conventional.type.list.map((t) => t.type);
				if (!validTypes.includes(match.type)) {
					errors.push(`type: invalid type "${match.type}". valid types: ${validTypes.join(", ")}`);
				}
			}

			// Scope validation
			if (
				commitConfig.conventional.scopes?.list &&
				commitConfig.conventional.scopes.list.length > 0
			) {
				if (match.scopes && match.scopes.length > 0) {
					const scopesList = commitConfig.conventional.scopes.list;
					const invalidScopes = match.scopes.filter((scope) => !scopesList.includes(scope));
					if (invalidScopes.length > 0) {
						errors.push(
							`scopes: invalid scope(s) "${invalidScopes.join(", ")}". valid scopes: ${scopesList.join(", ")}`,
						);
					}
				}
			}

			// Description validation
			if (commitConfig.conventional.description) {
				const desc = match.description;
				const minLength = commitConfig.conventional.description.minLength;
				if (minLength !== undefined && desc.length < minLength) {
					errors.push(`description: should be at least ${minLength} characters long`);
				}

				const maxLength = commitConfig.conventional.description.maxLength;
				if (maxLength !== undefined && desc.length > maxLength) {
					errors.push(`description: should be max ${maxLength} chars, received: ${desc.length}`);
				}

				if (commitConfig.conventional.description.shouldNotEndWithPeriod && desc.endsWith(".")) {
					errors.push("description: should not end with a period");
				}

				if (
					commitConfig.conventional.description.shouldNotStartWithType &&
					commitConfig.conventional.type?.list
				) {
					const firstWord = desc.split(" ")[0].toLowerCase();
					const validTypes = commitConfig.conventional.type.list.map((t) => t.type);
					if (validTypes.includes(firstWord)) {
						errors.push(
							`description: should not start with a type "${firstWord}". You're either duplicating the type or should use a different type.`,
						);
					}
				}
			}

			// Body lines validation
			if (commitConfig.conventional.bodyLines && match.bodyLines.length > 0) {
				const minLength = commitConfig.conventional.bodyLines.minLength;
				if (minLength !== undefined && match.bodyLines.every((line) => line.length < minLength)) {
					errors.push(`bodyLines: should be ${minLength} characters or more`);
				}

				const maxLength = commitConfig.conventional.bodyLines.maxLength;
				if (maxLength !== undefined && match.bodyLines.every((line) => line.length > maxLength)) {
					errors.push(`bodyLines: should be ${maxLength} characters or less`);
				}
			}

			// Breaking change validation
			if (match.isBreaking && commitConfig.conventional.type?.list) {
				const breakingAllowedTypes = commitConfig.conventional.type.list
					.filter((t) => t.breakingAllowed)
					.map((t) => t.type);
				if (!breakingAllowedTypes.includes(match.type)) {
					errors.push(
						`isBreaking: breaking change is not allowed for this type, allowed types: ${breakingAllowedTypes.join(", ")}`,
					);
				}
				if (match.description.length < 10) {
					errors.push(
						"isBreaking: breaking change description should be at least 10 characters long",
					);
				}
			}
		}

		return errors;
	}

	formatCommitMessage(message: CommitMessageData): string {
		let formatted = `${message.type}`;
		if (message.scopes && message.scopes.length > 0) formatted += `(${message.scopes.join(", ")})`;
		formatted += `: ${message.description}`;
		if (message.bodyLines && message.bodyLines.length > 0)
			formatted += `\n\n${message.bodyLines.join("\n")}`;
		if (message.isBreaking) formatted += `\n\nBREAKING CHANGE: ${message.description}`;

		return formatted;
	}

	async parseByHash(hash: string): Promise<ParsedCommitData> {
		try {
			const commitResult = await globalThis.Bun
				.$`git show --format="%H%n%an%n%ad%n%s%n%B" --no-patch ${hash}`
				.quiet()
				.nothrow();
			if (commitResult.exitCode !== 0) throw new Error(`Could not find commit ${hash}`);

			const lines = commitResult.text().trim().split("\n");
			const [commitHash, author, date, subject, ...bodyLines] = lines;
			if (!subject) throw new Error(`No subject found for commit ${hash}`);

			const message = EntityCommitClass.parseByMessage(`${subject}\n${bodyLines.join("\n")}`);
			return {
				message,
				info: {
					hash: commitHash,
					author: author || undefined,
					date: date || undefined,
				},
				pr: message.isMerge
					? await new EntityPr(this.config).getPRInfo(this.parseByHash, hash, message)
					: undefined,
			};
		} catch (error) {
			throw new Error(
				`Failed to parse commit ${hash}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	async getStagedFiles(): Promise<{ stagedFiles: string[] }> {
		const status = await $`git status --porcelain`.text();
		const lines = status.split("\n").filter(Boolean);

		return {
			stagedFiles: lines
				.filter((line) => line.startsWith("A ") || line.startsWith("M "))
				.map((line) => line.substring(3)),
		};
	}

	async validateStagedFiles(files: string[]): Promise<string[]> {
		const errors: string[] = [];
		const stagedConfig = this.config.commit.staged || [];

		// Process each file individually for proper ignore logic and error reporting
		for (const file of files) {
			for (const pattern of stagedConfig) {
				const fileNameMatches = pattern.filePattern.some((p) => p.test(file));
				if (!fileNameMatches) continue;

				const stagedDiff = await $`git diff --cached -- ${file}`.text();
				const contentMatches = pattern.contentPattern?.some((p) => p.test(stagedDiff)) ?? true;

				// Check if this is a new file and should be ignored
				const isNewFile =
					stagedDiff.includes("new file mode") || stagedDiff.includes("--- /dev/null");
				const shouldIgnore = pattern.ignore?.mode === "create" && isNewFile;
				const isDisabled = pattern.disabled;

				if (contentMatches && !shouldIgnore && !isDisabled) {
					errors.push(`${file}: ${pattern.description}`);
				}
			}
		}

		return errors;
	}
}

export const EntityCommit = new EntityCommitClass(getEntitiesConfig().getConfig());
