import { parseArgs } from "node:util";
import { type ReactNode, useCallback } from "react";
import { colorify } from "../shared/colorify";
import { applyPlainComposeArgv, getPlainComposeSpawnEnv } from "../shared/compose-plain-progress";
import { renderAndExit } from "../shared/render-and-exit";
import { StepProgressApp, type StepProgressStep } from "../shared/step-progress";
import { DEV_COMPOSE_FILE, PROD_COMPOSE_FILE, PROD_COMPOSE_PROJECT_NAME } from "./stack";

async function spawnDocker(
	args: readonly string[],
	env: NodeJS.ProcessEnv,
	verbose: boolean,
): Promise<number> {
	const argv = applyPlainComposeArgv(args);
	const spawnEnv = getPlainComposeSpawnEnv(env);
	const proc = verbose
		? Bun.spawn(argv, {
				stdio: ["inherit", "inherit", "inherit"],
				cwd: process.cwd(),
				env: spawnEnv,
			})
		: Bun.spawn(argv, {
				stdio: ["ignore", "pipe", "pipe"],
				cwd: process.cwd(),
				env: spawnEnv,
			});
	return await proc.exited;
}

function getRmSteps(force: boolean): readonly StepProgressStep[] {
	const verbose = force;
	const devPrefix = ["docker", "compose", "-f", DEV_COMPOSE_FILE, "--profile", "all"];
	const prodEnv = { ...process.env, COMPOSE_PROJECT_NAME: PROD_COMPOSE_PROJECT_NAME };
	const prodPrefix = ["docker", "compose", "-f", PROD_COMPOSE_FILE];

	const devDown = () =>
		spawnDocker([...devPrefix, "down", "--volumes", "--remove-orphans"], process.env, verbose);
	const devRm = () => spawnDocker([...devPrefix, "rm", "-f", "--volumes"], process.env, verbose);
	const prodDown = () =>
		spawnDocker([...prodPrefix, "down", "--volumes", "--remove-orphans"], prodEnv, verbose);
	const prodRm = () => spawnDocker([...prodPrefix, "rm", "-f", "--volumes"], prodEnv, verbose);
	const rootDown = () =>
		spawnDocker(
			["docker", "compose", "-f", "docker-compose.yml", "down", "--volumes", "--remove-orphans"],
			process.env,
			verbose,
		);
	const rootRm = () =>
		spawnDocker(
			["docker", "compose", "-f", "docker-compose.yml", "rm", "-f", "--volumes"],
			process.env,
			verbose,
		);

	return [
		{ label: "Stopping dev compose stack", run: devDown },
		{ label: "Stopping production compose stack", run: prodDown },
		{ label: "Stopping root compose stack", run: rootDown },
		{ label: "Removing dev compose containers", run: devRm },
		{ label: "Removing production compose containers", run: prodRm },
		{ label: "Removing root compose containers", run: rootRm },
	];
}

async function runRmSteps(force: boolean): Promise<void> {
	for (const step of getRmSteps(force)) await step.run();
}

function RmApp({ force }: { readonly force: boolean }): ReactNode {
	const resolveSteps = useCallback(() => getRmSteps(force), [force]);
	return (
		<StepProgressApp
			completedHeading="Compose stack cleanup completed"
			resolveSteps={resolveSteps}
		/>
	);
}

export async function runRm(rest: readonly string[]): Promise<void> {
	const { values } = parseArgs({
		args: [...rest],
		options: {
			force: { type: "boolean", short: "f", default: false },
			quiet: { type: "boolean", default: false },
		},
		strict: true,
	});

	const force = values.force === true;
	const quiet = values.quiet === true;

	if (quiet) {
		await runRmSteps(force);
	} else {
		await renderAndExit(<RmApp force={force} />);
	}

	console.log(colorify.cyan("\nTo start fresh:"));
	console.log(colorify.cyan("  - bun run local setup"));
	console.log(colorify.cyan("  - bun run container setup"));
}
