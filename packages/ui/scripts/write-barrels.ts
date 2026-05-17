import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const packageRoot = path.resolve(import.meta.dir, "..");
const srcDir = path.join(packageRoot, "src");

const SKIP_BARREL = new Set(["index.ts", "index.tsx"]);

const ATOMS_BARREL_ALIASES: Record<string, string> = {
	sonner: 'export { Toaster as SonnerToaster } from "./sonner";',
};

async function writeBarrelIndex(
	dirPath: string,
	exclude: ReadonlySet<string> = new Set(),
	aliases: Record<string, string> = {},
): Promise<void> {
	const fileNames = await readdir(dirPath);
	const moduleNames = fileNames
		.filter(
			(fileName) =>
				!SKIP_BARREL.has(fileName) && (fileName.endsWith(".ts") || fileName.endsWith(".tsx")),
		)
		.map((fileName) => fileName.replace(/\.(ts|tsx)$/u, ""))
		.filter((moduleName) => !exclude.has(moduleName))
		.sort((a, b) => a.localeCompare(b));

	const lines = moduleNames.map((moduleName) => `export * from "./${moduleName}";`);
	for (const aliasLine of Object.values(aliases).sort((a, b) => a.localeCompare(b))) {
		lines.push(aliasLine);
	}
	await writeFile(path.join(dirPath, "index.ts"), `${lines.join("\n")}\n`);
}

async function writeMoleculesIndex(moleculesDir: string): Promise<void> {
	const entries = await readdir(moleculesDir, { withFileTypes: true });
	const moleculeNames = entries
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort((a, b) => a.localeCompare(b));

	const lines = moleculeNames.map((name) => `export * from "./${name}/${name}";`);
	await writeFile(path.join(moleculesDir, "index.ts"), `${lines.join("\n")}\n`);
}

await writeBarrelIndex(
	path.join(srcDir, "atoms"),
	new Set(Object.keys(ATOMS_BARREL_ALIASES)),
	ATOMS_BARREL_ALIASES,
);
await writeBarrelIndex(path.join(srcDir, "hooks"));
await writeMoleculesIndex(path.join(srcDir, "molecules"));
