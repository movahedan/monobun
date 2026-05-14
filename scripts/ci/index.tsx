#!/usr/bin/env bun
import { runCiAttachAffected } from "./attach-affected";
import { runCiAttachServicePorts } from "./attach-service-ports";
import { printHelpAndExit } from "./help";

const CI_SUBCOMMANDS = ["attach-affected", "attach-service-ports"] as const;
type CiSubcommand = (typeof CI_SUBCOMMANDS)[number];

function isCiSubcommand(value: string | undefined): value is CiSubcommand {
	return value !== undefined && (CI_SUBCOMMANDS as readonly string[]).includes(value);
}

async function main(): Promise<void> {
	const argv = Bun.argv.slice(2);
	const sub = argv[0];
	const rest = argv.slice(1);

	if (!isCiSubcommand(sub)) {
		await printHelpAndExit(sub === undefined ? undefined : `Unknown command: ${sub}`);
	}

	if (sub === "attach-affected") {
		await runCiAttachAffected(rest);
		return;
	}

	await runCiAttachServicePorts(rest);
}

void main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
