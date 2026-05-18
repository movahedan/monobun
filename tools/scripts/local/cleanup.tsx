import { rm } from "node:fs/promises";
import { parseArgs } from "node:util";
import { Glob } from "bun";

import { type ReactNode, useCallback } from "react";

import { renderAndExit } from "../shared/render-and-exit";
import { StepProgressApp, type StepProgressStep } from "../shared/step-progress";

const SKIP_PATH_SEGMENTS = new Set(["node_modules", ".git"]);

const directories = [
	"dist",
	"build",
	"dist-storybook",
	".turbo",
	".next",
	".astro",
	"out",
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
	".last-check.log",
	"*.log",
	".tmp",
	".temp",
	".DS_Store",
	"Thumbs.db",
] as const;

function shouldSkipPath(path: string): boolean {
	return path.split("/").some((segment) => SKIP_PATH_SEGMENTS.has(segment));
}

async function removeByGlob(pattern: string, options: { onlyFiles: boolean }): Promise<void> {
	const glob = new Glob(pattern);
	for await (const match of glob.scan({
		cwd: process.cwd(),
		onlyFiles: options.onlyFiles,
		dot: true,
	})) {
		if (shouldSkipPath(match)) continue;
		await rm(match, { force: true, recursive: !options.onlyFiles });
	}
}

async function removeDirectories(): Promise<void> {
	for (const directory of directories) await removeByGlob(`**/${directory}`, { onlyFiles: false });
}

async function removeFiles(): Promise<void> {
	for (const file of files) await removeByGlob(`**/${file}`, { onlyFiles: true });
}

async function removeNodeModules(): Promise<void> {
	await removeByGlob("**/node_modules", { onlyFiles: false });
}

function getCleanupSteps(): readonly StepProgressStep[] {
	return [
		{
			label: "Removing build and cache directories",
			run: removeDirectories,
		},
		{
			label: "Removing logs and temp files",
			run: removeFiles,
		},
		{
			label: "Removing node_modules",
			run: removeNodeModules,
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
