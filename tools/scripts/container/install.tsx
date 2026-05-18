import { parseArgs } from "node:util";

import { type ReactNode, useCallback } from "react";

import { applyPlainComposeArgv } from "../shared/compose-plain-progress";
import { renderAndExit } from "../shared/render-and-exit";
import { StepProgressApp, type StepProgressStep } from "../shared/step-progress";
import { DEV_COMPOSE_FILE, getComposeSpawnEnv, getContainerStack } from "./stack";

const INSTALL_SERVICE = "apps";

function getInstallComposeArgv(bunInstallArgs: readonly string[]): string[] {
	return applyPlainComposeArgv([
		"docker",
		"compose",
		"-f",
		DEV_COMPOSE_FILE,
		"--profile",
		"apps",
		"run",
		"--rm",
		"--no-deps",
		INSTALL_SERVICE,
		"bun",
		...bunInstallArgs,
	]);
}

async function spawnBunInstall(bunInstallArgs: readonly string[]): Promise<void> {
	if (getContainerStack() === "prod") {
		throw new Error("container install is only supported for the dev stack (omit --prod)");
	}

	const proc = Bun.spawn(getInstallComposeArgv(bunInstallArgs), {
		stdio: ["inherit", "inherit", "inherit"],
		cwd: process.cwd(),
		env: getComposeSpawnEnv(),
	});
	const code = await proc.exited;
	if (code !== 0) throw new Error(`bun install in container exited with code ${code}`);
}

function getInstallSteps(bunInstallArgs: readonly string[]): readonly StepProgressStep[] {
	return [
		{
			label: "Installing dependencies in container (bun install)",
			run: () => spawnBunInstall(bunInstallArgs),
		},
	];
}

export async function runInstallSteps(bunInstallArgs: readonly string[]): Promise<void> {
	for (const step of getInstallSteps(bunInstallArgs)) await step.run();
}

function InstallApp({ bunInstallArgs }: { readonly bunInstallArgs: readonly string[] }): ReactNode {
	const resolveSteps = useCallback(() => getInstallSteps(bunInstallArgs), [bunInstallArgs]);
	return (
		<StepProgressApp
			completedHeading="Container dependencies installed"
			resolveSteps={resolveSteps}
		/>
	);
}

export async function runInstall(rest: readonly string[]): Promise<void> {
	const { values, positionals } = parseArgs({
		args: [...rest],
		options: {
			quiet: { type: "boolean", default: false },
			"with-scripts": { type: "boolean", default: false },
		},
		allowPositionals: true,
		strict: true,
	});

	const bunInstallArgs = [
		"install",
		...(values["with-scripts"] === true ? [] : ["--ignore-scripts"]),
		...positionals,
	];

	if (values.quiet === true) {
		await runInstallSteps(bunInstallArgs);
		return;
	}

	await renderAndExit(<InstallApp bunInstallArgs={bunInstallArgs} />);
}
