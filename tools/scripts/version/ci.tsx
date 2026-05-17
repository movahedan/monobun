import { parseArgs } from "node:util";
import { $ } from "bun";

import { EntityTag } from "intershell";
import { type ReactNode, useCallback } from "react";

import { colorify } from "../shared/colorify";
import { renderAndExit } from "../shared/render-and-exit";
import { StepProgressApp, type StepProgressStep } from "../shared/step-progress";
import { runVersionApply } from "./apply";
import { runVersionPrepare } from "./prepare";

export interface VersionCiCliValues {
	readonly noPush: boolean;
	readonly dryRun: boolean;
	readonly quiet: boolean;
}

export function parseVersionCiCli(rest: readonly string[]): VersionCiCliValues {
	const { values } = parseArgs({
		args: [...rest],
		options: {
			"no-push": { type: "boolean", short: "n", default: false },
			"dry-run": { type: "boolean", short: "d", default: false },
			quiet: { type: "boolean", short: "q", default: false },
		},
		strict: true,
	});

	return {
		noPush: values["no-push"] === true,
		dryRun: values["dry-run"] === true,
		quiet: values.quiet === true,
	};
}

interface CiMutableState {
	readonly cli: VersionCiCliValues;
}

function createCiState(cli: VersionCiCliValues): CiMutableState {
	return { cli };
}

async function configureGitAuth(cli: VersionCiCliValues): Promise<void> {
	console.log("🔍 Configuring Git authentication...");

	if (cli.dryRun) {
		console.log("-> 🔍 Dry run, skipping git config");
		return;
	}

	if (!process.env.GITHUB_ACTIONS) {
		console.log("-> 🔍 Running locally, skip git config");
		return;
	}

	if (!process.env.GITHUB_REPOSITORY) {
		console.log("-> ⚠️ GITHUB_REPOSITORY not found");
		return;
	}

	if (!process.env.GITHUB_TOKEN) {
		console.log("-> ⚠️ GITHUB_TOKEN not found");
		return;
	}

	console.log("-> 🔐 Configuring Git authentication...");
	await $`git config user.name "github-actions[bot]"`;
	await $`git config user.email "github-actions[bot]@users.noreply.github.com"`;
	await $`git remote set-url origin https://x-access-token:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`;

	const actualRemoteUrl = await $`git remote get-url origin`.text();
	const maskedUrl = actualRemoteUrl.replace(/https:\/\/x-access-token:[^@]+@/, "***@");
	console.log(`-> 🔗 Git authentication configured, remote URL: ${maskedUrl}`);
}

function getVersionCiSteps(state: CiMutableState): readonly StepProgressStep[] {
	return [
		{
			label: "Configuring Git",
			run: async () => {
				console.log("🚀 Starting CI version workflow...");
				await configureGitAuth(state.cli);
			},
		},
		{
			label: "Preparing and applying version",
			run: async () => {
				const fromSha = await EntityTag.getBaseCommitSha();
				console.log(`📝 Using base commit: ${colorify.blue(fromSha)}`);

				if (state.cli.dryRun) {
					console.log("\n🔧 Preparing versions...");
					console.log(`📝 Would run: bun run release prepare --from ${fromSha} --quiet`);
					console.log("\n🚀 Applying version changes...");
					console.log(
						`📝 Would run: bun run release apply --quiet${state.cli.noPush ? " --no-push" : ""}`,
					);
					console.log(colorify.green("\n✅ CI version workflow completed successfully!"));
					return;
				}

				console.log("\n🔧 Preparing versions...");
				await runVersionPrepare(["--from", fromSha, "--quiet"]);

				console.log("\n🚀 Applying version changes...");
				const applyArgs = ["--quiet"];
				if (state.cli.noPush) applyArgs.push("--no-push");
				await runVersionApply(applyArgs);

				console.log(colorify.green("\n✅ CI version workflow completed successfully!"));
			},
		},
	];
}

function VersionCiInkApp({ state }: { readonly state: CiMutableState }): ReactNode {
	const resolveSteps = useCallback(() => getVersionCiSteps(state), [state]);
	return (
		<StepProgressApp completedHeading="CI version workflow completed" resolveSteps={resolveSteps} />
	);
}

export async function runVersionCi(rest: readonly string[]): Promise<void> {
	const cli = parseVersionCiCli(rest);
	const state = createCiState(cli);
	const steps = getVersionCiSteps(state);

	if (cli.quiet) {
		for (const step of steps) await step.run();
		return;
	}

	await renderAndExit(<VersionCiInkApp state={state} />);
}
