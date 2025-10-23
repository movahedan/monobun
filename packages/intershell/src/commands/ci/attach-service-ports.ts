import { Command, Flags } from "@oclif/core";
import { EntityCompose } from "@repo/intershell/entities";

export default class CiAttachServicePorts extends Command {
	static description = "Attach service ports to GitHub Actions";

	static examples = ["intershell ci:attach-service-ports -o service-ports"];

	static flags = {
		"output-id": Flags.string({
			char: "o",
			description: "The ID of the output to attach the affected packages to",
			required: true,
		}),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(CiAttachServicePorts);

		const outputId = flags["output-id"];

		const portMappings = await new EntityCompose("docker-compose.yml").getPortMappings();

		// Output in GitHub Actions format
		if (process.env.GITHUB_OUTPUT) {
			const output = `${outputId}<<EOF\n${JSON.stringify(portMappings)}\nEOF\n`;
			await Bun.write(process.env.GITHUB_OUTPUT, output);
			this.log(`\nAttached: ${outputId}=${JSON.stringify(portMappings)}\n`);
		}
	}
}
