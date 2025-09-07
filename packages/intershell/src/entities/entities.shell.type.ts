import type { $ } from "bun";

export type EntitiesShell = {
	touch: (filePath: string) => ReturnType<typeof $>;

	gitStatus: () => ReturnType<typeof $>;

	gitRevParse: (ref: string) => ReturnType<typeof $>;
	gitFirstCommit: () => ReturnType<typeof $>;

	gitLogHashes: (args: string[]) => ReturnType<typeof $>;

	gitShow: (hash: string) => ReturnType<typeof $>;
	gitShowNameOnly: (hash: string) => ReturnType<typeof $>;
	gitShowPackageJsonAtTag: (tag: string, packagePath: string) => ReturnType<typeof $>;

	gitDiff: (file: string) => ReturnType<typeof $>;
	gitBranchShowCurrent: () => ReturnType<typeof $>;

	gitTag: (tagName: string, message: string, options: { force?: string }) => ReturnType<typeof $>;
	gitTagList: (prefix: string) => ReturnType<typeof $>;
	gitTagLatest: (prefix: string) => ReturnType<typeof $>;
	gitTagInfo: (tagName: string) => ReturnType<typeof $>;
	gitTagExists: (tagName: string) => ReturnType<typeof $>;
	gitPushTag: (tagName: string) => ReturnType<typeof $>;
	gitDeleteTag: (tagName: string) => ReturnType<typeof $>;

	gitMergeBaseIsAncestor: (ancestor: string, descendant: string) => ReturnType<typeof $>;

	gitCheckout: (tagName: string) => ReturnType<typeof $>;

	turboRunBuild: (args: string[]) => ReturnType<typeof $>;

	runBiomeCheck: (filePath: string) => ReturnType<typeof $>;
};
