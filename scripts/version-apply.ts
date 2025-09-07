#!/usr/bin/env bun

import { colorify, createScript, type InferArgs, type ScriptConfig } from "@repo/intershell/core";
import { EntityPackages, EntityTagPackage } from "@repo/intershell/entities";
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
	const packageName = args.package || "root";
	xConsole.info(`📦 Processing package: ${colorify.blue(packageName)}`);

	const packageInstance = new EntityPackages(packageName);
	const version = packageInstance.readVersion();
	const tagSeriesName = packageInstance.getTagSeriesName();
	const tagName = `${tagSeriesName}${version}`;

	if (!tagSeriesName) {
		throw new Error(
			`Tag series name not found for ${packageName}, this package should not be versioned (private package). Only versioned packages can be processed.`,
		);
	}

	if (args["dry-run"]) {
		xConsole.log(colorify.yellow("🔍 Dry run mode - would execute:"));
		xConsole.log(colorify.gray(`  • Commit version changes for package ${packageName}`));
		xConsole.log(colorify.gray(`  • Create tag ${tagName} for ${packageName}`));
		if (!args["no-push"]) {
			xConsole.log(colorify.gray("  • Push commit changes to remote"));
			xConsole.log(colorify.gray("  • Push tags to remote"));
		}
		return;
	}

	xConsole.log("📁 Adding all changes...");
	await $`git add .`;
	const statusResult = await $`git status --porcelain`.nothrow();
	const hasChanges = statusResult.text().trim() !== "";

	if (!hasChanges) {
		xConsole.log(colorify.yellow("⚠️ No changes to commit"));
		return;
	}

	await commitVersionChanges(xConsole);
	await createTagsForPackage(packageName, args, xConsole);
	await pushChanges(args, xConsole);

	xConsole.log(colorify.green("✅ Version apply operation completed successfully!"));
});

if (import.meta.main) {
	versionApply.run();
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

async function createTagsForPackage(
	packageName: string,
	args: InferArgs<typeof scriptConfig>,
	xConsole: typeof console,
): Promise<void> {
	const packageInstance = new EntityPackages(packageName);
	const version = packageInstance.readVersion();
	if (!version) {
		throw new Error(`Version not found for ${packageName}`);
	}
	const tagPackage = new EntityTagPackage(packageName);

	// Check if tag already exists
	const tagExists = await tagPackage.packageTagExists(version);
	if (tagExists) {
		const prefix = await tagPackage.getTagPrefix();
		const tagName = `${prefix}${version}`;
		xConsole.log(`⏭️ Tag already exists: ${tagName}`);
		return;
	}

	xConsole.info(`🏷️ Creating tag for ${packageName}: ${version}`);

	try {
		await tagPackage.createPackageTag(
			version,
			args.message || `Release ${packageName} version ${version}`,
		);

		const prefix = await tagPackage.getTagPrefix();
		const tagName = `${prefix}${version}`;
		xConsole.log(`✅ Created tag: ${tagName}`);
	} catch (error) {
		throw new Error(
			`Failed to create tag for ${packageName}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

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
