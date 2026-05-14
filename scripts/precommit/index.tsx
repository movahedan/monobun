#!/usr/bin/env bun
import { runCommitCheck } from "./run";

async function main(): Promise<void> {
	const rest = Bun.argv.slice(2);
	await runCommitCheck(rest);
}

void main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
