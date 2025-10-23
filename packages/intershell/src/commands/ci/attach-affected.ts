import { Command, Flags } from "@oclif/core";
import { EntityAffected, EntityCompose } from "@repo/intershell/entities";

export default class CiAttachAffected extends Command {
	static description = "Attach affected services to GitHub Actions";

	static examples = ["intershell ci:attach-affected -o affected-services -m docker"];

	static flags = {
		"output-id": Flags.string({
			char: "o",
			description: "The ID of the output to attach the affected packages to",
			required: true,
		}),
		mode: Flags.string({
			char: "m",
			description: "The mode to use for the affected services",
			required: true,
			options: ["docker", "turbo"],
		}),
		"base-sha": Flags.string({
			char: "b",
			description: "The base SHA to compare against (defaults to latest tag)",
		}),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(CiAttachAffected);

		const mode = flags.mode;
		const outputId = flags["output-id"];

		if (mode === "docker") {
			this.log("🐳 Using docker output mode");
		} else {
			this.log("🚀 Using turbo output mode");
		}

		let baseSha = flags["base-sha"];
		if (!baseSha) {
			const eventName = process.env.GITHUB_EVENT_NAME;
			const isPR = eventName === "pull_request";

			if (isPR) {
				// Try multiple sources for base SHA
				baseSha = process.env.GITHUB_BASE_SHA;

				// If GITHUB_BASE_SHA is not available, try to get it from GitHub context
				if (!baseSha && process.env.GITHUB_EVENT_PATH) {
					try {
						const eventData = JSON.parse(await Bun.file(process.env.GITHUB_EVENT_PATH).text());
						baseSha = eventData.pull_request?.base?.sha;
						this.log(`🔍 Got base SHA from GitHub context: ${baseSha}`);
					} catch (error) {
						this.log(`🔍 Failed to read GitHub context: ${error}`);
					}
				}

				if (baseSha) {
					this.log(`🔍 PR detected, using base branch: ${baseSha}`);
				} else {
					this.log("🔍 PR detected, but base SHA not available from any source, using HEAD~1");
					baseSha = "HEAD~1";
				}
			} else {
				baseSha = process.env.GITHUB_BEFORE_SHA || "HEAD~1";
				this.log(`🔍 Push detected, using base SHA: ${baseSha}`);
			}
		} else {
			this.log(`🔍 Using provided base SHA: ${baseSha}`);
		}

		this.log(`🔍 Comparing changes from ${baseSha} to HEAD`);
		const affectedList =
			mode === "docker"
				? await new EntityCompose("docker-compose.yml").getAffectedServices(baseSha)
				: await EntityAffected.getAffectedPackages(baseSha);
		this.log(`🔍 Found ${affectedList.length} affected items`);

		const affectedServicesNames = affectedList
			.map((i) => (mode === "docker" ? (typeof i !== "string" ? i.name : i) : `--filter="${i}"`))
			.join(" ");

		// Output in GitHub Actions format
		if (process.env.GITHUB_OUTPUT) {
			const output = `${outputId}<<EOF\n${affectedServicesNames}\nEOF\n`;
			await Bun.write(process.env.GITHUB_OUTPUT, output);
			this.log(`\nAttached: ${outputId}=${affectedServicesNames}\n`);
		}
	}
}
