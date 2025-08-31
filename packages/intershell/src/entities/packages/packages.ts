import { readFileSync } from "node:fs";
import { $, file, write } from "bun";
import { getEntitiesConfig } from "../config/config";
import type { PackageJson } from "./types";

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

	readVersion(): string | undefined {
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
		try {
			const changelog = readFileSync(changelogPath, "utf8");
			return changelog || "";
		} catch {
			return "";
		}
	}
	async writeChangelog(content: string): Promise<void> {
		try {
			await file(this.getChangelogPath()).exists();
		} catch {
			await $`touch ${this.getChangelogPath()}`.quiet();
		}

		await write(this.getChangelogPath(), content);
		await $`bun biome check --write --no-errors-on-unmatched ${this.getJsonPath()}`.quiet();
	}

	validatePackage(): string[] {
		const packageJson = this.readJson();
		const config = getEntitiesConfig().getConfig();
		const errors: string[] = [];

		// Only validate if package validation is enabled
		if (!config.package) {
			return errors;
		}

		const rules = config.package;

		// Selective versioning rules
		if (rules.selectiveVersioning.enabled) {
			if (packageJson.private === true && packageJson.version) {
				errors.push(`${this.packageName}: Private packages should not have version field`);
			}
			if (packageJson.private !== true && !packageJson.version) {
				errors.push(`${this.packageName}: Versioned packages must have a version field`);
			}
			if (!packageJson.version && packageJson.private !== true) {
				errors.push(`${this.packageName}: Unversioned packages must have private: true`);
			}
			if (packageJson.version && packageJson.private === true) {
				errors.push(`${this.packageName}: Versioned packages should not have private: true`);
			}
		}

		// Semantic versioning rules
		if (rules.semanticVersioning.enabled && packageJson.version) {
			if (!/^\d+\.\d+\.\d+$/.test(packageJson.version)) {
				errors.push(`${this.packageName}: Version should follow semantic versioning (e.g., 1.0.0)`);
			}
		}

		// Description rules
		if (rules.description.enabled && packageJson.version && !packageJson.description) {
			errors.push(`${this.packageName}: Consider adding a description to package.json`);
		}

		return errors;
	}

	/**
	 * Determines if this package should be versioned based on its private field
	 * @returns true if the package should be versioned (private !== true)
	 */
	shouldVersion(): boolean {
		const packageJson = this.readJson();
		// Package should be versioned if private is false or undefined
		return packageJson.private !== true;
	}

	/**
	 * Gets the tag series name for this package
	 * @returns tag series prefix (e.g., 'v', 'intershell-v') or null if package shouldn't be versioned
	 */
	getTagSeriesName(): string | null {
		if (!this.shouldVersion()) return null;

		// Generate tag series name based on package name
		if (this.packageName === "root") return "v";
		return `${this.packageName.replace("@repo/", "")}-v`;
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

	/**
	 * Gets all packages that should be versioned (private !== true)
	 * @returns Array of package names that should be versioned
	 */
	static async getVersionedPackages(): Promise<string[]> {
		const allPackages = await EntityPackages.getAllPackages();
		const versionedPackages: string[] = [];

		for (const packageName of allPackages) {
			const packageInstance = new EntityPackages(packageName);
			if (packageInstance.shouldVersion()) {
				versionedPackages.push(packageName);
			}
		}

		return versionedPackages;
	}

	/**
	 * Gets all packages that should NOT be versioned (private === true)
	 * @returns Array of package names that should NOT be versioned
	 */
	static async getUnversionedPackages(): Promise<string[]> {
		const allPackages = await EntityPackages.getAllPackages();
		const unversionedPackages: string[] = [];

		for (const packageName of allPackages) {
			const packageInstance = new EntityPackages(packageName);
			if (!packageInstance.shouldVersion()) {
				unversionedPackages.push(packageName);
			}
		}

		return unversionedPackages;
	}

	/**
	 * Validates all packages in the workspace
	 * @returns Object containing validation results for all packages
	 */
	static async validateAllPackages(): Promise<{
		readonly isValid: boolean;
		readonly packages: Array<{
			readonly name: string;
			readonly errors: string[];
		}>;
		readonly totalErrors: number;
	}> {
		const allPackages = await EntityPackages.getAllPackages();
		const validationResults: Array<{
			readonly name: string;
			readonly errors: string[];
		}> = [];

		let totalErrors = 0;

		for (const packageName of allPackages) {
			const packageInstance = new EntityPackages(packageName);
			const errors = packageInstance.validatePackage();

			validationResults.push({
				name: packageName,
				errors,
			});

			totalErrors += errors.length;
		}

		return {
			isValid: totalErrors === 0,
			packages: validationResults,
			totalErrors,
		};
	}
}
