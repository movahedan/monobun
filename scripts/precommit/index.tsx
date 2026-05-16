#!/usr/bin/env bun
import { printCliErrorAndExit } from "../format-cli-error";
import { runCommitCheck } from "./run";

async function main(): Promise<void> {
	const rest = Bun.argv.slice(2);
	await runCommitCheck(rest);
}

void main().catch(printCliErrorAndExit);
