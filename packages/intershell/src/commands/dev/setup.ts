import { Command, Flags } from "@oclif/core";
import { colorify } from "@repo/intershell/core";
import { EntityCompose } from "@repo/intershell/entities";
import { $ } from "bun";

export default class DevSetup extends Command {
	static description =
		"Setup DevContainer environment with Docker builds, service startup, and health verification";

	static examples = [
		"intershell dev:setup",
		"intershell dev:setup --skip-health-check",
		"intershell dev:setup --keep-running",
	];

	static flags = {
		"skip-health-check": Flags.boolean({
			char: "h",
			description: "Skip health check verification",
			default: false,
		}),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(DevSetup);

		this.log(colorify.blue("🐳 Starting DevContainer setup..."));

		await $`bun run dev:up --build`;
		if (!flags["skip-health-check"]) {
			this.log(colorify.blue("🏥 Running health checks..."));
			await $`bun run dev:check`;
		}

		this.log(colorify.cyan("\n💡 Services are running and available at:"));
		const compose = new EntityCompose("./docker-compose.dev.yml");
		const devUrls = await compose.getServiceUrls();
		for (const [name, url] of Object.entries(devUrls)) {
			this.log(colorify.cyan(`   • ${name}: ${url}`));
		}

		this.log(colorify.yellow("💡 Use 'bun run dev:cleanup' to stop services when done"));
		this.log(colorify.cyan("\n💡 Useful commands:"));
		this.log(colorify.cyan(" - bun run dev:check # Check DevContainer health"));
		this.log(colorify.cyan(" - bun run dev:logs # View service logs"));
		this.log(colorify.cyan(" - bun run dev:cleanup # Clean DevContainer environment"));
	}
}
