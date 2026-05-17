import path from "node:path";

export const MAX_REL_PATH_FOR_REGEX = 8192;

function toPosixPath(filePath: string): string {
	return filePath.split(path.sep).join("/");
}

export function matchFilesByPattern(
	allFiles: readonly string[],
	packageDir: string,
	regex: RegExp,
): readonly string[] {
	const matched: string[] = [];
	for (const abs of allFiles) {
		const rel = toPosixPath(path.relative(packageDir, abs));
		if (rel.length > MAX_REL_PATH_FOR_REGEX) {
			throw new Error(
				`Path relative to package exceeds max length (${String(MAX_REL_PATH_FOR_REGEX)}): shorten the path or avoid --pattern on this tree.`,
			);
		}
		if (regex.test(rel)) {
			matched.push(abs);
		}
	}
	return matched;
}
