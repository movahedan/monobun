import { Command, Flags } from "@oclif/core";
import { colorify } from "@repo/intershell/core";
import { $ } from "bun";

export default class LocalCleanup extends Command {
	static description =
		"Comprehensive cleanup of Docker containers, build artifacts, and development files. This includes DevContainer cleanup. To stop the VS Code DevContainer itself, run `bun run dev:rm` from host machine";

	static examples = ["intershell local:cleanup", "intershell local:cleanup --verbose"];

	static flags = {
		verbose: Flags.boolean({
			char: "v",
			description: "Enable verbose output",
			default: false,
		}),
	};

	private readonly directories = [
		"dist",
		"build",
		"dist",
		"dist-storybook",
		".turbo",
		".next",
		".output",
		"coverage",
		".nyc_output",
		".cache",
		".parcel-cache",
		".vite",
		".swc",
		".act",
		".biomecache",
		"bin",
	];

	private readonly files = [
		".act-event.json",
		"*.tsbuildinfo",
		".log",
		".tmp",
		".temp",
		".DS_Store",
		"Thumbs.db",
	];

	async run(): Promise<void> {
		await this.parse(LocalCleanup);

		this.log(colorify.blue("🧹 Starting comprehensive cleanup..."));

		this.log(colorify.yellow("🗂️ Cleaning development artifacts..."));
		for (const directory of this.directories) {
			await $`rm -rf ${directory} **/${directory} **/${directory}/**`.quiet().nothrow();
		}

		this.log(colorify.yellow("📝 Cleaning logs and temp files..."));
		for (const file of this.files) {
			await $`rm -rf ${file} **/${file}`.quiet().nothrow();
		}

		this.log(colorify.yellow("📦 Cleaning node_modules in directories..."));
		await $`rm -rf node_modules **/node_modules`.quiet().nothrow();

		this.log(colorify.yellow("🎯 Cleaning VS Code configuration..."));
		await $`rm -rf .vscode`.quiet().nothrow();

		this.log(colorify.green("✅ Cleanup completed successfully!"));
		this.log(colorify.cyan("\n💡 To start fresh, run:"));
		this.log(colorify.cyan("  - intershell local:setup # For local development"));
		this.log(colorify.cyan("  - intershell dev:setup # For DevContainer development"));
	}
}
