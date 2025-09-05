import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { defaultConfig } from "./default";
import type { CustomConfigJson, IConfig } from "./types";

class Config {
	private config: IConfig;

	constructor(customConfig?: CustomConfigJson) {
		if (customConfig) {
			this.config = this.mergeConfig(customConfig);
		} else {
			this.config = this.mergeConfig({});
		}
	}

	getConfig(): IConfig {
		return this.config;
	}

	private mergeConfig(config: CustomConfigJson): IConfig {
		// Load packages for commit scopes if not provided
		let commitScopes: string[] = [];
		if (!config.commit?.conventional?.scopes?.list) {
			try {
				// This is a synchronous operation that reads from the filesystem
				// We'll populate it with available packages
				commitScopes = this.getAvailablePackages();
			} catch {
				commitScopes = [];
			}
		}

		return {
			...defaultConfig,
			commit: {
				...defaultConfig.commit,
				...config.commit,
				conventional: {
					...defaultConfig.commit.conventional,
					...config.commit?.conventional,
					type: {
						...defaultConfig.commit.conventional.type,
						...config.commit?.conventional?.type,
					},
					scopes: {
						...defaultConfig.commit.conventional.scopes,
						...config.commit?.conventional?.scopes,
						list: config.commit?.conventional?.scopes?.list || commitScopes,
					},
					description: {
						...defaultConfig.commit.conventional.description,
						...config.commit?.conventional?.description,
					},
					bodyLines: {
						...defaultConfig.commit.conventional.bodyLines,
						...config.commit?.conventional?.bodyLines,
					},
				},
				staged: config.commit?.staged || defaultConfig.commit.staged,
			} as IConfig["commit"],
			branch: {
				...defaultConfig.branch,
				...config.branch,
			} as IConfig["branch"],
			package: {
				...defaultConfig.package,
				...config.package,
			} as IConfig["package"],
			tag: {
				...defaultConfig.tag,
				...config.tag,
				name: {
					...defaultConfig.tag.name,
					...config.tag?.name,
				},
			} as IConfig["tag"],
		};
	}

	private getAvailablePackages(): string[] {
		const packages: string[] = ["root"];

		try {
			// Get workspace root
			const workspaceRoot = process.cwd();

			// Check for apps directory
			const appsPath = join(workspaceRoot, "apps");
			if (existsSync(appsPath)) {
				const apps = readdirSync(appsPath, { withFileTypes: true })
					.filter((dirent) => dirent.isDirectory())
					.map((dirent) => dirent.name);
				packages.push(...apps);
			}

			// Check for packages directory
			const packagesPath = join(workspaceRoot, "packages");
			if (existsSync(packagesPath)) {
				const pkgs = readdirSync(packagesPath, { withFileTypes: true })
					.filter((dirent) => dirent.isDirectory())
					.map((dirent) => `@repo/${dirent.name}`);
				packages.push(...pkgs);
			}
		} catch {
			// If we can't read directories, just return basic packages
			packages.push("admin", "api", "storefront", "ui", "utils");
		}

		return packages;
	}
}

function getCustomConfig(): CustomConfigJson | undefined {
	let customConfig: CustomConfigJson | undefined;
	try {
		// Read root package.json directly
		const rootPackageJsonPath = join(process.cwd(), "package.json");
		const rootPackageJsonContent = readFileSync(rootPackageJsonPath, "utf-8");
		const rootPackageJson = JSON.parse(rootPackageJsonContent);

		const configFilePath = rootPackageJson.intershell?.config;
		if (!configFilePath) throw new Error();

		const config = readFileSync(configFilePath, "utf-8");
		customConfig = JSON.parse(config) as CustomConfigJson;
	} catch {
		customConfig = undefined;
	}
	return customConfig;
}

// Lazy initialization to allow mocking in tests
let _entitiesConfig: Config | undefined;

function getEntitiesConfig(): Config {
	if (!_entitiesConfig) {
		_entitiesConfig = new Config(getCustomConfig());
	}
	return _entitiesConfig;
}

export const entitiesConfig = getEntitiesConfig();
