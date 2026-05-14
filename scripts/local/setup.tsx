import { parseArgs } from "node:util";
import { $ } from "bun";
import { type ReactNode, useCallback } from "react";

import { renderAndExit } from "../render-and-exit";
import { StepProgressApp, type StepProgressStep } from "../step-progress";

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

function SetupApp({ skipTests }: { readonly skipTests: boolean }): ReactNode {
	const resolveSteps = useCallback(() => getSetupSteps(skipTests), [skipTests]);
	return <StepProgressApp completedHeading="Local setup completed" resolveSteps={resolveSteps} />;
}

export async function runLocalSetup(rest: readonly string[]): Promise<void> {
	const { values } = parseArgs({
		args: [...rest],
		options: {
			"skip-tests": { type: "boolean", short: "t", default: false },
		},
		strict: true,
	});

	await renderAndExit(<SetupApp skipTests={values["skip-tests"] === true} />);
}
