import type { Dirent } from "node:fs";
import path from "node:path";

import { type PackageExportValue, toSourceExport } from "./source-export";

export async function buildExportsWithoutPattern(
	files: readonly Dirent[],
	srcDir: string,
	packageDir: string,
): Promise<Record<string, PackageExportValue>> {
	const newExports: Record<string, PackageExportValue> = {};

	for (const file of files) {
		if (file.isDirectory()) {
			const indexFile = path.join(srcDir, file.name, "index.ts");
			const indexTsxFile = path.join(srcDir, file.name, "index.tsx");
			const sameNameFile = path.join(srcDir, file.name, `${file.name}.ts`);
			const sameNameTsxFile = path.join(srcDir, file.name, `${file.name}.tsx`);

			if (await Bun.file(indexFile).exists()) {
				newExports[`./${file.name}`] = toSourceExport(`./${path.relative(packageDir, indexFile)}`);
			} else if (await Bun.file(indexTsxFile).exists()) {
				newExports[`./${file.name}`] = toSourceExport(
					`./${path.relative(packageDir, indexTsxFile)}`,
				);
			} else if (await Bun.file(sameNameFile).exists()) {
				newExports[`./${file.name}`] = toSourceExport(
					`./${path.relative(packageDir, sameNameFile)}`,
				);
			} else if (await Bun.file(sameNameTsxFile).exists()) {
				newExports[`./${file.name}`] = toSourceExport(
					`./${path.relative(packageDir, sameNameTsxFile)}`,
				);
			}

			continue;
		}

		const shouldSkip = !file.name.endsWith(".ts") && !file.name.endsWith(".tsx");
		if (shouldSkip) continue;

		if (file.name === "index.ts") {
			newExports["."] = toSourceExport(
				`./${path.relative(packageDir, path.join(srcDir, file.name))}`,
			);
			continue;
		}

		const mainFile = path.join(srcDir, file.name);
		const relativePath = `./${path.relative(packageDir, mainFile)}`;

		if (await Bun.file(mainFile).exists()) {
			newExports[`./${file.name}`] = toSourceExport(relativePath);
		}
	}

	return newExports;
}
