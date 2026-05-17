import { parseArgs } from "node:util";
import { $ } from "bun";

import { EntityPackage, EntityPackageTags, EntityTag } from "intershell";
import { type ReactNode, useCallback } from "react";

import { colorify } from "../shared/colorify";
import { renderAndExit } from "../shared/render-and-exit";
import { StepProgressApp, type StepProgressStep } from "../shared/step-progress";

export interface VersionApplyCliValues {
	readonly packageName: string;
	readonly message?: string;
	readonly noPush: boolean;
	readonly dryRun: boolean;
	readonly quiet: boolean;
}

export function parseVersionApplyCli(rest: readonly string[]): VersionApplyCliValues {
	const { values } = parseArgs({
		args: [...rest],
		options: {
			package: { type: "string", short: "p" },
			message: { type: "string", short: "m" },
			"no-push": { type: "boolean", short: "n", default: false },
			"dry-run": { type: "boolean", short: "d", default: false },
			quiet: { type: "boolean", short: "q", default: false },
		},
		strict: true,
	});

	return {
		packageName: values.package ?? "root",
		message: values.message,
		noPush: values["no-push"] === true,
		dryRun: values["dry-run"] === true,
		quiet: values.quiet === true,
	};
}

interface ApplyMutableState {
	readonly cli: VersionApplyCliValues;
	abortRest: boolean;
}

function createApplyState(cli: VersionApplyCliValues): ApplyMutableState {
	return { cli, abortRest: false };
}

function getVersionApplySteps(state: ApplyMutableState): readonly StepProgressStep[] {
	return [
		{
			label: "Inspecting package",
			run: async () => {
				console.log(`📦 Processing package: ${colorify.blue(state.cli.packageName)}`);

				const packageInstance = new EntityPackage(state.cli.packageName);
				const tagSeriesName = packageInstance.getTagSeriesName();

				if (!tagSeriesName) {
					throw new Error(
						`Tag series name not found for ${state.cli.packageName}, this package should not be versioned (private package). Only versioned packages can be processed.`,
					);
				}
			},
		},
		{
			label: "Staging changes",
			run: async () => {
				if (state.abortRest) return;

				await $`git add .`;
				const statusResult = await $`git status --porcelain`.nothrow();
				const hasChanges = statusResult.text().trim() !== "";

				if (!hasChanges) {
					console.log(colorify.yellow("⚠️ No changes to commit"));
					state.abortRest = true;
				}
			},
		},
		{
			label: "Committing",
			run: async () => {
				if (state.abortRest) return;

				const commitMessage = await Bun.file(".git/COMMIT_EDITMSG").text();

				await $`git commit -m "${commitMessage}"`;

				const commitHash = await $`git rev-parse --short HEAD`.text();
				console.log(colorify.green("✅ Successfully committed version changes"));
				console.log(`🏷️ Commit hash: ${commitHash.trim()}`);
			},
		},
		{
			label: "Tagging release",
			run: async () => {
				if (state.abortRest) return;

				const packageInstance = new EntityPackage(state.cli.packageName);
				const version = packageInstance.readVersion();
				if (!version) {
					throw new Error(`Version not found for ${state.cli.packageName}`);
				}
				const packageTags = new EntityPackageTags(packageInstance);

				const tagExists = await packageTags.packageTagExists(version);
				if (tagExists) {
					const prefix = await packageTags.getTagPrefix();
					const tagName = `${prefix}${version}`;
					console.log(`⏭️ Tag already exists: ${tagName}`);
					return;
				}

				try {
					const tagName = await packageTags.createPackageTag(version);
					const tagMessage =
						state.cli.message ?? `Release ${state.cli.packageName} version ${version}`;
					await EntityTag.createTag(tagName, tagMessage);
					console.log(`🏷️ Created tag: ${tagName}`);
				} catch (error) {
					throw new Error(
						`Failed to create tag for ${state.cli.packageName}: ${error instanceof Error ? error.message : String(error)}`,
					);
				}
			},
		},
		{
			label: "Pushing to remote",
			run: async () => {
				if (state.abortRest) return;

				if (state.cli.noPush) {
					console.log(colorify.yellow("Skipping push (--no-push)"));
					return;
				}

				try {
					await $`git push --follow-tags`;
					console.log("📤 Pushed commit changes to remote");
				} catch (error) {
					throw new Error(
						`Failed to push commit changes to remote: ${error instanceof Error ? error.message : String(error)}`,
					);
				}
			},
		},
	];
}

function VersionApplyInkApp({ state }: { readonly state: ApplyMutableState }): ReactNode {
	const resolveSteps = useCallback(() => getVersionApplySteps(state), [state]);
	return <StepProgressApp completedHeading="Version apply completed" resolveSteps={resolveSteps} />;
}

export async function runVersionApply(rest: readonly string[]): Promise<void> {
	const cli = parseVersionApplyCli(rest);
	const state = createApplyState(cli);

	if (cli.dryRun) {
		console.log(
			colorify.yellow("Dry run: would git add, commit from .git/COMMIT_EDITMSG, create tag, push"),
		);
		return;
	}

	const steps = getVersionApplySteps(state);

	if (cli.quiet) {
		for (const step of steps) await step.run();
		return;
	}

	await renderAndExit(<VersionApplyInkApp state={state} />);
}
