import { parseArgs } from "node:util";
import { $ } from "bun";

import { type ReactNode, useCallback } from "react";

import { renderAndExit } from "../shared/render-and-exit";
import { StepProgressApp, type StepProgressStep } from "../shared/step-progress";

function getSetupSteps(skipTests: boolean): readonly StepProgressStep[] {
	const steps: StepProgressStep[] = [
		{ label: "Installing dependencies", run: () => $`bun install`.quiet() },
		{ label: "Installing lefthook", run: () => $`lefthook install`.quiet() },
		{ label: "Running lint --write", run: () => $`bun run lint -- --write`.quiet() },
		{ label: "Running typecheck", run: () => $`bun run typecheck`.quiet() },
	];
	if (!skipTests) steps.push({ label: "Running tests", run: () => $`bun run test`.quiet() });
	steps.push({ label: "Building packages", run: () => $`bun run build`.quiet() });
	return steps;
}

export async function runLocalSetupSteps(skipTests: boolean): Promise<void> {
	for (const step of getSetupSteps(skipTests)) await step.run();
}

function SetupApp({ skipTests }: { readonly skipTests: boolean }): ReactNode {
	const resolveSteps = useCallback(() => getSetupSteps(skipTests), [skipTests]);
	return <StepProgressApp completedHeading="Local setup completed" resolveSteps={resolveSteps} />;
}

export async function runLocalSetup(rest: readonly string[]): Promise<void> {
	const { values } = parseArgs({
		args: [...rest],
		options: {
			"skip-tests": { type: "boolean", short: "t", default: false },
			quiet: { type: "boolean", default: false },
		},
		strict: true,
	});

	const skipTests = values["skip-tests"] === true;

	if (values.quiet === true) {
		await runLocalSetupSteps(skipTests);
		return;
	}

	await renderAndExit(<SetupApp skipTests={skipTests} />);
}
