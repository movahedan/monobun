#!/usr/bin/env bun

import fs from "node:fs";
import { colorify, createScript } from "@repo/intershell/core";
import {
	DefaultChangelogTemplate,
	EntityChangelog,
	EntityCommitPackage,
	EntityCompose,
	EntityPackages,
	EntityTag,
	EntityTagPackage,
	EntityVersion,
} from "@repo/intershell/entities";
import { $ } from "bun";

export const versionPrepare = createScript(
	{
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
	} as const,
	async function main(args, xConsole) {
		const packageName = args.package || "root";

		await validatePackages(xConsole);
		const allVersionedPackages = await EntityPackages.getVersionedPackages();
		const packageJson = new EntityPackages(packageName);
		const tagPackage = new EntityTagPackage(packageName);
		const commitPackage = new EntityCommitPackage(packageName);
		const versionEntity = new EntityVersion(packageName);
		const prefix = packageJson.getTagSeriesName();

		if (!allVersionedPackages.includes(packageName)) {
			throw new Error(
				`Package "${packageName}" should not be versioned (private package). Only versioned packages can be processed.`,
			);
		}
		if (!prefix) {
			throw new Error(
				`Tag series name not found for ${packageName}, this package should not be versioned (private package). Only versioned packages can be processed.`,
			);
		}

		xConsole.info(`🚀 Starting version preparation for package ${colorify.blue(packageName)}`);
		const { fromCommit, toCommit } = await resolveCommitRange(
			{
				packageName,
				from: args.from,
				to: args.to,
				fromVersion: args["from-version"],
				toVersion: args["to-version"],
			},
			xConsole,
		);

		const from =
			args.from || args["from-version"] ? fromCommit : await tagPackage.getBaseTagShaForPackage();

		xConsole.info(
			`📝 Generating changelog from ${colorify.blue(from)} to ${colorify.blue(toCommit)}`,
		);

		// Get commits and version data using EntityVersion
		const commits = await commitPackage.getCommitsInRange(from, toCommit);
		const versionData = await versionEntity.calculateVersionData(
			packageJson.readVersion() || "0.0.0",
			"0.0.0", // This will be determined by EntityVersion internally
			commits,
		);

		const commitCount = commits.length;

		// Create changelog with commits
		const template = new DefaultChangelogTemplate(packageName, prefix);
		const changelog = new EntityChangelog(packageName, commits, { template, versionMode: true });
		const changelogContent = changelog.generateMergedChangelog();

		if (commitCount === 0) {
			xConsole.log(colorify.yellow(`📦 ${packageName}: ${colorify.yellow("No commits found")}`));
			return;
		}
		if (!versionData.shouldBump) {
			xConsole.log(
				colorify.yellow(
					`📦 ${packageName}: ${colorify.yellow("No version bump needed")} (${versionData.bumpType})`,
				),
			);
			return;
		}

		xConsole.log(
			`🔄 Updating package version from ${versionData.currentVersion} to ${versionData.targetVersion} in ${packageJson.getJsonPath()}`,
		);
		await packageJson.writeVersion(versionData.targetVersion);
		await $`bun install`;
		await packageJson.writeChangelog(changelogContent);

		const tagName = `${prefix}${versionData.targetVersion}`;
		const versionCommitMessage = `release(${packageName}): ${tagName} [${versionData.bumpType}] (${versionData.currentVersion} => ${versionData.targetVersion})\n\n📝 Commits processed: ${commitCount}\n📝 Changelog updated: (${packageJson.getChangelogPath()})`;
		xConsole.log(
			`📦 (${colorify.yellow(versionData.currentVersion)} => ${colorify.green(versionData.targetVersion)}) ${colorify.blue(packageName)}: ${versionData.bumpType} (${colorify.green(packageJson.getChangelogPath())})`,
		);
		await Bun.write(".git/COMMIT_EDITMSG", versionCommitMessage);
		xConsole.log(
			`${colorify.green("📝 Commit message written in")} ${colorify.blue(".git/COMMIT_EDITMSG")}:`,
			`\n\t${versionCommitMessage.replace(/\n/g, "\n\t")}`,
		);

		const services = await new EntityCompose("docker-compose.yml").getServices();
		const servicesToDeploy = services.filter((s) => s.name === packageName).map((s) => s.name);
		if (servicesToDeploy) {
			const servicesToDeployNames = servicesToDeploy.join(",");
			if (process.env.GITHUB_OUTPUT) {
				await fs.promises.appendFile(
					process.env.GITHUB_OUTPUT,
					`packages-to-deploy=${servicesToDeployNames}\n`,
				);
			}
			xConsole.log(`\n🚀 Packages to deploy: ${colorify.blue(servicesToDeployNames)}`);
		}

		xConsole.log(
			"\n📝 Next steps:\n" +
				"1. Review the generated changelogs\n" +
				`2. Run ${colorify.blue("bun run version:apply")} to commit, tag and push the versions (you can turn it off using --no-push)`,
		);
		xConsole.log(colorify.green("✅ Version preparation completed!"));
	},
);

if (import.meta.main) {
	versionPrepare.run();
}

/**
 * Resolves from/to commits, handling version-to-tag conversion when needed
 */
async function resolveCommitRange(
	{
		packageName,
		from,
		to,
		fromVersion,
		toVersion,
	}: { packageName: string; from?: string; to?: string; fromVersion?: string; toVersion?: string },
	xConsole: typeof console,
): Promise<{ fromCommit: string; toCommit: string }> {
	const tagPackage = new EntityTagPackage(packageName);

	let fromCommit: string;
	let toCommit: string;
	// Handle --from-version conversion
	if (fromVersion) {
		const fromTag = `${await tagPackage.getTagPrefix()}${fromVersion}`;
		xConsole.info(`📝 Converting --from-version ${fromVersion} to tag: ${fromTag}`);
		fromCommit = await EntityTag.getBaseCommitSha(fromTag);
	} else if (from) {
		fromCommit = await EntityTag.getBaseCommitSha(from);
	} else {
		// No --from specified, let EntityTagPackage auto-find the correct base SHA
		// This will use the latest tag if it exists, or fall back to first commit for first-time versioning
		fromCommit = await tagPackage.getBaseTagShaForPackage();
	}

	// Handle --to-version conversion
	if (toVersion) {
		const toTag = `${await tagPackage.getTagPrefix()}${toVersion}`;
		xConsole.info(`📝 Converting --to-version ${toVersion} to tag: ${toTag}`);
		toCommit = await EntityTag.getBaseCommitSha(toTag);
	} else {
		toCommit = to || "HEAD";
	}

	return { fromCommit, toCommit };
}

async function validatePackages(xConsole: typeof console): Promise<void> {
	xConsole.info("🔍 Validating package configurations...");
	const validationResult = await EntityPackages.validateAllPackages();
	if (validationResult.length > 0) {
		xConsole.error(colorify.red("❌ Package validation failed!"));
		xConsole.error(colorify.red(`Found ${validationResult.length} validation errors:`));
		for (const error of validationResult) {
			xConsole.error(colorify.red(`  📦 ${error}`));
		}
		throw new Error(`Package validation failed with ${validationResult.length} errors`);
	}
	xConsole.info(colorify.green("✅ All packages passed validation"));
}
