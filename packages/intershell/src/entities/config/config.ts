import { readFileSync } from "node:fs";
import { EntityPackages } from "../packages";
import { defaultConfig } from "./default";
import type { CustomConfigJson, IConfig } from "./types";

export class Config {
	private config: IConfig;

	constructor(customConfig?: CustomConfigJson) {
		if (customConfig) {
			this.config = this.mergeConfig(customConfig);
		} else {
			this.config = defaultConfig;
		}
	}

	getConfig(): IConfig {
		return this.config;
	}

	private mergeConfig(config: CustomConfigJson): IConfig {
		return {
			...defaultConfig,
			commit: {
				...defaultConfig.commit,
				...config.commit,
			} as IConfig["commit"],
			branch: {
				...defaultConfig.branch,
				...config.branch,
			} as IConfig["branch"],
			tag: [...defaultConfig.tag, ...(config.tag || [])] as IConfig["tag"],
		};
	}
}

function getCustomConfig(): CustomConfigJson | undefined {
	const rootPackageJson = new EntityPackages("root").readJson();
	const configFilePath = rootPackageJson.intershell?.config;
	let customConfig: CustomConfigJson | undefined;
	try {
		if (!configFilePath) throw new Error();
		const config = readFileSync(configFilePath, "utf-8");
		customConfig = JSON.parse(config) as CustomConfigJson;
	} catch {
		customConfig = undefined;
	}
	return customConfig;
}

export const entitiesConfig = new Config(getCustomConfig());
