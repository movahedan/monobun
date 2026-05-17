#!/usr/bin/env bun
import { parseArgs } from "node:util";

import { printCliErrorAndExit } from "../shared/format-cli-error";
import { printNukeHelpAndExit } from "./help";
import { runNuke } from "./run";

async function main(): Promise<void> {
	const argv = Bun.argv.slice(2);

	try {
		const { values, positionals } = parseArgs({
			args: [...argv],
			options: {
				quiet: { type: "boolean", short: "q", default: false },
				"skip-tests": { type: "boolean", short: "t", default: false },
				help: { type: "boolean", short: "h", default: false },
			},
			allowPositionals: true,
			strict: true,
		});

		if (positionals.length > 0) {
			await printNukeHelpAndExit(`Unexpected arguments: ${positionals.join(" ")}`);
		}

		if (values.help === true) {
			await printNukeHelpAndExit();
		}

		await runNuke({
			quiet: values.quiet === true,
			skipTests: values["skip-tests"] === true,
		});
	} catch (error) {
		printNukeHelpAndExit(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

void main().catch(printCliErrorAndExit);
