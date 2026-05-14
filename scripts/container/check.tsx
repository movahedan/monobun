import { setTimeout } from "node:timers/promises";
import { parseArgs } from "node:util";
import { EntityCompose, type ServiceHealth, type ServiceInfo } from "intershell";
import { type ReactNode, useCallback } from "react";
import { colorify } from "../colorify";
import { renderAndExit } from "../render-and-exit";
import { StepProgressApp, type StepProgressStep } from "../step-progress";
import { getComposeFilePath, spawnContainerIndex } from "./stack";

const HEALTH_ICONS: Record<ServiceHealth["status"], string> = {
	healthy: "✅",
	starting: "🔄",
	unhealthy: "❌",
	unknown: "❓",
};

const HEALTH_COLORS: Record<ServiceHealth["status"], (text: string) => string> = {
	healthy: colorify.green,
	starting: colorify.yellow,
	unhealthy: colorify.red,
	unknown: colorify.gray,
};

export interface CheckOptions {
	readonly keepAlive: boolean;
	readonly quiet: boolean;
}

interface CheckState {
	compose: EntityCompose | null;
}

async function monitorServiceHealth(
	compose: EntityCompose,
	options: { readonly verbose: boolean },
): Promise<void> {
	const services = await compose.getServices();
	if (options.verbose) {
		console.log(colorify.yellow("Waiting for services to become healthy..."));
	}

	const retryInterval = 5_000;
	const maxRetries = 6;
	let retryCount = 0;
	let allHealthy = false;
	let healthResult: ServiceHealth[] | null = null;

	while (retryCount < maxRetries && !allHealthy) {
		if (retryCount > 0) {
			if (options.verbose) {
				console.log(
					colorify.yellow(`Retry ${retryCount}/${maxRetries} — checking again in 5 seconds...`),
				);
			}
			await setTimeout(retryInterval);
		}

		healthResult = await compose.getServiceHealth();

		if (
			healthResult?.every((s) => s.status === "healthy") &&
			healthResult.length === services.length
		) {
			allHealthy = true;
		} else {
			retryCount++;
		}
	}

	console.log(colorify.blue("\nFinal service health"));
	console.log("-".repeat(50));
	if (!healthResult) {
		throw new Error("Failed to get health status from services");
	}

	for (const service of healthResult) {
		const icon = HEALTH_ICONS[service.status];
		const color = HEALTH_COLORS[service.status];
		const port = services.find((s: ServiceInfo) => s.name === service.name)?.ports[0]?.host;
		console.log(
			`${icon} ${color(service.name)}: ${service.status} ${port !== undefined ? `(${port})` : ""}`,
		);
	}

	if (healthResult.some((s) => s.status === "unhealthy")) {
		throw new Error(
			`Unhealthy services after ${maxRetries} retries: ${healthResult
				.filter((s) => s.status === "unhealthy")
				.map((s) => s.name)
				.join(", ")}`,
		);
	}

	console.log(colorify.green("All services are healthy"));
}

function getCheckSteps(options: CheckOptions): readonly StepProgressStep[] {
	const state: CheckState = { compose: null };

	const steps: StepProgressStep[] = [
		{
			label: "Starting Docker services",
			run: async () => {
				const code = await spawnContainerIndex(["up", "--build"]);
				if (code !== 0) throw new Error(`container up exited with code ${code}`);
			},
		},
		{
			label: "Waiting for services to become healthy",
			run: async () => {
				state.compose = new EntityCompose(getComposeFilePath());
				await monitorServiceHealth(state.compose, { verbose: options.quiet });
			},
		},
		{
			label: "Listing service URLs",
			run: async () => {
				if (state.compose === null) throw new Error("Compose not initialized");
				console.log(colorify.blue("\nServices are available at:"));
				const devUrls = await state.compose.getServiceUrls();
				for (const [name, url] of Object.entries(devUrls)) {
					console.log(colorify.cyan(`   • ${name}: ${url}`));
				}
			},
		},
	];

	if (!options.keepAlive) {
		steps.push({
			label: "Stopping Docker services",
			run: async () => {
				const code = await spawnContainerIndex(["down"]);
				if (code !== 0) throw new Error(`container down exited with code ${code}`);
			},
		});
	}

	return steps;
}

async function runCheckSteps(options: CheckOptions): Promise<void> {
	for (const step of getCheckSteps(options)) await step.run();
}

function CheckApp({ options }: { readonly options: CheckOptions }): ReactNode {
	const resolveSteps = useCallback(() => getCheckSteps(options), [options]);
	return (
		<StepProgressApp
			completedHeading="Compose stack health check completed"
			resolveSteps={resolveSteps}
		/>
	);
}

export async function runCheck(rest: readonly string[]): Promise<void> {
	const { values } = parseArgs({
		args: [...rest],
		options: {
			"keep-alive": { type: "boolean", short: "s", default: false },
			quiet: { type: "boolean", default: false },
		},
		strict: true,
	});

	const options: CheckOptions = {
		keepAlive: values["keep-alive"] === true,
		quiet: values.quiet === true,
	};

	if (options.quiet) {
		await runCheckSteps(options);
	} else {
		await renderAndExit(<CheckApp options={options} />);
	}

	console.log(colorify.green("✅ Compose stack health check completed successfully!"));
	if (options.keepAlive) {
		console.log(colorify.yellow("Services were left running (--keep-alive)."));
	}
}
