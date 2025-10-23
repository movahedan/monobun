import { Command, Flags } from "@oclif/core";
import { colorify } from "@repo/intershell/core";
import { $ } from "bun";

export default class DevCleanup extends Command {
	static description = `Clean up DevContainer services and development artifacts.
This only cleans up the development services, not the VS Code DevContainer itself.
To stop the VS Code DevContainer, run \`bun run dev:rm\` from the host machine.`;

	static examples = ["intershell dev:cleanup", "intershell dev:cleanup --verbose"];

	static flags = {
		verbose: Flags.boolean({
			char: "v",
			description: "Enable verbose output",
			default: false,
		}),
	};

	async run(): Promise<void> {
		await this.parse(DevCleanup);

		this.log(colorify.blue("🧹 Starting DevContainer cleanup..."));

		this.log(colorify.yellow("🐳 Stopping DevContainer services..."));
		await $`docker compose -f ./docker-compose.dev.yml --profile all down --volumes`;
		await $`docker compose -f ./docker-compose.dev.yml --profile all rm -f --volumes`;

		this.log(colorify.green("✅ DevContainer cleanup completed successfully!"));
		this.log(colorify.cyan("\n💡 To start fresh on devcontainer, run:"));
		this.log(colorify.cyan("  - intershell dev:setup"));
		this.log(colorify.cyan("  - intershell dev:rm # To stop VS Code DevContainer (host only)"));
	}
}
