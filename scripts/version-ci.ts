#!/usr/bin/env bun

import { colorify, createScript, type ScriptConfig } from "@repo/intershell/core";
import { EntityTag } from "@repo/intershell/entities";
import { $ } from "bun";
import { versionApply } from "./version-apply";
import { versionPrepare } from "./version-prepare";

const scriptConfig = {
	name: "Version CI",
	description: "Complete CI versioning workflow: auth → prepare → apply",
	usage: "bun run version-ci.ts [options]",
	examples: [
		"bun run version-ci.ts",
		"bun run version-ci.ts --dry-run",
		"bun run version-ci.ts --no-push",
	],
	options: [
		{
			short: "-n",
			long: "--no-push",
			description: "Don't push tag to remote after creation",
			required: false,
			defaultValue: false,
			type: "boolean",
			validator: createScript.validators.boolean,
		},
		{
			short: "-d",
			long: "--dry-run",
			description: "Show planned changes without applying them",
			required: false,
			defaultValue: false,
			type: "boolean",
			validator: createScript.validators.boolean,
		},
	],
} as const satisfies ScriptConfig;

export const versionCI = createScript(scriptConfig, async function main(args, xConsole) {
	xConsole.info("🚀 Starting CI version workflow...");

	await configureGitAuth(args, xConsole);

	const fromTag = await EntityTag.getBaseCommitSha();
	xConsole.info(`📝 Using base commit: ${colorify.blue(fromTag)}`);

	xConsole.info("\n🔧 Preparing versions...");
	await versionPrepare.run({
		"dry-run": args["dry-run"],
		from: fromTag,
	});

	xConsole.info("\n🚀 Applying version changes...");
	await versionApply.run({
		"no-push": args["no-push"],
		"dry-run": args["dry-run"],
	});

	xConsole.log(colorify.green("\n✅ CI version workflow completed successfully!"));
});

async function configureGitAuth(
	args: { "dry-run"?: boolean },
	xConsole: typeof console,
): Promise<void> {
	xConsole.log("🔍 Configuring Git authentication...");

	if (args["dry-run"]) {
		xConsole.log("-> 🔍 Dry run, skipping git config");
		return;
	}

	if (!process.env.GITHUB_ACTIONS) {
		xConsole.log("-> 🔍 Running locally, skip git config");
		return;
	}

	if (!process.env.GITHUB_REPOSITORY) {
		xConsole.log("-> ⚠️ GITHUB_REPOSITORY not found");
		return;
	}

	if (!process.env.GITHUB_TOKEN) {
		xConsole.log("-> ⚠️ GITHUB_TOKEN not found");
		return;
	}

	xConsole.log("-> 🔐 Configuring Git authentication...");
	await $`git config user.name "github-actions[bot]"`;
	await $`git config user.email "github-actions[bot]@users.noreply.github.com"`;
	await $`git remote set-url origin https://x-access-token:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`;

	const actualRemoteUrl = await $`git remote get-url origin`.text();
	const maskedUrl = actualRemoteUrl.replace(/https:\/\/x-access-token:[^@]+@/, "***@");
	xConsole.log(`-> 🔗 Git authentication configured, remote URL: ${maskedUrl}`);
}

if (import.meta.main) {
	versionCI.run();
}
