import path from "node:path";

import { getPlainComposeSpawnEnv } from "../shared/compose-plain-progress";

export type ContainerStack = "dev" | "prod";

let currentStack: ContainerStack = "dev";

export function setContainerStack(stack: ContainerStack): void {
	currentStack = stack;
}

export function getContainerStack(): ContainerStack {
	return currentStack;
}

export const PROD_COMPOSE_PROJECT_NAME = "repo-prod";
export const DEV_COMPOSE_FILE = "./docker-compose.dev.yml";
export const PROD_COMPOSE_FILE = "./docker-compose.yml";

export function getComposeFilePath(): string {
	return getContainerStack() === "prod" ? PROD_COMPOSE_FILE : DEV_COMPOSE_FILE;
}

export function getComposeSpawnEnv(): NodeJS.ProcessEnv {
	const base =
		getContainerStack() === "prod"
			? { ...process.env, COMPOSE_PROJECT_NAME: PROD_COMPOSE_PROJECT_NAME }
			: { ...process.env };
	return getPlainComposeSpawnEnv(base);
}

export function getComposePrefix(): readonly string[] {
	if (getContainerStack() === "prod") {
		return ["docker", "compose", "-f", PROD_COMPOSE_FILE] as const;
	}
	return ["docker", "compose", "-f", DEV_COMPOSE_FILE, "--profile", "all"] as const;
}

function argvContainerIndex(subcommandArgs: readonly string[]): string[] {
	const script = path.join(import.meta.dir, "index.tsx");
	const prod = getContainerStack() === "prod";
	return ["bun", script, ...(prod ? (["--prod"] as const) : []), ...subcommandArgs];
}

export async function spawnContainerIndex(subcommandArgs: readonly string[]): Promise<number> {
	const proc = Bun.spawn(argvContainerIndex(subcommandArgs), {
		stdio: ["inherit", "inherit", "inherit"],
		cwd: process.cwd(),
		env: getComposeSpawnEnv(),
	});
	return await proc.exited;
}
