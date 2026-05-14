#!/usr/bin/env bun
import { runCheck } from "./check";
import { runCleanup } from "./cleanup";
import { printHelpAndExit } from "./help";
import { runRm } from "./rm";
import { runSetup } from "./setup";
import {
	getComposeFilePath,
	getComposePrefix,
	getComposeSpawnEnv,
	setContainerStack,
} from "./stack";

const PS_FORMAT = "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}";

const SUBCOMMANDS = [
	"setup",
	"check",
	"cleanup",
	"rm",
	"up",
	"down",
	"build",
	"compose",
	"logs",
	"health",
] as const;
type Subcommand = (typeof SUBCOMMANDS)[number];

function isSubcommand(value: string | undefined): value is Subcommand {
	return value !== undefined && (SUBCOMMANDS as readonly string[]).includes(value);
}

function parseGlobalFlags(argv: readonly string[]): {
	readonly prod: boolean;
	readonly rest: string[];
} {
	let prod = false;
	const rest: string[] = [];
	for (const a of argv) {
		if (a === "--prod") {
			prod = true;
		} else {
			rest.push(a);
		}
	}
	return { prod, rest };
}

async function spawnComposeExit(argv: readonly string[]): Promise<never> {
	const proc = Bun.spawn([...argv], {
		stdio: ["inherit", "inherit", "inherit"],
		cwd: process.cwd(),
		env: getComposeSpawnEnv(),
	});
	process.exit(await proc.exited);
}

async function main(): Promise<void> {
	const { prod, rest } = parseGlobalFlags(Bun.argv.slice(2));
	setContainerStack(prod ? "prod" : "dev");
	const sub = rest[0];
	const subRest = rest.slice(1);

	if (!isSubcommand(sub)) {
		await printHelpAndExit(sub === undefined ? undefined : `Unknown command: ${sub}`);
	}

	if (sub === "setup") {
		await runSetup(subRest);
		return;
	}

	if (sub === "check") {
		await runCheck(subRest);
		return;
	}

	if (sub === "cleanup") {
		await runCleanup(subRest);
		return;
	}

	if (sub === "compose") {
		await spawnComposeExit(["docker", "compose", "-f", getComposeFilePath(), ...subRest]);
	}

	if (sub === "health") {
		await spawnComposeExit([
			"docker",
			"compose",
			"-f",
			getComposeFilePath(),
			"ps",
			"--format",
			PS_FORMAT,
		]);
	}

	if (sub === "up") {
		await spawnComposeExit([...getComposePrefix(), "up", "-d", ...subRest]);
	}

	if (sub === "down") {
		await spawnComposeExit([...getComposePrefix(), "down", "--remove-orphans", ...subRest]);
	}

	if (sub === "logs") {
		await spawnComposeExit(["docker", "compose", "-f", getComposeFilePath(), "logs", ...subRest]);
	}

	if (sub === "build") {
		await spawnComposeExit([...getComposePrefix(), "build", ...subRest]);
	}

	await runRm(subRest);
}

void main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
