import { parseArgs } from "node:util";
import { type ReactNode, useCallback } from "react";
import { colorify } from "../colorify";
import { renderAndExit } from "../render-and-exit";
import { StepProgressApp, type StepProgressStep } from "../step-progress";
import { getComposePrefix, getComposeSpawnEnv } from "./stack";

export interface CleanupOptions {
	readonly verbose: boolean;
	readonly quiet: boolean;
}

async function spawnCompose(args: readonly string[], verbose: boolean): Promise<number> {
	const proc = verbose
		? Bun.spawn([...args], {
				stdio: ["inherit", "inherit", "inherit"],
				cwd: process.cwd(),
				env: getComposeSpawnEnv(),
			})
		: Bun.spawn([...args], {
				stdio: ["ignore", "pipe", "pipe"],
				cwd: process.cwd(),
				env: getComposeSpawnEnv(),
			});
	return await proc.exited;
}

function getCleanupSteps(verbose: boolean): readonly StepProgressStep[] {
	const prefix = [...getComposePrefix()];
	return [
		{
			label: "Stopping compose services",
			run: async () => {
				const code = await spawnCompose([...prefix, "down", "--volumes"], verbose);
				if (code !== 0) throw new Error(`compose down exited with code ${code}`);
			},
		},
		{
			label: "Removing compose containers",
			run: async () => {
				const code = await spawnCompose([...prefix, "rm", "-f", "--volumes"], verbose);
				if (code !== 0) throw new Error(`compose rm exited with code ${code}`);
			},
		},
	];
}

async function runCleanupSteps(options: CleanupOptions): Promise<void> {
	for (const step of getCleanupSteps(options.verbose)) await step.run();
}

function CleanupApp({ options }: { readonly options: CleanupOptions }): ReactNode {
	const resolveSteps = useCallback(() => getCleanupSteps(options.verbose), [options.verbose]);
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
			verbose: { type: "boolean", short: "v", default: false },
			quiet: { type: "boolean", default: false },
		},
		strict: true,
	});

	const options: CleanupOptions = {
		verbose: values.verbose === true,
		quiet: values.quiet === true,
	};

	if (options.quiet) {
		await runCleanupSteps(options);
	} else {
		await renderAndExit(<CleanupApp options={options} />);
	}

	console.log(colorify.cyan("\nTo start the stack again:"));
	console.log(colorify.cyan("  - bun run container setup"));
	console.log(colorify.cyan("  - bun run container rm  (host only — full compose teardown)"));
}
