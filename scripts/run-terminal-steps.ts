import { colorify } from "./colorify";
import type { StepProgressStep } from "./step-progress";

export async function runStepsInTerminal(
	steps: readonly StepProgressStep[],
	options?: { readonly heading?: string },
): Promise<void> {
	if (options?.heading !== undefined) {
		console.log(colorify.cyan(`\n${options.heading}\n`));
	}

	for (const step of steps) {
		console.log(`${colorify.cyan("→")} ${step.label}`);
		await step.run();
		console.log(`${colorify.green("✓")} ${step.label}\n`);
	}
}
