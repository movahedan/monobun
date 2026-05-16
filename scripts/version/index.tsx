#!/usr/bin/env bun
import { printCliErrorAndExit } from "../format-cli-error";
import { runVersionApply } from "./apply";
import { runVersionCi } from "./ci";
import { isVersionSubcommand, printVersionHelpAndExit } from "./help";
import { runVersionPrepare } from "./prepare";

async function main(): Promise<void> {
	const argv = Bun.argv.slice(2);
	const sub = argv[0];
	const rest = argv.slice(1);

	if (!isVersionSubcommand(sub)) {
		await printVersionHelpAndExit(sub === undefined ? undefined : `Unknown command: ${sub}`);
	}

	if (sub === "prepare") {
		await runVersionPrepare(rest);
		return;
	}

	if (sub === "apply") {
		await runVersionApply(rest);
		return;
	}

	await runVersionCi(rest);
}

void main().catch(printCliErrorAndExit);
