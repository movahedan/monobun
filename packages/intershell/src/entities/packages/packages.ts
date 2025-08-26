import { readFileSync } from "node:fs";
import { $, file, write } from "bun";
import type { PackageJson, PackageValidationError, PackageValidationResult } from "./types";

const semanticVersionRegex = /^\d+\.\d+\.\d+$/;

export class EntityPackages {
	private readonly packageName: string;
	private packageJson: PackageJson | undefined;
	constructor(packageName: string) {
		this.packageName = packageName;
		this.packageJson = this.readJson();
	}

	getPath(): string {
		if (this.packageName === "root") return ".";
		if (this.packageName.startsWith("@repo/"))
			return `packages/${this.packageName.replace("@repo/", "")}`;
		return `apps/${this.packageName}`;
	}

	getJsonPath(): string {
		return `${this.getPath()}/package.json`;
	}
	readJson(): PackageJson {
		if (this.packageJson) {
			return this.packageJson;
		}

		const jsonPath = this.getJsonPath();
		try {
			const json = readFileSync(jsonPath, "utf8");
			const packageJson = JSON.parse(json);
			return packageJson;
		} catch (error) {
			throw new Error(`Package not found ${this.packageName} at ${this.getJsonPath()}: ${error}`);
		}
	}
	async writeJson(data: PackageJson): Promise<void> {
		await write(this.getJsonPath(), JSON.stringify(data, null, 2));
		this.packageJson = data;
		await $`bun biome check --write --no-errors-on-unmatched ${this.getJsonPath()}`.quiet();
	}

	readVersion(): string {
		return this.readJson().version;
	}
	async writeVersion(version: string): Promise<void> {
		const packageJson = this.readJson();
		packageJson.version = version;
		this.packageJson = packageJson;
		await this.writeJson(packageJson);
	}

	getChangelogPath(): string {
		return `${this.getPath()}/CHANGELOG.md`;
	}
	readChangelog(): string {
		const changelogPath = this.getChangelogPath();
		const changelog = readFileSync(changelogPath, "utf8");
		return changelog || "";
	}
	async writeChangelog(content: string): Promise<void> {
		const isExists = await file(this.getChangelogPath()).exists();
		if (isExists) {
			await write(this.getChangelogPath(), content);
		} else {
			await write(this.getChangelogPath(), content, { createPath: true });
		}
		await $`bun biome check --write --no-errors-on-unmatched ${this.getJsonPath()}`.quiet();
	}

	validatePackage(): PackageValidationResult {
		const packageJson = this.readJson();

		const errors: PackageValidationError[] = [];

		if (!semanticVersionRegex.test(packageJson.version)) {
			errors.push({
				code: "INVALID_VERSION",
				message: "Version should follow semantic versioning",
				field: "version",
			});
		}

		if (!packageJson.description) {
			errors.push({
				code: "MISSING_DESCRIPTION",
				message: "Consider adding a description to package.json",
				field: "description",
			});
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}

	static getRepoUrl(): string {
		const rootPackageJson = new EntityPackages("root").readJson();
		return typeof rootPackageJson.repository === "string"
			? rootPackageJson.repository
			: rootPackageJson.repository?.url || "";
	}
	static async getAllPackages(): Promise<string[]> {
		const packages: string[] = ["root"];

		// Use Node.js fs instead of shell commands
		const fs = await import("node:fs/promises");
		const path = await import("node:path");

		// Get workspace root by looking for package.json in parent directories
		let workspaceRoot = process.cwd();
		while (workspaceRoot !== path.dirname(workspaceRoot)) {
			try {
				await fs.access(path.join(workspaceRoot, "package.json"));
				break; // Found package.json, this is the workspace root
			} catch {
				workspaceRoot = path.dirname(workspaceRoot);
			}
		}

		// Read apps directory
		let apps: string[] = [];
		try {
			const appsPath = path.join(workspaceRoot, "apps");
			const appsEntries = await fs.readdir(appsPath, { withFileTypes: true });
			apps = appsEntries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
		} catch {
			// apps directory doesn't exist or can't be read
		}

		// Read packages directory
		let pkgs: string[] = [];
		try {
			const packagesPath = path.join(workspaceRoot, "packages");
			const packagesEntries = await fs.readdir(packagesPath, { withFileTypes: true });
			pkgs = packagesEntries
				.filter((entry) => entry.isDirectory())
				.map((entry) => `@repo/${entry.name}`);
		} catch {
			// packages directory doesn't exist or can't be read
		}

		// Filter packages that have valid package.json files
		const filteredPackages = await Promise.all(
			[...apps, ...pkgs].map(async (pkg) => {
				const packageInstance = new EntityPackages(pkg);
				const packageJsonPath = packageInstance.getJsonPath();

				try {
					const exists = await fs
						.access(packageJsonPath)
						.then(() => true)
						.catch(() => false);
					if (!exists) return null;

					const packageJsonContent = await fs.readFile(packageJsonPath, "utf-8");
					const packageJson = JSON.parse(packageJsonContent);
					const name = packageJson.name;

					if (!name) return null;

					if (name !== pkg) {
						throw new Error(`Package ${pkg} has a different name in package.json: ${name}`);
					}

					return name;
				} catch {
					return null;
				}
			}),
		);

		packages.push(...filteredPackages.filter((pkg): pkg is string => pkg !== null));

		return packages;
	}
}
