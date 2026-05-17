import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { MAX_REL_PATH_FOR_REGEX } from "../shared/match-files-by-pattern";
import { buildExportsWithPattern } from "./build-exports-with-pattern";
import { compilePathRegex } from "./compile-path-regex";

describe("buildExportsWithPattern", () => {
	let packageDir: string;
	let srcDir: string;

	beforeEach(async () => {
		packageDir = await mkdtemp(path.join(tmpdir(), "export-modules-with-"));
		srcDir = path.join(packageDir, "src");
		await mkdir(srcDir, { recursive: true });
	});

	afterEach(async () => {
		await rm(packageDir, { recursive: true, force: true });
	});

	it("maps component folder pattern to ./dirname", async () => {
		const cardFile = path.join(srcDir, "card", "card.tsx");
		await mkdir(path.dirname(cardFile), { recursive: true });
		await writeFile(cardFile, "export {};\n");

		const regex = compilePathRegex(String.raw`^src/([^/]+)/\1\.tsx$`, "");
		const exports = buildExportsWithPattern([cardFile], packageDir, srcDir, regex);

		expect(exports).toEqual({
			"./card": "./src/card/card.tsx",
		});
	});

	it("maps root css pattern to ./filename.css", async () => {
		const styleFile = path.join(srcDir, "style.css");
		await writeFile(styleFile, "body {}\n");

		const regex = compilePathRegex(String.raw`^src/([^/]+\.css)$`, "");
		const exports = buildExportsWithPattern([styleFile], packageDir, srcDir, regex);

		expect(exports).toEqual({
			"./style.css": "./src/style.css",
		});
	});

	it("maps nested css pattern to ./dir/name", async () => {
		const globalsFile = path.join(srcDir, "styles", "globals.css");
		await mkdir(path.dirname(globalsFile), { recursive: true });
		await writeFile(globalsFile, "body {}\n");

		const regex = compilePathRegex(String.raw`^src/([^/]+/[^/]+)\.css$`, "");
		const exports = buildExportsWithPattern([globalsFile], packageDir, srcDir, regex);

		expect(exports).toEqual({
			"./styles/globals": "./src/styles/globals.css",
		});
	});

	it("ignores files that do not match the pattern", async () => {
		const cardFile = path.join(srcDir, "card", "card.tsx");
		await mkdir(path.dirname(cardFile), { recursive: true });
		await writeFile(cardFile, "export {};\n");

		const regex = compilePathRegex(String.raw`^src/([^/]+\.css)$`, "");
		const exports = buildExportsWithPattern([cardFile], packageDir, srcDir, regex);

		expect(exports).toEqual({});
	});

	it("warns when duplicate export keys resolve to different paths", () => {
		const warnSpy = spyOn(console, "warn").mockImplementation(() => {});

		const fooTs = path.join(srcDir, "foo.ts");
		const fooTsx = path.join(srcDir, "foo.tsx");
		const regex = /^src\/([^/]+)\.(ts|tsx)$/;

		const exports = buildExportsWithPattern([fooTs, fooTsx], packageDir, srcDir, regex);

		expect(exports).toEqual({
			"./foo": "./src/foo.tsx",
		});
		expect(warnSpy).toHaveBeenCalled();
		const warnMessage = String(warnSpy.mock.calls[0]?.[0]);
		expect(warnMessage).toContain("Duplicate export keys");
		expect(warnMessage).toContain("./foo");

		warnSpy.mockRestore();
	});

	it("throws when relative path exceeds max length", () => {
		const longSegment = "a".repeat(MAX_REL_PATH_FOR_REGEX);
		const longFile = path.join(srcDir, longSegment, "card.tsx");

		const regex = compilePathRegex(String.raw`^src/([^/]+)/\1\.tsx$`, "");

		expect(() => buildExportsWithPattern([longFile], packageDir, srcDir, regex)).toThrow(
			/Path relative to package exceeds max length/,
		);
	});
});
