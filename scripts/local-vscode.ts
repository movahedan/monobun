#!/usr/bin/env bun;

import { exists, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { createScript, type ScriptConfig } from "@repo/intershell/core";
import { EntityPackage } from "@repo/intershell/entities";
import { $ } from "bun";

const syncVscodeConfigScriptConfig = {
	name: "Local VS Code Configuration Sync",
	description:
		"Synchronize VS Code extensions and settings from devcontainer.json to .vscode/ directory",
	usage: "bun run local:vscode [options]",
	examples: [
		"bun run local:vscode",
		"bun run local:vscode --dry-run",
		"bun run local:vscode --extensions-only",
		"bun run local:vscode --settings-only",
	],
	options: [],
} as const satisfies ScriptConfig;

export const syncVscodeConfigScript = createScript(
	syncVscodeConfigScriptConfig,
	async function main(args, xConsole) {
		xConsole.log("🔄 Syncing VS Code configuration from devcontainer.json...");

		const scopes = await EntityPackage.getAllPackages();
		xConsole.log(`📋 Generated scopes: ${scopes.join(", ")}`);

		const {
			customizations: { vscode: { extensions: recommendations = [], settings = {} } = {} } = {},
		} = JSON.parse(
			stripComments(
				await Bun.file(join(import.meta.dir, "..", ".devcontainer", "devcontainer.json")).text(),
			),
		);

		// Update settings with generated scopes
		const updatedSettings = {
			...settings,
			"conventionalCommits.scopes": scopes,
		};

		const settingsConfigString = JSON.stringify(updatedSettings, null, 2);
		const extensionsConfigString = JSON.stringify({ recommendations }, null, 2);

		if (args["dry-run"]) {
			xConsole.log("🔍 Dry run mode - showing what would be synced:");
			xConsole.log(`📦 Extensions:\n${extensionsConfigString}`);
			xConsole.log(`⚙️  Settings:\n${settingsConfigString}`);

			return;
		}

		// Update devcontainer.json with new scopes
		const devcontainerPath = join(import.meta.dir, "..", ".devcontainer", "devcontainer.json");
		const devcontainerContent = JSON.parse(stripComments(await Bun.file(devcontainerPath).text()));

		// Update the scopes in devcontainer.json
		devcontainerContent.customizations.vscode.settings["conventionalCommits.scopes"] = scopes;

		// Write back the updated devcontainer.json
		await Bun.write(devcontainerPath, JSON.stringify(devcontainerContent, null, 2));
		await $`bun run biome check --write ${devcontainerPath}`;
		xConsole.log(`✅ Updated ${devcontainerPath} with new scopes!`);

		const vscodeDir = join(import.meta.dir, "..", ".vscode");
		if (!exists(vscodeDir)) mkdir(vscodeDir, { recursive: true });
		const extensionsPath = join(vscodeDir, "extensions.json");
		const settingsPath = join(vscodeDir, "settings.json");

		await Bun.write(extensionsPath, extensionsConfigString);
		xConsole.log(`✅ Updated ${extensionsPath}!`);
		await Bun.write(settingsPath, settingsConfigString);
		xConsole.log(`✅ Updated ${settingsPath}!`);
		xConsole.log("✅ VS Code configuration synced successfully!");
	},
);

// Run if called directly
if (import.meta.main) {
	syncVscodeConfigScript.run();
}

/**
 * Strip comments from JSON content
 */
function stripComments(content: string): string {
	return content
		.replace(/\/\/[^\r\n]*/g, "")
		.replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, "")
		.replace(/^\s*[\r\n]/gm, "");
}
