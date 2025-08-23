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

		const workspaceRootResult = await $`git rev-parse --show-toplevel`;
		const workspaceRoot = workspaceRootResult.text().trim();

		let apps: string[] = [];
		const appsResult = await $`ls ${workspaceRoot}/apps/`.nothrow().quiet();
		if (appsResult.exitCode === 0) {
			apps = appsResult.text().trim().split("\n").filter(Boolean);
		}

		let pkgs: string[] = [];
		const packagesResult = await $`ls ${workspaceRoot}/packages/`.nothrow().quiet();
		if (packagesResult.exitCode === 0) {
			pkgs = packagesResult
				.text()
				.trim()
				.split("\n")
				.filter(Boolean)
				.map((pkg) => `@repo/${pkg}`);
		}

		const filteredPackages = await Promise.all(
			[...apps, ...pkgs].map(async (pkg) => {
				const packageInstance = new EntityPackages(pkg);
				const packageJsonPath = packageInstance.getJsonPath();
				const exists = await file(packageJsonPath).exists();

				if (!exists) return null;

				try {
					const packageJson = await file(packageJsonPath).json();
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
