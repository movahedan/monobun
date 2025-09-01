import type { $ } from "bun";

export type EntitiesShell = {
	gitStatus: () => ReturnType<typeof $>;

	gitRevParse: (ref: string) => ReturnType<typeof $>;

	gitLogHashes: (args: string[]) => ReturnType<typeof $>;

	gitShow: (hash: string) => ReturnType<typeof $>;
	gitShowNameOnly: (hash: string) => ReturnType<typeof $>;
	gitShowPackageJsonAtTag: (tag: string, packagePath: string) => ReturnType<typeof $>;

	gitDiff: (file: string) => ReturnType<typeof $>;
	gitBranchShowCurrent: () => ReturnType<typeof $>;

	gitTagList: (prefix: string) => ReturnType<typeof $>;
	gitTagInfo: (tagName: string) => ReturnType<typeof $>;
	gitTagExists: (tagName: string) => ReturnType<typeof $>;

	turboRunBuild: (args: string[]) => ReturnType<typeof $>;
};
