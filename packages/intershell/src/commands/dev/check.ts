import { setTimeout } from "node:timers/promises";
import { Command, Flags } from "@oclif/core";
import { colorify } from "@repo/intershell/core";
import { EntityCompose, type ServiceHealth } from "@repo/intershell/entities";
import { $ } from "bun";

export default class DevCheck extends Command {
	static description = "Check the health of the DevContainer services";

	static examples = ["intershell dev:check", "intershell dev:check --keep-alive"];

	static flags = {
		"keep-alive": Flags.boolean({
			char: "s",
			description: "Keep services alive after checks complete",
			default: false,
		}),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(DevCheck);

		this.log(colorify.blue("🧪 Starting DevContainer Health Check..."));

		await $`bun run dev:up --build`;
		const compose = new EntityCompose("./docker-compose.dev.yml");
		await this.monitorServiceHealth(compose);

		this.log(colorify.blue("\n📊 Services are available at:"));
		const devUrls = await compose.getServiceUrls();
		for (const [name, url] of Object.entries(devUrls)) {
			this.log(colorify.cyan(`   • ${name}: ${url}`));
		}
		this.log(colorify.green("✅ DevContainer health check completed successfully!"));

		if (flags["keep-alive"]) {
			this.log(
				colorify.yellow("💡 Use 'intershell dev:check --keep-alive' to keep services alive"),
			);
		} else {
			this.log(colorify.yellow("🧹 Cleaning up services..."));
			await $`bun run dev:down`;
		}
	}

	private readonly icons: Record<ServiceHealth["status"], string> = {
		healthy: "✅",
		starting: "🔄",
		unhealthy: "❌",
		unknown: "❓",
	};

	private readonly colors: Record<ServiceHealth["status"], (text: string) => string> = {
		healthy: colorify.green,
		starting: colorify.yellow,
		unhealthy: colorify.red,
		unknown: colorify.gray,
	};

	private async monitorServiceHealth(compose: EntityCompose): Promise<void> {
		const services = await compose.getServices();
		this.log(colorify.yellow("⏳ Waiting for services to become healthy..."));

		const retryInterval = 5_000;
		const maxRetries = 6; // 6 * retryInterval = 30 seconds total
		let retryCount = 0;
		let allHealthy = false;

		let healthResult: ServiceHealth[] | null = null;
		while (retryCount < maxRetries && !allHealthy) {
			if (retryCount > 0) {
				this.log(
					colorify.yellow(
						`🔄 Retry ${retryCount}/${maxRetries} - Checking health again in 5 seconds...`,
					),
				);
				await setTimeout(retryInterval);
			}

			healthResult = await compose.getServiceHealth();

			if (
				healthResult.every((s) => s.status === "healthy") &&
				healthResult.length === services.length
			) {
				allHealthy = true;
			} else {
				retryCount++;
			}
		}

		// Print detailed health status
		this.log(colorify.blue("\n📊 Final Service Health Status:"));
		this.log("-".repeat(50));
		if (!healthResult) {
			throw new Error("Failed to get health status from services");
		}

		for (const service of healthResult) {
			const icon = this.icons[service.status];
			const color = this.colors[service.status];
			const port = services.find((s) => s.name === service.name)?.ports[0];
			this.log(`${icon} ${color(service.name)}: ${service.status} ${port ? `(${port})` : ""}`);
		}

		if (healthResult.some((s) => s.status === "unhealthy")) {
			throw new Error(
				`Unhealthy services after ${maxRetries} retries: ${healthResult
					.filter((s) => s.status === "unhealthy")
					.map((s) => s.name)
					.join(", ")}`,
			);
		}

		this.log(colorify.green("✅ All services are healthy"));
	}
}
