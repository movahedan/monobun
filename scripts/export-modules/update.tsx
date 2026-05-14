import type { Dirent } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { $ } from "bun";
import { type ReactNode, useCallback } from "react";
import { colorify } from "../colorify";

import { renderAndExit } from "../render-and-exit";
import { StepProgressApp, type StepProgressStep } from "../step-progress";

import { printHelpAndExit } from "./help";

const MAX_PATTERN_LENGTH = 500;

export interface ExportModulesOptions {
	readonly useSrc: boolean;
	readonly dryRun: boolean;
	readonly quiet: boolean;
	readonly pattern: string | undefined;
	readonly regexFlags: string;
}

interface ExportModulesState {
	packageJsonPath: string;
	packageDir: string;
	srcDir: string;
	files: readonly Dirent[];
	patternMatchedPaths: readonly string[];
	compiledPattern: RegExp | undefined;
	newExports: Record<string, string>;
}

function toPosixPath(filePath: string): string {
	return filePath.split(path.sep).join("/");
}

async function collectTsFilesRecursive(rootDir: string): Promise<readonly string[]> {
	const results: string[] = [];

	const walk = async (dir: string): Promise<void> => {
		const entries = await readdir(dir, { withFileTypes: true });
		for (const entry of entries) {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				await walk(full);
				continue;
			}
			if (!entry.isFile()) continue;
			if (entry.name.endsWith(".d.ts")) continue;
			if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
				results.push(full);
			}
		}
	};

	await walk(rootDir);
	return results;
}

function compilePathRegex(pattern: string, flags: string): RegExp {
	if (pattern.length > MAX_PATTERN_LENGTH) {
		throw new Error(`Pattern exceeds max length (${MAX_PATTERN_LENGTH})`);
	}
	const safeFlags = flags.replaceAll("g", "");
	return new RegExp(pattern, safeFlags);
}

function exportKeyFromMatch(relFromSrcPosix: string, match: RegExpMatchArray): string {
	if (match[1] !== undefined && match[1].length > 0) {
		const sub = match[1].replace(/^\.?\//, "");
		if (sub === "" || sub === ".") {
			return ".";
		}
		return sub.startsWith("./") ? sub : `./${sub}`;
	}

	if (relFromSrcPosix === "index.ts" || relFromSrcPosix === "index.tsx") {
		return ".";
	}

	const noExt = relFromSrcPosix.replace(/\.tsx?$/, "");
	const parts = noExt.split("/");
	if (parts.length >= 2 && parts[parts.length - 1] === parts[parts.length - 2]) {
		return `./${parts[parts.length - 1]}`;
	}

	return `./${noExt}`;
}

function buildExportsFromPattern(
	absoluteFiles: readonly string[],
	packageDir: string,
	srcDir: string,
	regex: RegExp,
): Record<string, string> {
	const newExports: Record<string, string> = {};
	const duplicateKeys = new Map<string, string[]>();

	for (const abs of absoluteFiles) {
		const relPackage = toPosixPath(path.relative(packageDir, abs));
		const match = relPackage.match(regex);
		if (match === null) continue;

		const relFromSrc = toPosixPath(path.relative(srcDir, abs));
		const key = exportKeyFromMatch(relFromSrc, match);
		const exportPath = relPackage.startsWith(".") ? relPackage : `./${relPackage}`;

		const prior = newExports[key];
		if (prior !== undefined && prior !== exportPath) {
			const list = duplicateKeys.get(key) ?? [prior];
			list.push(exportPath);
			duplicateKeys.set(key, list);
		}

		newExports[key] = exportPath;
	}

	if (duplicateKeys.size > 0) {
		const lines = [...duplicateKeys.entries()]
			.map(([key, paths]) => `${key}: ${paths.join(", ")}`)
			.join("\n");
		console.warn(colorify.yellow(`Duplicate export keys (last path wins):\n${lines}`));
	}

	return newExports;
}

async function getNewExports(
	files: readonly Dirent[],
	srcDir: string,
	packageDir: string,
): Promise<Record<string, string>> {
	const newExports: Record<string, string> = {};

	for (const file of files) {
		if (file.isDirectory()) {
			const indexFile = path.join(srcDir, file.name, "index.ts");
			const indexTsxFile = path.join(srcDir, file.name, "index.tsx");
			const sameNameFile = path.join(srcDir, file.name, `${file.name}.ts`);
			const sameNameTsxFile = path.join(srcDir, file.name, `${file.name}.tsx`);

			if (await Bun.file(indexFile).exists()) {
				newExports[`./${file.name}`] = `./${path.relative(packageDir, indexFile)}`;
			} else if (await Bun.file(indexTsxFile).exists()) {
				newExports[`./${file.name}`] = `./${path.relative(packageDir, indexTsxFile)}`;
			} else if (await Bun.file(sameNameFile).exists()) {
				newExports[`./${file.name}`] = `./${path.relative(packageDir, sameNameFile)}`;
			} else if (await Bun.file(sameNameTsxFile).exists()) {
				newExports[`./${file.name}`] = `./${path.relative(packageDir, sameNameTsxFile)}`;
			}

			continue;
		}

		const shouldSkip = !file.name.endsWith(".ts") && !file.name.endsWith(".tsx");
		if (shouldSkip) continue;

		if (file.name === "index.ts") {
			newExports["."] = "./index.ts";
			continue;
		}

		const mainFile = path.join(srcDir, file.name);
		const relativePath = `./${path.relative(packageDir, mainFile)}`;

		if (await Bun.file(mainFile).exists()) {
			newExports[`./${file.name}`] = relativePath;
		}
	}

	return newExports;
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
					const allFiles = await collectTsFilesRecursive(state.srcDir);
					let regex: RegExp;
					try {
						regex = compilePathRegex(options.pattern, options.regexFlags);
					} catch (error: unknown) {
						const message = error instanceof Error ? error.message : String(error);
						throw new Error(`Invalid --pattern: ${message}`);
					}
					state.compiledPattern = regex;
					state.patternMatchedPaths = allFiles.filter((abs) => {
						const rel = toPosixPath(path.relative(state.packageDir, abs));
						return regex.test(rel);
					});
					state.files = [];
					console.log(
						colorify.blue(
							`Pattern ${colorify.cyan(options.pattern)} matched ${String(state.patternMatchedPaths.length)} of ${String(allFiles.length)} files under ${path.relative(state.packageDir, state.srcDir) || "."}`,
						),
					);
					return;
				}

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
			},
		},
		{
			label: "Resolving export paths",
			run: async () => {
				if (options.pattern !== undefined && state.compiledPattern !== undefined) {
					state.newExports = buildExportsFromPattern(
						state.patternMatchedPaths,
						state.packageDir,
						state.srcDir,
						state.compiledPattern,
					);
					return;
				}

				state.newExports = await getNewExports(state.files, state.srcDir, state.packageDir);
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
				exports?: Record<string, string>;
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
		regexFlags: values["regex-flags"] ?? "",
	};

	const state: ExportModulesState = {
		packageJsonPath: "",
		packageDir: "",
		srcDir: "",
		files: [],
		patternMatchedPaths: [],
		compiledPattern: undefined,
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
