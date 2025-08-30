import { defaultConfig, type IConfig } from "@repo/intershell/entities";

export default {
	...defaultConfig,
} as const satisfies IConfig;
