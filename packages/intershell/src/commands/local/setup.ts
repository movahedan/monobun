import { Command, Flags } from "@oclif/core";
import { colorify } from "@repo/intershell/core";
import { $ } from "bun";

export default class LocalSetup extends Command {
	static description =
		"Complete local development environment setup with dependency installation, local builds, and VS Code configuration sync";

	static examples = [
		"intershell local:setup",
		"intershell local:setup --skip-vscode",
		"intershell local:setup --skip-tests",
	];

	static flags = {
		"skip-vscode": Flags.boolean({
			char: "v",
			description: "Skip VS Code configuration sync",
			default: false,
		}),
		"skip-tests": Flags.boolean({
			char: "t",
			description: "Skip running tests",
			default: false,
		}),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(LocalSetup);

		this.log(colorify.blue("🚀 Starting local development setup..."));

		// Step 1: Install dependencies
		this.log(colorify.blue("📦 Installing dependencies..."));
		await $`bun install`;

		// Step 2: Run code quality checks
		this.log(colorify.blue("🔍 Running code quality checks..."));
		await $`bun run check:fix`;

		// Step 3: Type checking
		this.log(colorify.blue("🔍 Running type checks..."));
		await $`bun run check:types`;

		// Step 4: Run tests (unless skipped)
		if (!flags["skip-tests"]) {
			this.log(colorify.blue("🧪 Running tests..."));
			await $`bun run test`;
		}

		// Step 5: Build all packages
		this.log(colorify.blue("🏗️ Building all packages..."));
		await $`bun run build`;

		// Step 6: Sync VS Code configuration (unless skipped)
		if (!flags["skip-vscode"]) {
			this.log(colorify.blue("🎯 Syncing VS Code configuration..."));
			await $`bun run local:vscode`;
		}

		this.log(colorify.green("✅ Local setup completed successfully!"));

		this.log(colorify.cyan("\n💡 Useful commands:"));
		this.log(colorify.cyan(" - bun run check:quick # Quick verification"));
		this.log(colorify.cyan(" - intershell dev:setup # Setup DevContainer environment"));
		this.log(colorify.cyan(" - intershell local:cleanup # Clean everything"));
	}
}
