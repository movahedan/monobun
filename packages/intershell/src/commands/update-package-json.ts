import { readdir } from "node:fs/promises";
import path from "node:path";
import { Command, Flags } from "@oclif/core";
import { colorify } from "@repo/intershell/core";
import { $ } from "bun";

export default class UpdatePackageJson extends Command {
	static description =
		"Update the package.json exports attributes based on the files in the package";

	static examples = ["intershell update-package-json"];

	static flags = {
		src: Flags.boolean({
			char: "s",
			description: "Are you using src directory? (default: true)",
			default: true,
		}),
		"dry-run": Flags.boolean({
			char: "d",
			description: "Show what would be updated without making changes",
			default: false,
		}),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(UpdatePackageJson);
		this.log(colorify.blue("🧹 Starting package.json update..."));

		const packageJsonPath = path.join(process.cwd(), "package.json");
		const packageDir = path.dirname(packageJsonPath);
		const srcDir = flags.src ? path.join(packageDir, "src") : packageDir;
		const files = await readdir(srcDir, {
			withFileTypes: true,
			recursive: false,
		});

		this.log(
			colorify.blue(`🔍 Found ${files.length} exportable modules:`),
			colorify.cyan(files.map((f) => f.name).join(" ")),
		);

		const newExports = await this.getNewExports(files, srcDir, packageDir);

		if (flags["dry-run"]) {
			this.log(colorify.yellow("🔍 Dry run mode, skipping write:"));
			this.log(JSON.stringify(newExports, null, 2));
			return;
		}

		const packageJson = JSON.parse(await Bun.file(packageJsonPath).text());
		packageJson.exports = newExports;

		await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2));
		await $`bun biome check --write --no-errors-on-unmatched ${packageJsonPath}`;
		this.log(colorify.green("✅ Package.json updated successfully"));
	}

	private async getNewExports(
		files: Array<{ name: string; isDirectory(): boolean }>,
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
}
