import { parseArgs } from "node:util";
import { type ReactNode, useCallback } from "react";
import { colorify } from "../colorify";
import { renderAndExit } from "../render-and-exit";
import { StepProgressApp, type StepProgressStep } from "../step-progress";
import { spawnContainerIndex } from "./stack";

export interface SetupOptions {
	readonly skipHealthCheck: boolean;
	readonly quiet: boolean;
}

function getSetupSteps(options: SetupOptions): readonly StepProgressStep[] {
	const steps: StepProgressStep[] = [
		{
			label: "Starting Docker services",
			run: async () => {
				const code = await spawnContainerIndex(["up", "--build"]);
				if (code !== 0) throw new Error(`container up exited with code ${code}`);
			},
		},
	];
	if (!options.skipHealthCheck) {
		steps.push({
			label: "Running health checks",
			run: async () => {
				const code = await spawnContainerIndex(["check", "--keep-alive", "--quiet"]);
				if (code !== 0) throw new Error(`container check exited with code ${code}`);
			},
		});
	}
	return steps;
}

async function runSetupSteps(options: SetupOptions): Promise<void> {
	for (const step of getSetupSteps(options)) await step.run();
}

function SetupApp({ options }: { readonly options: SetupOptions }): ReactNode {
	const resolveSteps = useCallback(() => getSetupSteps(options), [options]);
	return (
		<StepProgressApp completedHeading="Compose stack setup completed" resolveSteps={resolveSteps} />
	);
}

async function printServiceHints(): Promise<void> {
	console.log(colorify.yellow("Run bun run container cleanup to stop services when done"));
	console.log(colorify.cyan("\nUseful commands:"));
	console.log(colorify.cyan(" - bun run container check"));
	console.log(colorify.cyan(" - bun run container logs"));
	console.log(colorify.cyan(" - bun run container cleanup"));
}

export async function runSetup(rest: readonly string[]): Promise<void> {
	const { values } = parseArgs({
		args: [...rest],
		options: {
			"skip-health-check": { type: "boolean", short: "h", default: false },
			quiet: { type: "boolean", default: false },
		},
		strict: true,
	});

	const options: SetupOptions = {
		skipHealthCheck: values["skip-health-check"] === true,
		quiet: values.quiet === true,
	};

	if (options.quiet) {
		await runSetupSteps(options);
	} else {
		await renderAndExit(<SetupApp options={options} />);
	}

	await printServiceHints();
}
