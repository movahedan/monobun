import { $ } from "bun";
import type { EntitiesShell } from "./entities.shell.type";

export const entitiesShell: EntitiesShell = {
	gitStatus: () => $`git status --porcelain`.quiet().nothrow(),

	gitRevParse: (ref: string) => $`git rev-parse ${ref}`.quiet().nothrow(),

	gitLogHashes: (args: string[]) =>
		$`git log --pretty=format:"%H" ${args.join(" ")}`.quiet().nothrow(),

	gitShow: (hash: string) =>
		$`git show --format="%H%n%an%n%ad%n%s%n%B" --no-patch ${hash}`.quiet().nothrow(),
	gitShowNameOnly: (hash: string) => $`git show --name-only --format="" ${hash}`.quiet().nothrow(),
	gitShowPackageJsonAtTag: (tag: string, packagePath: string) =>
		$`git show ${tag}:${packagePath}`.quiet().nothrow(),

	gitDiff: (file: string) => $`git diff --cached -- ${file}`.quiet().nothrow(),
	gitBranchShowCurrent: () => $`git branch --show-current`.quiet().nothrow(),

	gitTagList: (prefix: string) =>
		$`git tag --list "${prefix}*" --sort=-version:refname`.quiet().nothrow(),
	gitTagInfo: (tagName: string) =>
		$`git tag -l --format='%(creatordate:iso8601)%0a%(contents:subject)' ${tagName}`
			.quiet()
			.nothrow(),
	gitTagExists: (tagName: string) => $`git tag --list ${tagName}`.quiet().nothrow(),

	turboRunBuild: (args: string[]) =>
		$`bunx turbo run build ${args.join(" ")} --dry-run=json`.quiet().nothrow(),
};
