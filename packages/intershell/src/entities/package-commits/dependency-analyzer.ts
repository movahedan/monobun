import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { entitiesShell } from "../entities.shell";
import { EntityPackage, type TsConfig, type TsConfigPaths } from "../package";

export class EntityDependencyAnalyzer {
	private readonly package: EntityPackage;

	constructor(packageInstance: EntityPackage) {
		this.package = packageInstance;
	}

	/**
	 * Get internal monorepo dependencies for a package at a specific tag/commit
	 * Returns only dependencies within this monorepo
	 */
	async getPackageDependenciesAtRef(reference: string): Promise<string[]> {
		try {
			// Get all internal packages in the monorepo
			const allPackages = await EntityPackage.getAllPackages();

			// Get package.json dependencies
			const packageJsonDeps = await this.getPackageJsonDependencies(reference);

			// Get tsconfig dependencies
			const tsconfigDeps = await this.getTsConfigDependencies(reference);

			// Combine and filter for internal dependencies only
			const allDeps = [...new Set([...packageJsonDeps, ...tsconfigDeps])];

			return allDeps.filter((dep) => allPackages.includes(dep));
		} catch {
			return [];
		}
	}

	/**
	 * Get package.json dependencies for a package at a specific reference
	 */
	private async getPackageJsonDependencies(reference: string): Promise<string[]> {
		try {
			const result = await entitiesShell.gitShowPackageJsonAtTag(
				reference,
				this.package.getJsonPath(),
			);

			if (result.exitCode !== 0) {
				return [];
			}

			const packageJson = JSON.parse(result.text()) as Record<string, unknown>;
			const deps = [
				...(packageJson.dependencies
					? Object.keys(packageJson.dependencies as Record<string, string>)
					: []),
				...(packageJson.devDependencies
					? Object.keys(packageJson.devDependencies as Record<string, string>)
					: []),
				...(packageJson.peerDependencies
					? Object.keys(packageJson.peerDependencies as Record<string, string>)
					: []),
			];

			// Filter for @repo/ packages and return without @repo/ prefix
			return deps.filter((dep) => dep.startsWith("@repo/")).map((dep) => dep.replace("@repo/", ""));
		} catch {
			return [];
		}
	}

	/**
	 * Get tsconfig dependencies by resolving paths to actual internal packages
	 */
	private async getTsConfigDependencies(reference: string): Promise<string[]> {
		try {
			const packagePath = this.package.getPath();
			const tsconfigPaths = await this.getTsConfigPaths(reference);

			const deps: string[] = [];

			for (const [alias, paths] of Object.entries(tsconfigPaths)) {
				// Check if alias itself is an internal package
				if (alias.startsWith("@repo/")) {
					deps.push(alias.replace("@repo/", ""));
				}

				// Check if paths point to internal packages
				if (Array.isArray(paths)) {
					for (const path of paths) {
						const resolvedPath = resolve(packagePath, path);
						const internalPackage = this.findInternalPackageFromPath(resolvedPath);
						if (internalPackage) {
							deps.push(internalPackage);
						}
					}
				}
			}

			return [...new Set(deps)];
		} catch {
			return [];
		}
	}

	/**
	 * Find internal package name from absolute path
	 */
	private findInternalPackageFromPath(absolutePath: string): string | null {
		// Check if path points to packages/ or apps/ directory
		const packagesMatch = absolutePath.match(/\/packages\/([^/]+)/);
		const appsMatch = absolutePath.match(/\/apps\/([^/]+)/);

		if (packagesMatch) {
			return `@repo/${packagesMatch[1]}`;
		}

		if (appsMatch) {
			return appsMatch[1];
		}

		return null;
	}

	/**
	 * Get TypeScript configuration paths for a package at a specific git reference
	 */
	private async getTsConfigPaths(reference: string): Promise<TsConfigPaths> {
		try {
			const tsconfig = await this.readTsconfigAtRef(reference);
			const resolvedConfig = await this.resolveExtendedTsConfig(tsconfig, this.package.getPath());

			return resolvedConfig.compilerOptions?.paths || {};
		} catch {
			return {};
		}
	}

	/**
	 * Read tsconfig.json at a specific git reference
	 */
	private async readTsconfigAtRef(reference: string): Promise<TsConfig> {
		try {
			const result = await entitiesShell.gitShow(`${reference}:${this.package.getTsconfigPath()}`);
			if (result.exitCode !== 0) {
				// If tsconfig.json doesn't exist at this reference, return empty config
				return {};
			}

			const content = result.text();
			return JSON.parse(content);
		} catch {
			// If parsing fails, return empty config
			return {};
		}
	}

	/**
	 * Resolve extended TypeScript configurations
	 */
	private async resolveExtendedTsConfig(config: TsConfig, packagePath: string): Promise<TsConfig> {
		if (!config.extends) {
			return config;
		}

		const extendedPath = resolve(packagePath, config.extends);
		if (!existsSync(extendedPath)) {
			return config;
		}

		try {
			const extendedContent = readFileSync(extendedPath, "utf-8");
			const extendedConfig: TsConfig = JSON.parse(extendedContent);

			// Recursively resolve extended configs
			const resolvedExtended = await this.resolveExtendedTsConfig(extendedConfig, packagePath);

			// Merge configurations
			return {
				...resolvedExtended,
				...config,
				compilerOptions: {
					...resolvedExtended.compilerOptions,
					...config.compilerOptions,
					paths: {
						...(resolvedExtended.compilerOptions?.paths || {}),
						...(config.compilerOptions?.paths || {}),
					},
				},
			};
		} catch {
			return config;
		}
	}
}
