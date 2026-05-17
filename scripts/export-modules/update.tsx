import type { Dirent } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { $ } from "bun";
import { type ReactNode, useCallback } from "react";
import { collectFilesRecursive } from "../shared/collect-files-recursive";
import { colorify } from "../shared/colorify";
import { matchFilesByPattern } from "../shared/match-files-by-pattern";
import { renderAndExit } from "../shared/render-and-exit";
import { StepProgressApp, type StepProgressStep } from "../shared/step-progress";
import { buildExportsWithPattern } from "./build-exports-with-pattern";
import { buildExportsWithoutPattern } from "./build-exports-without-pattern";
import { compilePathRegex } from "./compile-path-regex";
import { printHelpAndExit } from "./help";
import type { PackageExportValue } from "./source-export";

export interface ExportModulesOptions {
	readonly useSrc: boolean;
	readonly dryRun: boolean;
	readonly quiet: boolean;
	readonly pattern: string | undefined;
	readonly cssPattern: string | undefined;
	readonly regexFlags: string;
}

interface ExportModulesState {
	packageJsonPath: string;
	packageDir: string;
	srcDir: string;
	files: readonly Dirent[];
	patternMatchedPaths: readonly string[];
	cssPatternMatchedPaths: readonly string[];
	compiledPattern: RegExp | undefined;
	compiledCssPattern: RegExp | undefined;
	newExports: Record<string, PackageExportValue>;
}

function getExportModulesSteps(
	options: ExportModulesOptions,
	state: ExportModulesState,
): readonly StepProgressStep[] {
	const steps: StepProgressStep[] = [
		{
			label: "Scanning modules",
			run: async () => {
				state.packageJsonPath = path.join(process.cwd(), "package.json");
				state.packageDir = path.dirname(state.packageJsonPath);
				state.srcDir = options.useSrc ? path.join(state.packageDir, "src") : state.packageDir;
				if (options.pattern !== undefined) {
					const allTsFiles = await collectFilesRecursive(state.srcDir, [".ts", ".tsx"]);
					try {
						state.compiledPattern = compilePathRegex(options.pattern, options.regexFlags);
					} catch (error: unknown) {
						const message = error instanceof Error ? error.message : String(error);
						throw new Error(`Invalid --pattern: ${message}`);
					}
					state.patternMatchedPaths = matchFilesByPattern(
						allTsFiles,
						state.packageDir,
						state.compiledPattern,
					);
					state.files = [];
					console.log(
						colorify.blue(
							`Pattern ${colorify.cyan(options.pattern)} matched ${String(state.patternMatchedPaths.length)} of ${String(allTsFiles.length)} TypeScript files under ${path.relative(state.packageDir, state.srcDir) || "."}`,
						),
					);
				} else {
					state.compiledPattern = undefined;
					state.patternMatchedPaths = [];
					state.files = await readdir(state.srcDir, {
						withFileTypes: true,
						recursive: false,
					});
					console.log(
						colorify.blue(
							`Found ${state.files.length} entries under ${path.relative(state.packageDir, state.srcDir) || "."}:`,
						),
						colorify.cyan(state.files.map((f) => f.name).join(" ")),
					);
				}

				if (options.cssPattern !== undefined) {
					const allCssFiles = await collectFilesRecursive(state.srcDir, [".css"]);
					try {
						state.compiledCssPattern = compilePathRegex(options.cssPattern, options.regexFlags);
					} catch (error: unknown) {
						const message = error instanceof Error ? error.message : String(error);
						throw new Error(`Invalid --css-pattern: ${message}`);
					}
					state.cssPatternMatchedPaths = matchFilesByPattern(
						allCssFiles,
						state.packageDir,
						state.compiledCssPattern,
					);
					console.log(
						colorify.blue(
							`CSS pattern ${colorify.cyan(options.cssPattern)} matched ${String(state.cssPatternMatchedPaths.length)} of ${String(allCssFiles.length)} CSS files under ${path.relative(state.packageDir, state.srcDir) || "."}`,
						),
					);
				} else {
					state.compiledCssPattern = undefined;
					state.cssPatternMatchedPaths = [];
				}
			},
		},
		{
			label: "Resolving export paths",
			run: async () => {
				const exports: Record<string, PackageExportValue> = {};

				if (options.pattern !== undefined && state.compiledPattern !== undefined) {
					Object.assign(
						exports,
						buildExportsWithPattern(
							state.patternMatchedPaths,
							state.packageDir,
							state.srcDir,
							state.compiledPattern,
						),
					);
				} else {
					Object.assign(
						exports,
						await buildExportsWithoutPattern(state.files, state.srcDir, state.packageDir),
					);
				}

				if (options.cssPattern !== undefined && state.compiledCssPattern !== undefined) {
					Object.assign(
						exports,
						buildExportsWithPattern(
							state.cssPatternMatchedPaths,
							state.packageDir,
							state.srcDir,
							state.compiledCssPattern,
						),
					);
				}

				state.newExports = exports;
			},
		},
	];

	if (options.dryRun) {
		steps.push({
			label: "Dry run (no write)",
			run: async () => {
				console.log(colorify.yellow("Dry run — exports that would be written:"));
				console.log(JSON.stringify(state.newExports, null, 2));
			},
		});
		return steps;
	}

	steps.push({
		label: "Writing package.json",
		run: async () => {
			const packageJson = JSON.parse(await Bun.file(state.packageJsonPath).text()) as {
				exports?: Record<string, PackageExportValue>;
			};
			packageJson.exports = state.newExports;
			await Bun.write(state.packageJsonPath, JSON.stringify(packageJson, null, 2));
			await $`bun biome check --write --no-errors-on-unmatched ${state.packageJsonPath}`.quiet();
		},
	});

	return steps;
}

async function runExportModulesSteps(
	options: ExportModulesOptions,
	state: ExportModulesState,
): Promise<void> {
	for (const step of getExportModulesSteps(options, state)) await step.run();
}

function ExportModulesApp({
	options,
	state,
}: {
	readonly options: ExportModulesOptions;
	readonly state: ExportModulesState;
}): ReactNode {
	const resolveSteps = useCallback(() => getExportModulesSteps(options, state), [options, state]);
	return (
		<StepProgressApp completedHeading="package.json exports updated" resolveSteps={resolveSteps} />
	);
}

export async function runExportModules(rest: readonly string[]): Promise<void> {
	const { values } = parseArgs({
		args: [...rest],
		options: {
			help: { type: "boolean", short: "h", default: false },
			"dry-run": { type: "boolean", short: "d", default: false },
			"no-src": { type: "boolean", default: false },
			quiet: { type: "boolean", default: false },
			pattern: { type: "string" },
			"css-pattern": { type: "string" },
			"regex-flags": { type: "string", default: "" },
		},
		strict: true,
	});

	if (values.help === true) {
		await printHelpAndExit();
	}

	const options: ExportModulesOptions = {
		useSrc: values["no-src"] !== true,
		dryRun: values["dry-run"] === true,
		quiet: values.quiet === true,
		pattern: values.pattern,
		cssPattern: values["css-pattern"],
		regexFlags: values["regex-flags"] ?? "",
	};

	const state: ExportModulesState = {
		packageJsonPath: "",
		packageDir: "",
		srcDir: "",
		files: [],
		patternMatchedPaths: [],
		cssPatternMatchedPaths: [],
		compiledPattern: undefined,
		compiledCssPattern: undefined,
		newExports: {},
	};

	if (options.quiet) {
		await runExportModulesSteps(options, state);
	} else {
		await renderAndExit(<ExportModulesApp options={options} state={state} />);
	}

	if (!options.dryRun) {
		console.log(colorify.green("Package.json updated successfully"));
	}
}
