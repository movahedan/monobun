import { Command, Flags } from "@oclif/core";
import { colorify } from "@repo/intershell/core";
import { $ } from "bun";

export default class DevRm extends Command {
	static description = `Stop and remove the VS Code DevContainer itself.
⚠️  WARNING: This script must be run from the HOST machine, not from within the DevContainer.
This will stop the VS Code DevContainer and all associated containers.`;

	static examples = ["intershell dev:rm", "intershell dev:rm --force"];

	static flags = {
		force: Flags.boolean({
			char: "f",
			description: "Force removal without confirmation",
			default: false,
		}),
	};

	async run(): Promise<void> {
		await this.parse(DevRm);

		this.log(colorify.blue("🐳 Stopping VS Code DevContainer..."));

		// Check if we're in a DevContainer
		const isInDevContainer = process.env.REMOTE_CONTAINERS === "true";
		if (isInDevContainer) {
			this.error(
				colorify.red(
					"❌ ERROR: This script must be run from the HOST machine, not from within the DevContainer.",
				),
			);
			this.log(
				colorify.yellow(
					"💡 Please exit the DevContainer and run this command from your host terminal.",
				),
			);
			process.exit(1);
		}

		await this.stepStopDevContainer();
		await this.stepStopRemoveAllContainers();

		this.log(colorify.green("✅ DevContainer removal completed successfully!"));
		this.log(colorify.cyan("\n💡 To start fresh, run:"));
		this.log(colorify.cyan("  - intershell local:setup # For local development"));
		this.log(colorify.cyan("  - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) "));
		this.log(colorify.cyan("  -Type 'Dev Containers: Reopen in Container' and select the command"));
		this.log(colorify.cyan("  - intershell dev:setup # For DevContainer development"));
	}

	private async stepStopDevContainer(): Promise<void> {
		this.log(colorify.yellow("🛑 Stopping VS Code DevContainer..."));
		// Stop the DevContainer using VS Code CLI
		await $`code --command "devcontainers.stop"`.nothrow();
	}

	private async stepStopRemoveAllContainers(): Promise<void> {
		this.log(colorify.yellow("🐳 Stopping all related containers..."));
		await $`docker compose -f ./docker-compose.dev.yml --profile all down --volumes --remove-orphans`;
		await $`docker compose -f docker-compose.yml down --volumes --remove-orphans`;
		this.log(colorify.yellow("🗑️ Removing containers..."));
		await $`docker compose -f ./docker-compose.dev.yml --profile all rm -f --volumes`;
		await $`docker compose -f docker-compose.yml rm -f --volumes`;
	}
}
