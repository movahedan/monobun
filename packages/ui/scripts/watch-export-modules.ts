#!/usr/bin/env bun
import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { $ } from "bun";

const SKIP_NAME = /\.(test|spec)\.[tj]sx?$|\.stories\.[tj]sx?$/;

function walkSourceFiles(dir: string): string[] {
	const out: string[] = [];
	for (const ent of readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, ent.name);
		if (ent.isDirectory()) {
			out.push(...walkSourceFiles(full));
			continue;
		}
		if (!ent.isFile()) continue;
		if (SKIP_NAME.test(ent.name)) continue;
		if (ent.name.endsWith(".d.ts")) continue;
		if (ent.name.endsWith(".ts") || ent.name.endsWith(".tsx")) {
			out.push(full);
		}
	}
	return out;
}

const srcRoot = path.join(import.meta.dir, "..", "src");

void (async (): Promise<void> => {
	for (const file of walkSourceFiles(srcRoot)) {
		await import(pathToFileURL(file).href);
	}
	await $`bun run prebuild`;
})();
