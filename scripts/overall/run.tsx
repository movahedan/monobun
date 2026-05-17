import { $ } from "bun";
import { type ReactNode, useCallback } from "react";

import { renderAndExit } from "../shared/render-and-exit";
import { StepProgressApp, type StepProgressStep } from "../shared/step-progress";

export interface OverallOptions {
	readonly quiet: boolean;
}

interface ShellResult {
	readonly exitCode: number | null;
	readonly stdout: Buffer;
	readonly stderr: Buffer;
}

function assertShellOk(phase: string, result: ShellResult): void {
	if (result.exitCode === 0) {
		return;
	}
	const stderr = result.stderr.toString("utf8").trimEnd();
	const stdout = result.stdout.toString("utf8").trimEnd();
	const chunks: string[] = [];
	if (stderr.length > 0) {
		chunks.push(stderr);
	}
	if (stdout.length > 0) {
		chunks.push(stdout);
	}
	const detail = chunks.length > 0 ? `\n${chunks.join("\n\n")}` : "";
	throw new Error(`${phase} failed (exit ${result.exitCode ?? "unknown"})${detail}`);
}

function getOverallSteps(): readonly StepProgressStep[] {
	return [
		{
			label: "Lint (write)",
			run: async () => {
				assertShellOk("Lint", await $`bun run lint -- --fix --unsafe`.nothrow().quiet());
			},
		},
		{
			label: "Typecheck (affected)",
			run: async () => {
				assertShellOk(
					"Typecheck",
					await $`bun run turbo run typecheck --affected`.nothrow().quiet(),
				);
			},
		},
		{
			label: "Test (affected)",
			run: async () => {
				assertShellOk("Test", await $`bun run test --affected`.nothrow().quiet());
			},
		},
		{
			label: "Build (affected)",
			run: async () => {
				assertShellOk("Build", await $`bun run build --affected`.nothrow().quiet());
			},
		},
	];
}

function OverallApp(): ReactNode {
	const resolveSteps = useCallback(() => getOverallSteps(), []);
	return (
		<StepProgressApp
			completedHeading="Overall quality gate completed"
			resolveSteps={resolveSteps}
		/>
	);
}

export async function runOverall(options: OverallOptions): Promise<void> {
	if (options.quiet) {
		for (const step of getOverallSteps()) await step.run();
		return;
	}
	await renderAndExit(<OverallApp />);
}
