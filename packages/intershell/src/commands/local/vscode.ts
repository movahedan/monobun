import { exists, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { Command, Flags } from "@oclif/core";
import { EntityPackage } from "@repo/intershell/entities";
import { $ } from "bun";

export default class LocalVscode extends Command {
	static description =
		"Synchronize VS Code extensions and settings from devcontainer.json to .vscode/ directory";

	static examples = [
		"intershell local:vscode",
		"intershell local:vscode --dry-run",
		"intershell local:vscode --extensions-only",
		"intershell local:vscode --settings-only",
		"intershell local:vscode --quiet",
	];

	static flags = {
		"dry-run": Flags.boolean({
			description: "Show what would be synced without making changes",
			default: false,
		}),
		"extensions-only": Flags.boolean({
			description: "Only sync extensions",
			default: false,
		}),
		"settings-only": Flags.boolean({
			description: "Only sync settings",
			default: false,
		}),
		quiet: Flags.boolean({
			description: "Suppress all output except errors",
			default: false,
		}),
	};

	/**
	 * Log a message only if not in quiet mode
	 */
	private logQuiet(message: string, quiet: boolean): void {
		if (!quiet) {
			this.log(message);
		}
	}

	async run(): Promise<void> {
		const { flags } = await this.parse(LocalVscode);

		this.logQuiet("🔄 Syncing VS Code configuration from devcontainer.json...", flags.quiet);

		const scopes = await EntityPackage.getAllPackages();
		this.logQuiet(`📋 Generated scopes: ${scopes.join(", ")}`, flags.quiet);

		const {
			customizations: { vscode: { extensions: recommendations = [], settings = {} } = {} } = {},
		} = JSON.parse(
			stripComments(
				await Bun.file(join(process.cwd(), ".devcontainer", "devcontainer.json")).text(),
			),
		);

		// Update settings with generated scopes
		const updatedSettings = {
			...settings,
			"conventionalCommits.scopes": scopes,
		};

		const settingsConfigString = JSON.stringify(updatedSettings, null, 2);
		const extensionsConfigString = JSON.stringify({ recommendations }, null, 2);

		if (flags["dry-run"]) {
			this.logQuiet("🔍 Dry run mode - showing what would be synced:", flags.quiet);
			this.logQuiet(`📦 Extensions:\n${extensionsConfigString}`, flags.quiet);
			this.logQuiet(`⚙️  Settings:\n${settingsConfigString}`, flags.quiet);
			return;
		}

		// Update devcontainer.json with new scopes
		const devcontainerPath = join(process.cwd(), ".devcontainer", "devcontainer.json");
		const devcontainerContent = JSON.parse(stripComments(await Bun.file(devcontainerPath).text()));

		// Update the scopes in devcontainer.json
		devcontainerContent.customizations.vscode.settings["conventionalCommits.scopes"] = scopes;

		// Write back the updated devcontainer.json
		await Bun.write(devcontainerPath, JSON.stringify(devcontainerContent, null, 2));
		await $`bun run biome check --write ${devcontainerPath}`;
		this.logQuiet(`✅ Updated ${devcontainerPath} with new scopes!`, flags.quiet);

		const vscodeDir = join(process.cwd(), ".vscode");
		if (!(await exists(vscodeDir))) await mkdir(vscodeDir, { recursive: true });
		const extensionsPath = join(vscodeDir, "extensions.json");
		const settingsPath = join(vscodeDir, "settings.json");

		if (!flags["settings-only"]) {
			await Bun.write(extensionsPath, extensionsConfigString);
			this.logQuiet(`✅ Updated ${extensionsPath}!`, flags.quiet);
		}

		if (!flags["extensions-only"]) {
			await Bun.write(settingsPath, settingsConfigString);
			this.logQuiet(`✅ Updated ${settingsPath}!`, flags.quiet);
		}

		this.logQuiet("✅ VS Code configuration synced successfully!", flags.quiet);
	}
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
