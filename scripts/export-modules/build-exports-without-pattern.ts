import type { Dirent } from "node:fs";
import path from "node:path";

export async function buildExportsWithoutPattern(
	files: readonly Dirent[],
	srcDir: string,
	packageDir: string,
): Promise<Record<string, string>> {
	const newExports: Record<string, string> = {};

	for (const file of files) {
		if (file.isDirectory()) {
			const indexFile = path.join(srcDir, file.name, "index.ts");
			const indexTsxFile = path.join(srcDir, file.name, "index.tsx");
			const sameNameFile = path.join(srcDir, file.name, `${file.name}.ts`);
			const sameNameTsxFile = path.join(srcDir, file.name, `${file.name}.tsx`);

			if (await Bun.file(indexFile).exists()) {
				newExports[`./${file.name}`] = `./${path.relative(packageDir, indexFile)}`;
			} else if (await Bun.file(indexTsxFile).exists()) {
				newExports[`./${file.name}`] = `./${path.relative(packageDir, indexTsxFile)}`;
			} else if (await Bun.file(sameNameFile).exists()) {
				newExports[`./${file.name}`] = `./${path.relative(packageDir, sameNameFile)}`;
			} else if (await Bun.file(sameNameTsxFile).exists()) {
				newExports[`./${file.name}`] = `./${path.relative(packageDir, sameNameTsxFile)}`;
			}

			continue;
		}

		const shouldSkip = !file.name.endsWith(".ts") && !file.name.endsWith(".tsx");
		if (shouldSkip) continue;

		if (file.name === "index.ts") {
			newExports["."] = "./index.ts";
			continue;
		}

		const mainFile = path.join(srcDir, file.name);
		const relativePath = `./${path.relative(packageDir, mainFile)}`;

		if (await Bun.file(mainFile).exists()) {
			newExports[`./${file.name}`] = relativePath;
		}
	}

	return newExports;
}
