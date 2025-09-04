#!/usr/bin/env bun

import { colorify, createScript, type InferArgs, type ScriptConfig } from "@repo/intershell/core";
import { EntityPackages, EntityVersion } from "@repo/intershell/entities";
import { $ } from "bun";

const scriptConfig = {
	name: "Version Apply",
	description: "Create git version tags and commit version changes",
	usage: "bun run version-apply.ts [options]",
	examples: [
		"bun run version-apply.ts",
		"bun run version-apply.ts --message 'Release version 1.2.3'",
		"bun run version-apply.ts --no-push",
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
			short: "-m",
			long: "--message",
			description: "Tag message",
			required: false,
			type: "string",
			validator: createScript.validators.nonEmpty,
		},
		{
			short: "-n",
			long: "--no-push",
			description: "Don't push tag to remote after creation",
			required: false,
			defaultValue: false,
			type: "boolean",
			validator: createScript.validators.boolean,
		},
	],
} as const satisfies ScriptConfig;

export const versionApply = createScript(scriptConfig, async function main(args, xConsole) {
	let packagesToProcess: string[] = [];

	if (args.package) {
		// Process single package
		const packageName = args.package;

		// Validate that the specified package should be versioned
		const packageInstance = new EntityPackages(packageName);
		if (!packageInstance.shouldVersion()) {
			throw new Error(
				`Package "${packageName}" should not be versioned (private package). Only versioned packages can be processed.`,
			);
		}

		packagesToProcess = [packageName];
		xConsole.info(`📦 Processing single package: ${colorify.blue(packageName)}`);
	} else {
		// Process all versioned packages
		packagesToProcess = await EntityPackages.getVersionedPackages();
		xConsole.info(
			`📦 Processing ${packagesToProcess.length} versioned packages: ${packagesToProcess.join(", ")}`,
		);
	}

	if (args["dry-run"]) {
		xConsole.log(colorify.yellow("🔍 Dry run mode - would execute:"));
		xConsole.log(colorify.gray("  • Commit version changes for all versioned packages"));

		// Show what tags would be created for each package
		for (const packageName of packagesToProcess) {
			const packageInstance = new EntityPackages(packageName);
			const version = packageInstance.readVersion();
			const tagSeriesName = packageInstance.getTagSeriesName();
			const tagName = tagSeriesName ? `${tagSeriesName}${version}` : `v${version}`;
			xConsole.log(colorify.gray(`  • Create tag ${tagName} for ${packageName}`));
		}

		if (!args["no-push"]) {
			xConsole.log(colorify.gray("  • Push commit changes to remote"));
			xConsole.log(colorify.gray("  • Push tags to remote"));
		}
		return;
	}

	xConsole.info("💾 Committing version changes...");

	xConsole.log("📁 Adding all changes...");
	await $`git add .`;
	const statusResult = await $`git status --porcelain`.nothrow();
	const hasChanges = statusResult.text().trim() !== "";

	if (!hasChanges) {
		xConsole.log(colorify.yellow("⚠️ No changes to commit"));
		return;
	}

	await commitVersionChanges(xConsole);
	await createTagsForPackages(packagesToProcess, args, xConsole);
	await pushChanges(args, xConsole);

	xConsole.log(colorify.green("✅ Version apply operation completed successfully!"));
});

async function pushChanges(
	args: InferArgs<typeof scriptConfig>,
	xConsole: typeof console,
): Promise<void> {
	if (args["no-push"]) {
		xConsole.log(colorify.yellow("⚠️ Skipping push (--no-push specified)"));
		return;
	}

	if (args["dry-run"]) {
		xConsole.log(colorify.yellow("⚠️ Skipping push (--dry-run specified)"));
		return;
	}

	try {
		xConsole.info("📤 Pushing commit changes to remote...");
		await $`git push --follow-tags`;
		xConsole.log("✅ Pushed commit changes to remote");
	} catch (error) {
		throw new Error(
			`Failed to push commit changes to remote: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

async function createTagsForPackages(
	packagesToProcess: string[],
	args: InferArgs<typeof scriptConfig>,
	xConsole: typeof console,
): Promise<void> {
	for (const packageName of packagesToProcess) {
		const packageInstance = new EntityPackages(packageName);
		const version = packageInstance.readVersion();
		if (!version) {
			throw new Error(`Version not found for ${packageName}`);
		}
		const versionEntity = new EntityVersion(packageName);

		// Check if tag already exists
		const tagExists = await versionEntity.packageTagExists(version);
		if (tagExists) {
			const prefix = await versionEntity.getTagPrefix();
			const tagName = `${prefix}${version}`;
			xConsole.log(`⏭️ Tag already exists: ${tagName}`);
			continue;
		}

		xConsole.info(`🏷️ Creating tag for ${packageName}: ${version}`);

		try {
			await versionEntity.createPackageTag(
				version,
				args.message || `Release ${packageName} version ${version}`,
			);

			const prefix = await versionEntity.getTagPrefix();
			const tagName = `${prefix}${version}`;
			xConsole.log(`✅ Created tag: ${tagName}`);
		} catch (error) {
			throw new Error(
				`Failed to create tag for ${packageName}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}
}

async function commitVersionChanges(xConsole: typeof console): Promise<void> {
	const commitMessage = await Bun.file(".git/COMMIT_EDITMSG").text();

	xConsole.log("📝 Commit message:");
	xConsole.log(commitMessage);

	await $`git commit -m "${commitMessage}"`;

	xConsole.log(colorify.green("✅ Successfully committed version changes"));
	const commitHash = await $`git rev-parse --short HEAD`.text();
	xConsole.log(`🏷️ Commit hash: ${commitHash.trim()}`);
}

if (import.meta.main) {
	versionApply.run();
}
