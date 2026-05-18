#!/usr/bin/env bun
import path from "node:path";
import { fileURLToPath } from "node:url";

import { printCliErrorAndExit } from "../shared/format-cli-error";

/** Monorepo root — intershell compose must resolve workspaces from here, not tools/scripts. */
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
process.chdir(REPO_ROOT);

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
		const { printHelpAndExit } = await import("./help");
		await printHelpAndExit(sub === undefined ? undefined : `Unknown command: ${sub}`);
	}

	if (sub === "attach-affected") {
		const { runCiAttachAffected } = await import("./attach-affected");
		await runCiAttachAffected(rest);
		return;
	}

	const { runCiAttachServicePorts } = await import("./attach-service-ports");
	await runCiAttachServicePorts(rest);
}

void main().catch(printCliErrorAndExit);
