#!/usr/bin/env bun
import { parseArgs } from "node:util";

import { printCliErrorAndExit } from "../shared/format-cli-error";
import { printOverallHelpAndExit } from "./help";
import { runOverall } from "./run";

async function main(): Promise<void> {
	const argv = Bun.argv.slice(2);

	try {
		const { values, positionals } = parseArgs({
			args: [...argv],
			options: {
				quiet: { type: "boolean", short: "q", default: false },
				help: { type: "boolean", short: "h", default: false },
			},
			allowPositionals: true,
			strict: true,
		});

		if (positionals.length > 0) {
			await printOverallHelpAndExit(`Unexpected arguments: ${positionals.join(" ")}`);
		}

		if (values.help === true) {
			await printOverallHelpAndExit();
		}

		await runOverall({ quiet: values.quiet === true });
	} catch (error) {
		printOverallHelpAndExit(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

void main().catch(printCliErrorAndExit);
