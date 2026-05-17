import path from "node:path";

import { colorify } from "../shared/colorify";
import { MAX_REL_PATH_FOR_REGEX } from "../shared/match-files-by-pattern";
import { type PackageExportValue, toSourceExport } from "./source-export";

function toPosixPath(filePath: string): string {
	return filePath.split(path.sep).join("/");
}

function exportKeyFromMatch(relFromSrcPosix: string, match: RegExpMatchArray): string {
	if (match[1] !== undefined && match[1].length > 0) {
		const sub = match[1].replace(/^\.?\//, "");
		if (sub === "" || sub === ".") {
			return ".";
		}
		return sub.startsWith("./") ? sub : `./${sub}`;
	}

	if (relFromSrcPosix === "index.ts" || relFromSrcPosix === "index.tsx") {
		return ".";
	}

	const noExt = relFromSrcPosix.replace(/\.tsx?$/, "");
	const parts = noExt.split("/");
	if (parts.length >= 2 && parts[parts.length - 1] === parts[parts.length - 2]) {
		return `./${parts[parts.length - 1]}`;
	}

	return `./${noExt}`;
}

export function buildExportsWithPattern(
	absoluteFiles: readonly string[],
	packageDir: string,
	srcDir: string,
	regex: RegExp,
): Record<string, PackageExportValue> {
	const newExports: Record<string, PackageExportValue> = {};
	const duplicateKeys = new Map<string, string[]>();

	for (const abs of absoluteFiles) {
		const relPackage = toPosixPath(path.relative(packageDir, abs));
		if (relPackage.length > MAX_REL_PATH_FOR_REGEX) {
			throw new Error(
				`Path relative to package exceeds max length (${String(MAX_REL_PATH_FOR_REGEX)}): shorten the path or avoid --pattern on this tree.`,
			);
		}
		const match = relPackage.match(regex);
		if (match === null) continue;

		const relFromSrc = toPosixPath(path.relative(srcDir, abs));
		const key = exportKeyFromMatch(relFromSrc, match);
		const exportPath = relPackage.startsWith(".") ? relPackage : `./${relPackage}`;

		const prior = newExports[key];
		if (prior !== undefined && prior !== exportPath) {
			const list = duplicateKeys.get(key) ?? [prior];
			list.push(exportPath);
			duplicateKeys.set(key, list);
		}

		newExports[key] = toSourceExport(exportPath);
	}

	if (duplicateKeys.size > 0) {
		const lines = [...duplicateKeys.entries()]
			.map(([key, paths]) => `${key}: ${paths.join(", ")}`)
			.join("\n");
		console.warn(colorify.yellow(`Duplicate export keys (last path wins):\n${lines}`));
	}

	return newExports;
}
