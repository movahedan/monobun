import { $ } from "bun";

const commitShell = {
	gitShow: (hash: string) =>
		$`git show --format="%H%n%an%n%ad%n%s%n%B" --no-patch ${hash}`.quiet().nothrow(),
	gitShowNameOnly: (hash: string) => $`git show --name-only --format="" ${hash}`.quiet().nothrow(),
};

export { commitShell };
