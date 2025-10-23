import { Command, Flags } from "@oclif/core";
import { $ } from "bun";

export default class CiAct extends Command {
	static description =
		"Uses catthehacker/ubuntu:act-latest image which has unzip available for Bun setup";

	static examples = [
		"intershell ci:act -v --verbose -e pull_request -w .github/workflows/Check.yml",
		"intershell ci:act --event push --workflow .github/workflows/Build.yml",
		"intershell ci:act --event release --workflow .github/workflows/Deploy.yml",
		"intershell ci:act --event workflow_run --workflow .github/workflows/Check.yml",
	];

	static flags = {
		event: Flags.string({
			char: "e",
			description: "GitHub event to simulate (e.g., pull_request, push)",
			required: true,
			options: ["pull_request", "push", "release", "workflow_dispatch", "workflow_run"],
		}),
		workflow: Flags.string({
			char: "w",
			description: "Workflow file to test (e.g., .github/workflows/Check.yml)",
			required: true,
		}),
		verbose: Flags.boolean({
			char: "v",
			description: "Enable verbose output",
			default: false,
		}),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(CiAct);

		this.log(`📋 on: ${flags.event} at: ${flags.workflow} \n`);

		try {
			await $`act ${flags.event} -W ${flags.workflow} -P ubuntu-latest=catthehacker/ubuntu:act-latest --quiet`;
			if (flags.verbose) {
				this.log("✅ Success with catthehacker/ubuntu:act-latest image!");
			}
		} catch (error) {
			this.error(`❌ Act test failed: ${error}`);
		} finally {
			await this.cleanupActContainers();
		}

		this.log("✅ GitHub Actions test completed!");
	}

	private async cleanupActContainers(): Promise<void> {
		try {
			this.log("\n🧹 Cleaning up act containers...");

			try {
				// Check if any act containers exist before trying to stop them
				const runningContainers = await $`docker ps -q --filter "label=com.act.container"`.text();
				if (runningContainers.trim()) {
					await $`docker ps -q --filter "label=com.act.container" | xargs -r docker stop`;
					this.log("✅ Stopped running act containers");
				}
			} catch (error) {
				console.warn("⚠️  Warning: act containers do not exist:", error);
			}

			try {
				// Remove all act containers (including stopped ones)
				const allContainers = await $`docker ps -aq --filter "label=com.act.container"`.text();
				if (allContainers.trim()) {
					await $`docker ps -aq --filter "label=com.act.container" | xargs -r docker rm`;
					this.log("✅ Removed act containers");
				}
			} catch (error) {
				console.warn("⚠️  Warning: act containers may not have been cleaned up:", error);
			}

			try {
				// Remove act networks
				const networks = await $`docker network ls -q --filter "label=com.act.network"`.text();
				if (networks.trim()) {
					await $`docker network ls -q --filter "label=com.act.network" | xargs -r docker network rm`;
					this.log("✅ Removed act networks");
				}
			} catch (error) {
				console.warn("⚠️  Warning: act networks do not exist:", error);
			}

			this.log("✅ Act containers cleaned up successfully!");
		} catch (error) {
			console.warn("⚠️  Warning: Some containers may not have been cleaned up:", error);
		}
	}
}
