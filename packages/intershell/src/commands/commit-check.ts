import { Command, Flags } from "@oclif/core";
import { colorify } from "@repo/intershell/core";
import { EntityBranch, EntityCommit } from "@repo/intershell/entities";

const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

export default class CommitCheck extends Command {
	static description =
		"Comprehensive commit validation with step-based checking. Supports message strings, files, branch validation, and staged file checks.";

	static examples = [
		"intershell commit-check",
		"intershell commit-check --message 'feat: add new feature'",
		"intershell commit-check --message-file .git/COMMIT_EDITMSG",
		"intershell commit-check --branch",
		"intershell commit-check --staged",
		"intershell commit-check --message 'fix: resolve bug' --branch --staged",
	];

	static flags = {
		message: Flags.string({
			char: "m",
			description: "Validate specific commit message string",
		}),
		"message-file": Flags.string({
			char: "f",
			description: "Read and validate message from file",
		}),
		branch: Flags.boolean({
			char: "b",
			description: "Validate current branch name",
			default: false,
		}),
		staged: Flags.boolean({
			char: "s",
			description: "Validate staged files for policy violations",
			default: false,
		}),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(CommitCheck);
		const entityCommit = new EntityCommit();
		const branchInstance = new EntityBranch();

		if (flags["message-file"] || flags.message) {
			this.log(colorify.blue("🔍 Validating commit message from file..."));
			const commitMessage = flags["message-file"]
				? (await Bun.file(flags["message-file"]).text())
						.trimEnd()
						.split("\n")
						.filter((line) => line.trim() && !line.trim().startsWith("#"))
						.join("\n")
				: flags.message;
			if (!commitMessage) {
				this.error(colorify.red("❌ No commit message found"));
			}

			const validation = entityCommit.validateCommitMessage(commitMessage.trimEnd());
			if (validation.length > 0) {
				this.error(
					colorify.red("❌ Commit message validation failed:\n") +
						validation.map((error) => colorify.red(`  • ${error}`)).join("\n"),
				);
			}

			this.log(colorify.green("✅ Commit message validation passed"));
		}

		if (flags.branch) {
			try {
				this.log(colorify.blue("🔍 Running branch name validation..."));
				const branchName =
					process.env.GITHUB_HEAD_REF ||
					process.env.GITHUB_REF?.replace("refs/heads/", "") ||
					(await branchInstance.getCurrentBranch()) ||
					"";

				const branchValidation = branchInstance.validate(branchName);
				if (typeof branchValidation === "string") {
					if (isCI) {
						this.log(colorify.yellow("⚠️  Skipping branch name check in CI environment"));
						this.log(colorify.gray(`Branch name detected: ${branchName}`));
					} else {
						throw new Error(branchValidation);
					}
				}

				this.log(colorify.green("✅ Branch name validation passed"));
			} catch (error) {
				this.error(
					colorify.red("❌ Branch name validation failed:\n") +
						(error instanceof Error ? error.message.split("\n") : [String(error)])
							.map((e) => colorify.red(`  • ${e}`))
							.join("\n"),
				);
			}
		}

		if (flags.staged) {
			try {
				this.log(colorify.blue("🔍 Running staged files validation..."));
				const { stagedFiles } = await entityCommit.getStagedFiles();
				if (!stagedFiles.length) {
					this.log(colorify.green("✅ No staged changes"));
				} else {
					const errors = await new EntityCommit().validateStagedFiles(stagedFiles);
					if (errors.length === 0) {
						this.log(colorify.green("✅ No policy violations found in staged files"));
					} else {
						throw new Error(errors.join("\n"));
					}
				}
			} catch (error) {
				this.error(
					colorify.red("❌ Staged files validation failed:\n") +
						(error instanceof Error ? error.message.split("\n") : [String(error)])
							.map((e) => colorify.red(`  • ${e.trim()}`))
							.join("\n"),
				);
			}
		}
	}
}
