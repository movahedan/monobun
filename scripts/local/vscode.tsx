import { exists, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { $ } from "bun";

import { EntityPackage } from "intershell";
import { type ReactNode, useCallback } from "react";

import { renderAndExit } from "../shared/render-and-exit";
import { StepProgressApp, type StepProgressStep } from "../shared/step-progress";

export interface LocalVscodeOptions {
	readonly dryRun: boolean;
	readonly extensionsOnly: boolean;
	readonly settingsOnly: boolean;
	readonly quiet: boolean;
}

interface VscodeSyncState {
	scopes: string[];
	readonly vscodeDir: string;
	readonly settingsPath: string;
	readonly extensionsPath: string;
	recommendations: string[];
	settings: Record<string, unknown>;
	settingsConfigString: string;
	extensionsConfigString: string;
}

function stripComments(content: string): string {
	return content
		.replace(/\/\/[^\r\n]*/g, "")
		.replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, "")
		.replace(/^\s*[\r\n]/gm, "");
}

async function readJsonSettings(path: string): Promise<Record<string, unknown>> {
	if (!(await exists(path))) return {};
	const raw = await Bun.file(path).text();
	return JSON.parse(stripComments(raw)) as Record<string, unknown>;
}

async function readExtensionRecommendations(path: string): Promise<string[]> {
	if (!(await exists(path))) return [];
	const raw = await Bun.file(path).text();
	const parsed = JSON.parse(stripComments(raw)) as { recommendations?: string[] };
	return parsed.recommendations ?? [];
}

function getVscodeSteps(options: LocalVscodeOptions): readonly StepProgressStep[] {
	const vscodeDir = join(process.cwd(), ".vscode");
	const state: VscodeSyncState = {
		scopes: [],
		vscodeDir,
		settingsPath: join(vscodeDir, "settings.json"),
		extensionsPath: join(vscodeDir, "extensions.json"),
		recommendations: [],
		settings: {},
		settingsConfigString: "",
		extensionsConfigString: "",
	};

	const steps: StepProgressStep[] = [
		{
			label: "Resolving workspace packages",
			run: async () => {
				state.scopes = await EntityPackage.getAllPackages();
			},
		},
		{
			label: "Reading .vscode workspace config",
			run: async () => {
				state.settings = await readJsonSettings(state.settingsPath);
				state.recommendations = await readExtensionRecommendations(state.extensionsPath);
				const updatedSettings = {
					...state.settings,
					"conventionalCommits.scopes": state.scopes,
				};
				state.settingsConfigString = JSON.stringify(updatedSettings, null, 2);
				state.extensionsConfigString = JSON.stringify(
					{ recommendations: state.recommendations },
					null,
					2,
				);
			},
		},
	];

	if (options.dryRun) {
		steps.push({
			label: "Dry run (no files written)",
			run: async () => {},
		});
		return steps;
	}

	if (!options.settingsOnly) {
		steps.push({
			label: "Writing .vscode/extensions.json",
			run: async () => {
				if (!(await exists(state.vscodeDir))) await mkdir(state.vscodeDir, { recursive: true });
				await Bun.write(state.extensionsPath, state.extensionsConfigString);
				await $`bun run biome check --write ${state.extensionsPath}`.quiet();
			},
		});
	}

	if (!options.extensionsOnly) {
		steps.push({
			label: "Writing .vscode/settings.json",
			run: async () => {
				if (!(await exists(state.vscodeDir))) await mkdir(state.vscodeDir, { recursive: true });
				await Bun.write(state.settingsPath, state.settingsConfigString);
				await $`bun run biome check --write ${state.settingsPath}`.quiet();
			},
		});
	}

	return steps;
}

async function runVscodeSteps(options: LocalVscodeOptions): Promise<void> {
	for (const step of getVscodeSteps(options)) await step.run();
}

function VscodeApp({ options }: { readonly options: LocalVscodeOptions }): ReactNode {
	const resolveSteps = useCallback(() => getVscodeSteps(options), [options]);
	return <StepProgressApp completedHeading="VS Code sync completed" resolveSteps={resolveSteps} />;
}

export async function runLocalVscodeCli(rest: readonly string[]): Promise<void> {
	const { values } = parseArgs({
		args: [...rest],
		options: {
			"dry-run": { type: "boolean", default: false },
			"extensions-only": { type: "boolean", default: false },
			"settings-only": { type: "boolean", default: false },
			quiet: { type: "boolean", default: false },
		},
		strict: true,
	});

	const options: LocalVscodeOptions = {
		dryRun: values["dry-run"] === true,
		extensionsOnly: values["extensions-only"] === true,
		settingsOnly: values["settings-only"] === true,
		quiet: values.quiet === true,
	};

	if (options.quiet) {
		await runVscodeSteps(options);
		return;
	}

	await renderAndExit(<VscodeApp options={options} />);
}
