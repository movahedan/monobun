import { parseArgs } from "node:util";

import { type ReactNode, useCallback } from "react";

import { colorify } from "../shared/colorify";
import { applyPlainComposeArgv } from "../shared/compose-plain-progress";
import { renderAndExit } from "../shared/render-and-exit";
import { StepProgressApp, type StepProgressStep } from "../shared/step-progress";
import { spawnWithVisibleOutput } from "../shared/subprocess-visible";
import { getComposePrefix, getComposeSpawnEnv } from "./stack";

export interface CleanupOptions {
	readonly quiet: boolean;
}

async function spawnCompose(args: readonly string[]): Promise<void> {
	await spawnWithVisibleOutput({
		argv: applyPlainComposeArgv(args),
		cwd: process.cwd(),
		env: getComposeSpawnEnv(),
	});
}

function getCleanupSteps(): readonly StepProgressStep[] {
	const prefix = [...getComposePrefix()];
	return [
		{
			label: "Stopping compose services",
			run: async () => {
				await spawnCompose([...prefix, "down", "--volumes"]);
			},
		},
		{
			label: "Removing compose containers",
			run: async () => {
				await spawnCompose([...prefix, "rm", "-f", "--volumes"]);
			},
		},
	];
}

async function runCleanupSteps(): Promise<void> {
	for (const step of getCleanupSteps()) await step.run();
}

function CleanupApp(): ReactNode {
	const resolveSteps = useCallback(() => getCleanupSteps(), []);
	return (
		<StepProgressApp
			completedHeading="Compose stack cleanup completed"
			resolveSteps={resolveSteps}
		/>
	);
}

export async function runCleanup(rest: readonly string[]): Promise<void> {
	const { values } = parseArgs({
		args: [...rest],
		options: {
			quiet: { type: "boolean", default: false },
		},
		strict: true,
	});

	const options: CleanupOptions = {
		quiet: values.quiet === true,
	};

	if (options.quiet) {
		await runCleanupSteps();
	} else {
		await renderAndExit(<CleanupApp />);
	}

	if (!options.quiet) {
		console.log(colorify.cyan("\nTo start the stack again:"));
		console.log(colorify.cyan("  - bun run container setup"));
		console.log(colorify.cyan("  - bun run container rm  (host only — full compose teardown)"));
	}
}
