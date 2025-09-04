#!/usr/bin/env bun

import { colorify, createScript, type InferArgs, type ScriptConfig } from "@repo/intershell/core";
import {
	DefaultChangelogTemplate,
	EntityChangelog,
	EntityCompose,
	EntityPackages,
	EntityTag,
	EntityVersion,
	type VersionData,
} from "@repo/intershell/entities";
import { $ } from "bun";

const scriptConfig = {
	name: "Version Prepare",
	description: "Prepare version bumps and generate changelogs for packages",
	usage: "bun run version-prepare.ts [options]",
	examples: [
		"bun run version-prepare.ts",
		"bun run version-prepare.ts --package root",
		"bun run version-prepare.ts --from v1.0.0 --to HEAD",
		"bun run version-prepare.ts --from-version 1.0.0 --to-version 1.2.0",
		"bun run version-prepare.ts --package @repo/intershell --from-version 1.0.0",
	],
	options: [
		{
			short: "-p",
			long: "--package",
			description: "Package name to process (default: all packages)",
			required: false,
			type: "string",
			defaultValue: "root",
			validator: createScript.validators.nonEmpty,
		},
		{
			short: "-f",
			long: "--from",
			description: "Start commit/tag for changelog generation",
			required: false,
			type: "string",
			validator: createScript.validators.nonEmpty,
		},
		{
			short: "-t",
			long: "--to",
			description: "End commit/tag for changelog generation (default: HEAD)",
			required: false,
			type: "string",
			validator: createScript.validators.nonEmpty,
		},
		{
			short: "-fv",
			long: "--from-version",
			description:
				"Start version for changelog generation (converts to appropriate tag based on package)",
			required: false,
			type: "string",
			validator: createScript.validators.nonEmpty,
		},
		{
			short: "-tv",
			long: "--to-version",
			description:
				"End version for changelog generation (converts to appropriate tag based on package)",
			required: false,
			type: "string",
			validator: createScript.validators.nonEmpty,
		},
	],
} as const satisfies ScriptConfig;

/**
 * Converts a version to the appropriate tag based on package context
 * @param version - The version number (e.g., "1.2.3")
 * @param packageName - The package name to determine tag prefix
 * @returns The full tag name (e.g., "v1.2.3" or "intershell-v1.2.3")
 */
async function versionToTag(version: string, packageName?: string): Promise<string> {
	if (!packageName) {
		// Default to root package prefix when no specific package
		return `v${version}`;
	}

	const versionEntity = new EntityVersion(packageName);
	const prefix = await versionEntity.getTagPrefix();
	return `${prefix}${version}`;
}

/**
 * Resolves from/to commits, handling version-to-tag conversion when needed
 */
async function resolveCommitRange(
	args: InferArgs<typeof scriptConfig>,
	xConsole: typeof console,
): Promise<{ fromCommit: string; toCommit: string }> {
	let fromCommit: string;
	let toCommit: string;

	// Handle --from-version conversion
	if (args["from-version"]) {
		const fromTag = await versionToTag(args["from-version"], args.package);
		xConsole.info(`📝 Converting --from-version ${args["from-version"]} to tag: ${fromTag}`);
		fromCommit = await EntityTag.getBaseCommitSha(fromTag);
	} else if (args.from) {
		fromCommit = await EntityTag.getBaseCommitSha(args.from);
	} else {
		// No --from specified, let EntityVersion auto-find the correct base SHA
		// This will use the latest tag if it exists, or fall back to first commit for first-time versioning
		const versionEntity = new EntityVersion(args.package || "root");
		fromCommit = await versionEntity.getBaseTagShaForPackage();
	}

	// Handle --to-version conversion
	if (args["to-version"]) {
		const toTag = await versionToTag(args["to-version"], args.package);
		xConsole.info(`📝 Converting --to-version ${args["to-version"]} to tag: ${toTag}`);
		toCommit = await EntityTag.getBaseCommitSha(toTag);
	} else {
		toCommit = args.to || "HEAD";
	}

	return { fromCommit, toCommit };
}

export const versionPrepare = createScript(scriptConfig, async function main(args, xConsole) {
	const { fromCommit, toCommit } = await resolveCommitRange(args, xConsole);
	const processAll = !args.package;

	xConsole.info("🚀 Starting version preparation");
	if (args.from || args["from-version"]) {
		xConsole.info(
			`📝 Generating changelog from ${colorify.blue(fromCommit)} to ${colorify.blue(toCommit)}`,
		);
	} else {
		xConsole.info(
			`📝 Generating changelog to ${colorify.blue(toCommit)} (auto-detecting base for each package)`,
		);
	}

	let versionCommitMessage = "";
	const packageVersionCommitMessages = [];

	try {
		let packagesToProcess: string[] = [];

		if (processAll) {
			xConsole.info("📦 Processing versioned packages in workspace...");
			// CHANGE: Only process packages that should be versioned
			packagesToProcess = await EntityPackages.getVersionedPackages();
			xConsole.info(
				`Found ${packagesToProcess.length} versioned packages: ${packagesToProcess.join(", ")}`,
			);
		} else {
			const packageName = args.package;
			if (!packageName) {
				throw new Error("Package name is required when not processing all packages");
			}

			// Validate that the specified package should be versioned
			const packageInstance = new EntityPackages(packageName);
			if (!packageInstance.shouldVersion()) {
				throw new Error(
					`Package "${packageName}" should not be versioned (private package). Only versioned packages can be processed.`,
				);
			}

			packagesToProcess = [packageName];
			xConsole.info(`📦 Processing single package: ${colorify.blue(packageName)}`);
		}

		// Validate all packages before processing
		xConsole.info("🔍 Validating package configurations...");
		const validationResult = await EntityPackages.validateAllPackages();

		if (!validationResult.isValid) {
			xConsole.error(colorify.red("❌ Package validation failed!"));
			xConsole.error(colorify.red(`Found ${validationResult.totalErrors} validation errors:`));

			for (const packageResult of validationResult.packages) {
				if (packageResult.errors.length > 0) {
					for (const error of packageResult.errors) {
						xConsole.error(colorify.red(`  📦 ${error}`));
					}
				}
			}

			throw new Error(`Package validation failed with ${validationResult.totalErrors} errors`);
		}

		xConsole.info(colorify.green("✅ All packages passed validation"));

		const results: Array<
			{
				packageName: string;
				commitCount: number;
			} & VersionData
		> = [];

		let totalBumps = 0;
		let totalCommits = 0;

		for (const packageName of packagesToProcess) {
			try {
				let packageJson = new EntityPackages(packageName);
				const versionEntity = new EntityVersion(packageName);
				const prefix = await versionEntity.getTagPrefix();
				const template = new DefaultChangelogTemplate(packageName, prefix);
				const changelog = new EntityChangelog(packageName, template);

				// Determine the correct fromCommit for this specific package
				// If no --from specified, let EntityVersion auto-find the base SHA for this package
				const packageFromCommit =
					args.from || args["from-version"]
						? fromCommit
						: await versionEntity.getBaseTagShaForPackage();

				await changelog.calculateRange(packageFromCommit, toCommit);
				const commitCount = changelog.getCommitCount();
				const versionData = changelog.getVersionData();

				results.push({
					packageName,
					commitCount,
					...versionData,
				});

				if (commitCount === 0) {
					xConsole.log(
						colorify.yellow(`📦 ${packageName}: ${colorify.yellow("No commits found")}`),
					);
					// Still add to total commits even if no new commits
					totalCommits += commitCount;
					continue;
				}

				if (versionData.shouldBump) {
					totalBumps++;
					if (args["dry-run"]) {
						xConsole.log(
							`🚧 Dry run mode! would write to ${packageJson.getJsonPath()} to bump to ${versionData.targetVersion}`,
						);
					} else {
						await packageJson.writeVersion(versionData.targetVersion);
						// Create a new instance to refresh the cache after updating the version
						packageJson = new EntityPackages(packageName);
					}

					// Generate proper conventional commit message for each package
					const tagPrefix = await versionEntity.getTagPrefix();
					const tagName = `${tagPrefix}${versionData.targetVersion}`;
					versionCommitMessage += `release(${packageName}): ${tagName} [${versionData.bumpType}]\n\n`;

					const log = `📦 (${versionData.currentVersion} => ${versionData.targetVersion}) ${packageName}: ${versionData.bumpType} (${packageJson.getChangelogPath()})`;
					packageVersionCommitMessages.push(log);
					const coloredLog = `📦 (${colorify.yellow(versionData.currentVersion)} => ${colorify.green(versionData.targetVersion)}) ${colorify.blue(packageName)}: ${versionData.bumpType} (${colorify.green(packageJson.getChangelogPath())})`;
					xConsole.log(coloredLog);
				} else {
					xConsole.log(
						`📦 (${colorify.yellow(versionData.currentVersion)} => ${colorify.green(versionData.targetVersion)}) ${colorify.blue(packageName)}: ${versionData.bumpType === "none" ? "none" : "synced"}`,
					);
				}

				totalCommits += commitCount;
				const changelogContent = changelog.generateMergedChangelog();
				if (args["dry-run"]) {
					xConsole.log(
						`🚧 Dry run mode! would write to ${packageJson.getChangelogPath()} file with ${colorify.green(changelogContent.length.toString())} characters`,
					);
				} else {
					await packageJson.writeChangelog(changelogContent);
				}
			} catch (error) {
				xConsole.error(colorify.red(`❌ Failed to process package ${packageName}: ${error}`));
			}
		}

		xConsole.log("🔄 Updating package dependencies in lockfile...");
		await $`bun install`;

		// Generate more descriptive commit message based on processing mode
		if (packagesToProcess.length === 1) {
			const packageName = packagesToProcess[0];
			const packageResult = results.find((r) => r.packageName === packageName);
			const packageCommits = packageResult?.commitCount || 0;
			const packageJson = new EntityPackages(packageName);
			const changelogPath = packageJson.getChangelogPath();

			versionCommitMessage += `\n📝 Commits processed: ${packageCommits} (${changelogPath})`;
		} else {
			versionCommitMessage += packageVersionCommitMessages.join("\n");
			versionCommitMessage += `\n\n📦 Total packages processed: ${packagesToProcess.length}`;
			versionCommitMessage += `\n🚀 Packages needing version bumps: ${totalBumps}`;
			versionCommitMessage += `\n📝 Commits re-generated in changelog: ${totalCommits}`;
		}

		if (totalBumps > 0 || totalCommits > 0) {
			xConsole.log(
				"\n📝 Next steps:\n" +
					"1. Review the generated changelogs\n" +
					`2. Run ${colorify.blue("bun run version:apply")} to commit, tag and push the versions (you can turn it off using --no-push)`,
			);
		}

		if (!args["dry-run"]) {
			await Bun.write(".git/COMMIT_EDITMSG", versionCommitMessage);
			xConsole.log(
				`${colorify.green("📝 Commit message written in")} ${colorify.blue(".git/COMMIT_EDITMSG")}:`,
				`\n\t${versionCommitMessage.replace(/\n/g, "\n\t")}`,
			);
		} else {
			xConsole.log(
				colorify.yellow(
					"🚧 Dry run mode! would write to .git/COMMIT_EDITMSG this message:\n" +
						versionCommitMessage,
				),
			);
		}

		// Output packages that need deployment (for CI)
		const packagesToDeploy = results
			.filter((r) => r.shouldBump)
			.map((r) => r.packageName)
			.join(",");

		const services = await new EntityCompose("docker-compose.dev.yml").getServices();
		const servicesToDeploy = services.filter((s) => packagesToDeploy.includes(s.name));
		const servicesToDeployNames = servicesToDeploy.map((s) => s.name).join(",");

		if (packagesToDeploy) {
			if (process.env.GITHUB_OUTPUT && !args["dry-run"]) {
				const fs = await import("node:fs");
				await fs.promises.appendFile(
					process.env.GITHUB_OUTPUT,
					`packages-to-deploy=${servicesToDeployNames}\n`,
				);
			}
			xConsole.log(`\n🚀 Packages to deploy: ${colorify.blue(servicesToDeployNames)}`);
		}

		xConsole.log(colorify.green("✅ Version preparation completed!"));
	} catch (error) {
		xConsole.error(colorify.red(`❌ Version preparation failed: ${error}`));
		process.exit(1);
	}
});

if (import.meta.main) {
	versionPrepare.run();
}
