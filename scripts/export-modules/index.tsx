#!/usr/bin/env bun
import { printHelpAndExit } from "./help";
import { runExportModules } from "./update";

const EXPORT_MODULES_SUBCOMMANDS = ["update"] as const;
type ExportModulesSubcommand = (typeof EXPORT_MODULES_SUBCOMMANDS)[number];

function isExportModulesSubcommand(value: string | undefined): value is ExportModulesSubcommand {
	return value !== undefined && (EXPORT_MODULES_SUBCOMMANDS as readonly string[]).includes(value);
}

async function main(): Promise<void> {
	const argv = Bun.argv.slice(2);
	const sub = argv[0];
	const rest = argv.slice(1);

	if (!isExportModulesSubcommand(sub)) {
		await printHelpAndExit(sub === undefined ? undefined : `Unknown command: ${sub}`);
	}

	await runExportModules(rest);
}

void main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
