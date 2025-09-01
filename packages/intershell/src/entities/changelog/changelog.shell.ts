import { $ } from "bun";

const changelogShell = {
	gitLog: async (
		range: string,
		options: { merges?: boolean; path?: string; exclude?: string[] },
	) => {
		const args: string[] = [range, "--oneline", "--format=%H"];

		if (options.merges) args.push("--merges");

		// Handle exclude paths first (before path specification)
		if (options.exclude && options.exclude.length > 0) {
			for (const exclude of options.exclude) {
				args.push("--not", "--", exclude);
			}
		}

		// Add path specification last
		if (options.path) {
			args.push("--", options.path);
		}

		try {
			const result = await $`git log ${args}`.quiet();
			const hashes = result.text().trim().split("\n").filter(Boolean);
			return hashes;
		} catch (error) {
			console.warn("Git log failed:", error);
			return [];
		}
	},
};

export { changelogShell };
