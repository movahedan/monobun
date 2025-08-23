import type { BranchConfig } from "../branch/types";

export interface IConfig {
	readonly commit: {
		readonly conventional: readonly string[];
		readonly staged: readonly string[];
	};
	readonly branch: BranchConfig;
	readonly tag: readonly string[];
}

type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type CustomConfigJson = DeepPartial<IConfig>;
