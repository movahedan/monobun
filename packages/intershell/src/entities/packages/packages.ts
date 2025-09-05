import { getEntitiesConfig } from "../config/config";
import { entitiesShell } from "../entities.shell";
import { packagesShell } from "./packages.shell";
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
			const packageJson = packagesShell.readJsonFile(jsonPath);
			return packageJson;
		} catch (error) {
			throw new Error(`Package not found ${this.packageName} at ${this.getJsonPath()}: ${error}`);
		}
	}
	async writeJson(data: PackageJson): Promise<void> {
		await packagesShell.writeJsonFile(this.getJsonPath(), data);
		this.packageJson = data;
		await entitiesShell.runBiomeCheck(this.getJsonPath());
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
		return packagesShell.readChangelogFile(changelogPath);
	}
	async writeChangelog(content: string): Promise<void> {
		await packagesShell.writeChangelogFile(this.getChangelogPath(), content);
		await entitiesShell.runBiomeCheck(this.getChangelogPath());
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

		// Get workspace root
		const workspaceRoot = await packagesShell.getWorkspaceRoot();

		// Read apps directory
		let apps: string[] = [];
		try {
			const appsPath = `${workspaceRoot}/apps`;
			apps = await packagesShell.readDirectory(appsPath);
		} catch {
			// apps directory doesn't exist or can't be read
		}

		// Read packages directory
		let pkgs: string[] = [];
		try {
			const packagesPath = `${workspaceRoot}/packages`;
			const packageNames = await packagesShell.readDirectory(packagesPath);
			pkgs = packageNames.map((name) => `@repo/${name}`);
		} catch {
			// packages directory doesn't exist or can't be read
		}

		// Filter packages that have valid package.json files
		const filteredPackages = await Promise.all(
			[...apps, ...pkgs].map(async (pkg) => {
				const packageInstance = new EntityPackages(pkg);
				const packageJsonPath = packageInstance.getJsonPath();

				try {
					const exists = await packagesShell.canAccessFile(packageJsonPath);
					if (!exists) return null;

					const packageJsonContent = await packagesShell.readFileAsText(packageJsonPath);
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
	static async validateAllPackages(): Promise<string[]> {
		const allPackages = await EntityPackages.getAllPackages();
		const errors: Array<string> = [];

		for (const packageName of allPackages) {
			const packageInstance = new EntityPackages(packageName);
			const packageErrors = packageInstance.validatePackage();

			errors.push(...packageErrors);
		}

		return errors;
	}
}
