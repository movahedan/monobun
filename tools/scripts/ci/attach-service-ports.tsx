import { parseArgs } from "node:util";

import { EntityCompose } from "intershell";

function logVerbose(message: string, quiet: boolean): void {
	if (!quiet) {
		console.log(message);
	}
}

export async function runCiAttachServicePorts(rest: readonly string[]): Promise<void> {
	const { values } = parseArgs({
		args: [...rest],
		options: {
			"output-id": { type: "string", short: "o" },
			quiet: { type: "boolean", short: "q", default: false },
		},
		strict: true,
	});

	const outputId = values["output-id"];
	if (outputId === undefined || outputId === "") {
		console.error("Missing required flag: --output-id (-o)");
		process.exit(1);
	}

	const quiet = values.quiet === true;
	const portMappings = await new EntityCompose("docker-compose.yml").getPortMappings();
	const githubOutput = process.env.GITHUB_OUTPUT;

	if (githubOutput) {
		const output = `${outputId}<<EOF\n${JSON.stringify(portMappings)}\nEOF\n`;
		await Bun.write(githubOutput, output);
		logVerbose(`Attached: ${outputId}=${JSON.stringify(portMappings)}`, quiet);
	}
}
