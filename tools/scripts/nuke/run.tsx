import { type ReactNode, useCallback } from "react";

import { runCheck } from "../container/check";
import { runCleanup } from "../container/cleanup";
import { setContainerStack } from "../container/stack";
import { runLocalCleanupSteps } from "../local/cleanup";
import { runLocalSetupSteps } from "../local/setup";
import { colorify } from "../shared/colorify";
import { renderAndExit } from "../shared/render-and-exit";
import { runStepsInTerminal } from "../shared/run-terminal-steps";
import { StepProgressApp, type StepProgressStep } from "../shared/step-progress";

export interface NukeOptions {
	readonly quiet: boolean;
	readonly skipTests: boolean;
}

function getNukePrepareSteps(options: NukeOptions): readonly StepProgressStep[] {
	return [
		{
			label: "Cleaning local artifacts",
			run: () => runLocalCleanupSteps(),
		},
		{
			label: "Stopping dev compose stack",
			run: async () => {
				setContainerStack("dev");
				await runCleanup(["--quiet"]);
			},
		},
		{
			label: "Stopping prod compose stack",
			run: async () => {
				setContainerStack("prod");
				await runCleanup(["--quiet"]);
			},
		},
		{
			label: "Bootstrapping local workspace",
			run: () => runLocalSetupSteps(options.skipTests),
		},
	];
}

function getNukeComposeSteps(): readonly StepProgressStep[] {
	return [
		{
			label: "Validating dev compose stack",
			run: async () => {
				setContainerStack("dev");
				await runCheck(["--quiet"]);
			},
		},
		{
			label: "Validating prod compose stack",
			run: async () => {
				setContainerStack("prod");
				await runCheck(["--quiet"]);
			},
		},
	];
}

function NukePrepareApp({ options }: { readonly options: NukeOptions }): ReactNode {
	const resolveSteps = useCallback(() => getNukePrepareSteps(options), [options]);
	return (
		<StepProgressApp completedHeading="Local workspace prepared" resolveSteps={resolveSteps} />
	);
}

export async function runNuke(options: NukeOptions): Promise<void> {
	const prepareSteps = getNukePrepareSteps(options);
	const composeSteps = getNukeComposeSteps();

	if (options.quiet) {
		for (const step of [...prepareSteps, ...composeSteps]) await step.run();
		return;
	}

	await renderAndExit(<NukePrepareApp options={options} />);
	await runStepsInTerminal(composeSteps, { heading: "Validating compose stacks" });
	console.log(colorify.green("✓ Nuke completed — workspace reset and verified\n"));
}
