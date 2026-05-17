import { parseArgs } from "node:util";
import { $ } from "bun";

import { type ReactNode, useCallback } from "react";

import { renderAndExit } from "../shared/render-and-exit";
import { StepProgressApp, type StepProgressStep } from "../shared/step-progress";

const directories = [
	"dist",
	"build",
	"dist",
	"dist-storybook",
	".turbo",
	".next",
	".output",
	"coverage",
	".nyc_output",
	".cache",
	".parcel-cache",
	".vite",
	".swc",
	".act",
	".biomecache",
	"bin",
] as const;

const files = [
	".act-event.json",
	"*.tsbuildinfo",
	".log",
	".tmp",
	".temp",
	".DS_Store",
	"Thumbs.db",
] as const;

function getCleanupSteps(): readonly StepProgressStep[] {
	return [
		{
			label: "Removing build and cache directories",
			run: async () => {
				for (const directory of directories)
					await $`rm -rf ${directory} **/${directory} **/${directory}/**`.quiet().nothrow();
			},
		},
		{
			label: "Removing logs and temp files",
			run: async () => {
				for (const file of files) await $`rm -rf ${file} **/${file}`.quiet().nothrow();
			},
		},
		{
			label: "Removing node_modules",
			run: () => $`rm -rf node_modules **/node_modules`.quiet().nothrow(),
		},
	];
}

export async function runLocalCleanupSteps(): Promise<void> {
	for (const step of getCleanupSteps()) await step.run();
}

function CleanupApp(): ReactNode {
	const resolveSteps = useCallback(() => getCleanupSteps(), []);
	return <StepProgressApp completedHeading="Local cleanup completed" resolveSteps={resolveSteps} />;
}

export async function runLocalCleanup(rest: readonly string[]): Promise<void> {
	const { values } = parseArgs({
		args: [...rest],
		options: {
			quiet: { type: "boolean", default: false },
		},
		strict: true,
	});

	if (values.quiet === true) {
		await runLocalCleanupSteps();
		return;
	}

	await renderAndExit(<CleanupApp />);
}
