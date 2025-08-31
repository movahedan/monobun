#!/usr/bin/env bun

import { colorify, createScript, type ScriptConfig } from "@repo/intershell/core";
import {
	DefaultChangelogTemplate,
	EntityChangelog,
	EntityCompose,
	EntityPackages,
	EntityTag,
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
	],
	options: [
		{
			short: "-p",
			long: "--package",
			description: "Package name to process (default: all packages)",
			required: false,
			type: "string",
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
	],
} as const satisfies ScriptConfig;

export const versionPrepare = createScript(scriptConfig, async function main(args, xConsole) {
	const fromCommit = await EntityTag.getBaseTagSha(args.from);
	const toCommit = args.to || "HEAD";
	const processAll = !args.package;

	xConsole.info("🚀 Starting version preparation");
	xConsole.info(
		`📝 Generating changelog from ${colorify.blue(fromCommit)} to ${colorify.blue(toCommit)}`,
	);

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
			packagesToProcess = [packageName];
			xConsole.info(`📦 Processing single package: ${colorify.blue(packageName)}`);
		}

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
				const packageJson = new EntityPackages(packageName);
				const template = new DefaultChangelogTemplate(packageName);
				const changelog = new EntityChangelog(packageName, template);
				await changelog.calculateRange(fromCommit, toCommit);
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
					}

					if (packageName === "root") {
						versionCommitMessage += `release: ${EntityTag.toTag(versionData.targetVersion)}\n\n`;
					}

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

		versionCommitMessage += packageVersionCommitMessages.join("\n");
		versionCommitMessage += `\n\n📦 Total packages processed: ${packagesToProcess.length}`;
		versionCommitMessage += `\n🚀 Packages needing version bumps: ${totalBumps}`;
		versionCommitMessage += `\n📝 Commits re-generated in changelog: ${totalCommits}`;

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
