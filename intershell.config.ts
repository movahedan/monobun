import { defaultConfig, type IConfig } from "intershell/entities";

export default {
	...defaultConfig,
} as const satisfies IConfig;
