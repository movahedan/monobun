import { Box, Static, Text, useAnimation, useApp } from "ink";
import { type ReactNode, useEffect, useState } from "react";

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"] as const;

function StepSpinner(): ReactNode {
	const { frame } = useAnimation({ interval: 80 });
	return <Text color="cyan">{SPINNER_FRAMES[frame % SPINNER_FRAMES.length]}</Text>;
}

export interface StepProgressStep {
	readonly label: string;
	readonly run: () => Promise<unknown>;
}

interface CompletedStepLine {
	readonly id: number;
	readonly label: string;
}

export function StepProgressApp({
	completedHeading,
	resolveSteps,
}: {
	readonly completedHeading: string;
	readonly resolveSteps: () => readonly StepProgressStep[];
}): ReactNode {
	const { exit, waitUntilRenderFlush } = useApp();
	const [completedSteps, setCompletedSteps] = useState<readonly CompletedStepLine[]>([]);
	const [activeLabel, setActiveLabel] = useState("Starting…");
	const [finished, setFinished] = useState(false);

	useEffect(() => {
		let cancelled = false;
		let nextId = 0;
		const steps = resolveSteps();

		void (async () => {
			try {
				for (const step of steps) {
					if (cancelled) return;
					setActiveLabel(step.label);
					await waitUntilRenderFlush();
					await step.run();
					const id = nextId++;
					setCompletedSteps((previous) => [...previous, { id, label: step.label }]);
					await waitUntilRenderFlush();
				}
				if (cancelled) return;
				setFinished(true);
				await waitUntilRenderFlush();
				exit();
			} catch (error: unknown) {
				exit(error instanceof Error ? error : new Error(String(error)));
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [exit, resolveSteps, waitUntilRenderFlush]);

	return (
		<Box flexDirection="column">
			<Static items={[...completedSteps]}>
				{(step) => (
					<Box key={step.id}>
						<Text color="green">✓ {step.label}</Text>
					</Box>
				)}
			</Static>
			<Box flexDirection="row" marginTop={completedSteps.length > 0 ? 1 : 0} gap={1}>
				{finished ? (
					<>
						<Text color="green">✓</Text>
						<Text bold color="green">
							{completedHeading}
						</Text>
					</>
				) : (
					<>
						<StepSpinner />
						<Text dimColor>{activeLabel}</Text>
					</>
				)}
			</Box>
		</Box>
	);
}
