import { access, copyFile } from "node:fs/promises";
import path from "node:path";

import { EntityPackage } from "intershell";

async function exists(filePath: string): Promise<boolean> {
	try {
		await access(filePath);
		return true;
	} catch {
		return false;
	}
}

async function getEnvSamplePairs(
	repoRoot: string,
): Promise<readonly (readonly [string, string])[]> {
	const pairs: [string, string][] = [[".env.sample", ".env"]];

	for (const packageName of await EntityPackage.getAllPackages()) {
		const pkg = new EntityPackage(packageName);
		if (pkg.isRoot()) continue;
		const relDir = pkg.getPath();
		pairs.push([path.join(relDir, ".env.sample"), path.join(relDir, ".env")]);
	}

	return pairs.map(
		([sample, dest]) => [path.join(repoRoot, sample), path.join(repoRoot, dest)] as const,
	);
}

/** Copy .env.sample → .env when .env is missing (does not overwrite existing .env). */
export async function ensureEnvFiles(repoRoot = process.cwd()): Promise<void> {
	for (const [samplePath, destPath] of await getEnvSamplePairs(repoRoot)) {
		if (!(await exists(samplePath))) continue;
		if (await exists(destPath)) continue;
		await copyFile(samplePath, destPath);
	}
}
