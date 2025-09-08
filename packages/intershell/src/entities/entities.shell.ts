import { $ } from "bun";

type EntitiesShell = {
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

export const entitiesShell: EntitiesShell = {
	touch: (filePath: string) => $`touch ${filePath}`.quiet().nothrow(),

	gitStatus: () => $`git status --porcelain`.quiet().nothrow(),

	gitRevParse: (ref: string) => $`git rev-parse ${ref}`.quiet().nothrow(),
	gitFirstCommit: () => $`git rev-list --max-parents=0 HEAD`.nothrow().quiet(),

	gitLogHashes: (args: string[]) =>
		$`git log --pretty=format:"%H" ${args.join(" ")}`.quiet().nothrow(),

	gitShow: (hash: string) =>
		$`git show --format="%H%n%an%n%ad%n%s%n%B" --no-patch ${hash}`.quiet().nothrow(),
	gitShowNameOnly: (hash: string) => $`git show --name-only --format="" ${hash}`.quiet().nothrow(),
	gitShowPackageJsonAtTag: (tag: string, packagePath: string) =>
		$`git show ${tag}:${packagePath}`.quiet().nothrow(),

	gitDiff: (file: string) => $`git diff --cached -- ${file}`.quiet().nothrow(),
	gitBranchShowCurrent: () => $`git branch --show-current`.quiet().nothrow(),

	gitTag: (tagName: string, message: string, options: { force?: string }) =>
		$`git tag ${options.force} -a ${tagName} -m "${message}"`.quiet().nothrow(),
	gitTagList: (prefix: string) =>
		$`git tag --list "${prefix}*" --sort=-version:refname`.quiet().nothrow(),
	gitTagLatest: (prefix: string) =>
		$`git tag --sort=-version:refname --list "${prefix}*" | head -1`.nothrow().quiet(),
	gitTagInfo: (tagName: string) =>
		$`git tag -l --format='%(creatordate:iso8601)%0a%(contents:subject)' ${tagName}`
			.quiet()
			.nothrow(),
	gitTagExists: (tagName: string) => $`git tag --list ${tagName}`.quiet().nothrow(),
	gitPushTag: (tagName: string) => $`git push origin ${tagName}`.quiet().nothrow(),
	gitDeleteTag: (tagName: string) => $`git tag -d ${tagName}`.quiet().nothrow(),

	gitMergeBaseIsAncestor: (ancestor: string, descendant: string) =>
		$`git merge-base --is-ancestor ${ancestor} ${descendant}`.quiet().nothrow(),

	gitCheckout: (tagName: string) => $`git checkout ${tagName}`.quiet().nothrow(),

	turboRunBuild: (args: string[]) =>
		$`bunx turbo run build ${args.join(" ")} --dry-run=json`.nothrow(),

	runBiomeCheck: (filePath: string) =>
		$`bun biome check --write --no-errors-on-unmatched ${filePath}`.quiet().nothrow(),
};
