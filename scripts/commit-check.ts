#!/usr/bin/env bun

import { colorify, createScript, type ScriptConfig } from "@repo/intershell/core";
import { EntityBranch, EntityCommit } from "@repo/intershell/entities";

const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

const scriptConfig = {
	name: "Commit Check",
	description:
		"Comprehensive commit validation with step-based checking. Supports message strings, files, branch validation, and staged file checks.",
	usage: "bun run commit-check [options]",
	examples: [
		"bun run commit-check",
		"bun run commit-check --message 'feat: add new feature'",
		"bun run commit-check --message-file .git/COMMIT_EDITMSG",
		"bun run commit-check --branch",
		"bun run commit-check --staged",
		"bun run commit-check --message 'fix: resolve bug' --branch --staged",
	],
	options: [
		{
			short: "-m",
			long: "--message",
			description: "Validate specific commit message string",
			required: false,
			type: "string",
			validator: createScript.validators.nonEmpty,
		},
		{
			short: "-f",
			long: "--message-file",
			description: "Read and validate message from file",
			required: false,
			type: "string",
			validator: createScript.validators.fileExists,
		},
		{
			short: "-b",
			long: "--branch",
			description: "Validate current branch name",
			required: false,
			defaultValue: false,
			type: "boolean",
			validator: createScript.validators.boolean,
		},
		{
			short: "-s",
			long: "--staged",
			description: "Validate staged files for policy violations",
			required: false,
			defaultValue: false,
			type: "boolean",
			validator: createScript.validators.boolean,
		},
	],
} as const satisfies ScriptConfig;

export const commitCheck = createScript(scriptConfig, async (args, xConsole) => {
	const entityCommit = new EntityCommit();
	const branchInstance = new EntityBranch();

	if (args["message-file"] || args.message) {
		xConsole.log(colorify.blue("🔍 Validating commit message from file..."));
		const commitMessage = args["message-file"]
			? (await Bun.file(args["message-file"]).text())
					.trimEnd()
					.split("\n")
					.filter((line) => line.trim() && !line.trim().startsWith("#"))
					.join("\n")
			: args.message;
		if (!commitMessage) {
			xConsole.error(colorify.red("❌ No commit message found"));
			throw new Error("No commit message found");
		}

		const validation = entityCommit.validateCommitMessage(commitMessage.trimEnd());
		if (validation.length > 0) {
			xConsole.error(colorify.red("❌ Commit message validation failed:"));
			for (const error of validation) {
				xConsole.error(colorify.red(`  • ${error}`));
			}
			throw new Error("Commit message validation failed");
		}

		xConsole.log(colorify.green("✅ Commit message validation passed"));
	}

	if (args.branch) {
		try {
			xConsole.log(colorify.blue("🔍 Running branch name validation..."));
			const branchName =
				process.env.GITHUB_HEAD_REF ||
				process.env.GITHUB_REF?.replace("refs/heads/", "") ||
				(await branchInstance.getCurrentBranch()) ||
				"";

			const branchValidation = branchInstance.validate(branchName);
			if (typeof branchValidation === "string") {
				if (isCI) {
					xConsole.log(colorify.yellow("⚠️  Skipping branch name check in CI environment"));
					xConsole.log(colorify.gray(`Branch name detected: ${branchName}`));
				} else {
					throw new Error(branchValidation);
				}
			}

			xConsole.log(colorify.green("✅ Branch name validation passed"));
		} catch (error) {
			xConsole.error(colorify.red("❌ Branch name validation failed:"));
			for (const e of error instanceof Error ? error.message.split("\n") : [String(error)]) {
				xConsole.error(colorify.red(`  • ${e}`));
			}
			throw new Error("Branch name validation failed");
		}
	}

	if (args.staged) {
		try {
			xConsole.log(colorify.blue("🔍 Running staged files validation..."));
			const { stagedFiles } = await entityCommit.getStagedFiles();
			if (!stagedFiles.length) {
				xConsole.log(colorify.green("✅ No staged changes"));
			} else {
				const errors = await new EntityCommit().validateStagedFiles(stagedFiles);
				if (errors.length === 0) {
					xConsole.log(colorify.green("✅ No policy violations found in staged files"));
				} else {
					throw new Error(errors.join("\n"));
				}
			}
		} catch (error) {
			xConsole.error(colorify.red("❌ Staged files validation failed:"));
			for (const e of error instanceof Error ? error.message.split("\n") : [String(error)]) {
				xConsole.error(colorify.red(`  • ${e.trim()}`));
			}
			throw new Error("Staged files validation failed");
		}
	}
});

if (import.meta.main) {
	commitCheck.run();
}
