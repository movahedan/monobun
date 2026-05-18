import { readdir } from "node:fs/promises";
import path from "node:path";

export async function collectFilesRecursive(
	rootDir: string,
	extensions: readonly string[],
): Promise<readonly string[]> {
	const results: string[] = [];

	const walk = async (dir: string): Promise<void> => {
		const entries = await readdir(dir, { withFileTypes: true });
		for (const entry of entries) {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				await walk(full);
				continue;
			}
			if (!entry.isFile()) continue;
			if (entry.name.endsWith(".d.ts")) continue;
			if (extensions.some((extension) => entry.name.endsWith(extension))) {
				results.push(full);
			}
		}
	};

	await walk(rootDir);
	return results;
}
