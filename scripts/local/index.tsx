#!/usr/bin/env bun
import { runLocalCleanup } from "./cleanup";
import { printHelpAndExit } from "./help";
import { runLocalSetup } from "./setup";
import { runLocalVscodeCli } from "./vscode";

const LOCAL_SUBCOMMANDS = ["setup", "cleanup", "vscode"] as const;
type LocalSubcommand = (typeof LOCAL_SUBCOMMANDS)[number];

function isLocalSubcommand(value: string | undefined): value is LocalSubcommand {
	return value !== undefined && (LOCAL_SUBCOMMANDS as readonly string[]).includes(value);
}

async function main(): Promise<void> {
	const argv = Bun.argv.slice(2);
	const sub = argv[0];
	const rest = argv.slice(1);

	if (!isLocalSubcommand(sub)) {
		await printHelpAndExit(sub === undefined ? undefined : `Unknown command: ${sub}`);
	}

	if (sub === "setup") {
		await runLocalSetup(rest);
		return;
	}

	if (sub === "cleanup") {
		await runLocalCleanup();
		return;
	}

	await runLocalVscodeCli(rest);
}

void main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
