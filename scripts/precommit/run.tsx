import { parseArgs } from "node:util";

import { EntityBranch, EntityCommit } from "intershell";
import { type ReactNode, useCallback } from "react";

import { colorify } from "../shared/colorify";
import { renderAndExit } from "../shared/render-and-exit";
import { StepProgressApp, type StepProgressStep } from "../shared/step-progress";
import { printCommitCheckHelpAndExit } from "./help";

const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

interface CommitCheckCliValues {
	readonly message?: string;
	readonly messageFile?: string;
	readonly branch: boolean;
	readonly staged: boolean;
	readonly quiet: boolean;
	readonly help: boolean;
}

function parseCommitCheckCli(rest: readonly string[]): CommitCheckCliValues {
	const { values } = parseArgs({
		args: [...rest],
		options: {
			message: { type: "string", short: "m" },
			"message-file": { type: "string", short: "f" },
			branch: { type: "boolean", short: "b", default: false },
			staged: { type: "boolean", short: "s", default: false },
			quiet: { type: "boolean", short: "q", default: false },
			help: { type: "boolean", short: "h", default: false },
		},
		strict: true,
	});

	return {
		message: values.message,
		messageFile: values["message-file"],
		branch: values.branch === true,
		staged: values.staged === true,
		quiet: values.quiet === true,
		help: values.help === true,
	};
}

interface CommitCheckState {
	readonly cli: CommitCheckCliValues;
}

function buildCommitCheckSteps(state: CommitCheckState): readonly StepProgressStep[] {
	const entityCommit = new EntityCommit();
	const branchInstance = new EntityBranch();
	const steps: StepProgressStep[] = [];

	if (state.cli.messageFile !== undefined || state.cli.message !== undefined) {
		steps.push({
			label: "Validating commit message",
			run: async () => {
				console.log(colorify.blue("🔍 Validating commit message from file..."));
				const commitMessage = state.cli.messageFile
					? (await Bun.file(state.cli.messageFile).text())
							.trimEnd()
							.split("\n")
							.filter((line) => line.trim() && !line.trim().startsWith("#"))
							.join("\n")
					: state.cli.message;
				if (!commitMessage) {
					throw new Error(colorify.red("❌ No commit message found"));
				}

				const validation = entityCommit.validateCommitMessage(commitMessage.trimEnd());
				if (validation.length > 0) {
					throw new Error(
						colorify.red("❌ Commit message validation failed:\n") +
							validation.map((error) => colorify.red(`  • ${error}`)).join("\n"),
					);
				}

				console.log(colorify.green("✅ Commit message validation passed"));
			},
		});
	}

	if (state.cli.branch) {
		steps.push({
			label: "Validating branch name",
			run: async () => {
				try {
					console.log(colorify.blue("🔍 Running branch name validation..."));
					const branchName =
						process.env.GITHUB_HEAD_REF ||
						process.env.GITHUB_REF?.replace("refs/heads/", "") ||
						(await branchInstance.getCurrentBranch()) ||
						"";

					const branchValidation = branchInstance.validate(branchName);
					if (typeof branchValidation === "string") {
						if (isCI) {
							console.log(colorify.yellow("⚠️  Skipping branch name check in CI environment"));
							console.log(colorify.gray(`Branch name detected: ${branchName}`));
						} else {
							throw new Error(branchValidation);
						}
					}

					console.log(colorify.green("✅ Branch name validation passed"));
				} catch (error) {
					throw new Error(
						colorify.red("❌ Branch name validation failed:\n") +
							(error instanceof Error ? error.message.split("\n") : [String(error)])
								.map((e) => colorify.red(`  • ${e}`))
								.join("\n"),
					);
				}
			},
		});
	}

	if (state.cli.staged) {
		steps.push({
			label: "Validating staged files",
			run: async () => {
				try {
					console.log(colorify.blue("🔍 Running staged files validation..."));
					const { stagedFiles } = await entityCommit.getStagedFiles();
					if (!stagedFiles.length) {
						console.log(colorify.green("✅ No staged changes"));
					} else {
						const errors = await new EntityCommit().validateStagedFiles(stagedFiles);
						if (errors.length === 0) {
							console.log(colorify.green("✅ No policy violations found in staged files"));
						} else {
							throw new Error(errors.join("\n"));
						}
					}
				} catch (error) {
					throw new Error(
						colorify.red("❌ Staged files validation failed:\n") +
							(error instanceof Error ? error.message.split("\n") : [String(error)])
								.map((e) => colorify.red(`  • ${e.trim()}`))
								.join("\n"),
					);
				}
			},
		});
	}

	return steps;
}

function CommitCheckInkApp({ state }: { readonly state: CommitCheckState }): ReactNode {
	const resolveSteps = useCallback(() => buildCommitCheckSteps(state), [state]);
	return <StepProgressApp completedHeading="Commit check completed" resolveSteps={resolveSteps} />;
}

export async function runCommitCheck(rest: readonly string[]): Promise<void> {
	const cli = parseCommitCheckCli(rest);

	if (cli.help) {
		await printCommitCheckHelpAndExit();
	}

	const state: CommitCheckState = { cli };
	const steps = buildCommitCheckSteps(state);

	if (steps.length === 0) {
		return;
	}

	if (cli.quiet) {
		for (const step of steps) await step.run();
		return;
	}

	await renderAndExit(<CommitCheckInkApp state={state} />);
}
