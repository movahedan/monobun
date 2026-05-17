import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import type { Dirent } from "node:fs";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { buildExportsWithoutPattern } from "./build-exports-without-pattern";
import { toSourceExport } from "./source-export";

function createDirent(name: string, kind: "directory" | "file"): Dirent {
	return {
		name,
		isDirectory: () => kind === "directory",
		isFile: () => kind === "file",
	} as Dirent;
}

describe("buildExportsWithoutPattern", () => {
	let packageDir: string;
	let srcDir: string;

	beforeEach(async () => {
		packageDir = await mkdtemp(path.join(tmpdir(), "export-modules-without-"));
		srcDir = path.join(packageDir, "src");
		await mkdir(srcDir, { recursive: true });
	});

	afterEach(async () => {
		await rm(packageDir, { recursive: true, force: true });
	});

	it("exports directory index.ts barrel as ./dirname", async () => {
		const atomsDir = path.join(srcDir, "atoms");
		await mkdir(atomsDir);
		await writeFile(path.join(atomsDir, "index.ts"), "export {};\n");

		const exports = await buildExportsWithoutPattern(
			[createDirent("atoms", "directory")],
			srcDir,
			packageDir,
		);

		expect(exports).toEqual({
			"./atoms": toSourceExport("./src/atoms/index.ts"),
		});
	});

	it("exports directory index.tsx when index.ts is missing", async () => {
		const hooksDir = path.join(srcDir, "hooks");
		await mkdir(hooksDir);
		await writeFile(path.join(hooksDir, "index.tsx"), "export {};\n");

		const exports = await buildExportsWithoutPattern(
			[createDirent("hooks", "directory")],
			srcDir,
			packageDir,
		);

		expect(exports).toEqual({
			"./hooks": toSourceExport("./src/hooks/index.tsx"),
		});
	});

	it("exports same-named component file when index is missing", async () => {
		const cardDir = path.join(srcDir, "card");
		await mkdir(cardDir);
		await writeFile(path.join(cardDir, "card.tsx"), "export {};\n");

		const exports = await buildExportsWithoutPattern(
			[createDirent("card", "directory")],
			srcDir,
			packageDir,
		);

		expect(exports).toEqual({
			"./card": toSourceExport("./src/card/card.tsx"),
		});
	});

	it("exports src/index.ts as package root", async () => {
		await writeFile(path.join(srcDir, "index.ts"), "export {};\n");

		const exports = await buildExportsWithoutPattern(
			[createDirent("index.ts", "file")],
			srcDir,
			packageDir,
		);

		expect(exports).toEqual({
			".": toSourceExport("./src/index.ts"),
		});
	});

	it("skips directories without a resolvable entry", async () => {
		await mkdir(path.join(srcDir, "empty"));

		const exports = await buildExportsWithoutPattern(
			[createDirent("empty", "directory")],
			srcDir,
			packageDir,
		);

		expect(exports).toEqual({});
	});

	it("skips non-typescript files at src root", async () => {
		await writeFile(path.join(srcDir, "style.css"), "body {}\n");

		const exports = await buildExportsWithoutPattern(
			[createDirent("style.css", "file")],
			srcDir,
			packageDir,
		);

		expect(exports).toEqual({});
	});
});
