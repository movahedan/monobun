import { Command, Flags } from "@oclif/core";
import { colorify } from "@repo/intershell/core";

export default class Commit extends Command {
	static description = "Execute git commit with the provided message";

	static examples = [
		'intershell commit -m "feat: add new feature"',
		"intershell commit -m 'fix: resolve bug' --no-verify",
		"intershell commit -m 'docs: update readme' --amend",
	];

	static flags = {
		message: Flags.string({
			char: "m",
			description: "Commit message (optional: run interactive mode)",
		}),
		all: Flags.boolean({
			char: "a",
			description: "Stage all modified files",
			default: false,
		}),
		"no-verify": Flags.boolean({
			description: "Skip git hooks when committing",
			default: false,
		}),
		amend: Flags.boolean({
			description: "Amend the previous commit",
			default: false,
		}),
		"no-edit": Flags.boolean({
			description: "Use the selected commit message without launching an editor",
			default: false,
		}),
		"dry-run": Flags.boolean({
			description: "Show what would be committed without actually committing",
			default: false,
		}),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(Commit);

		if (flags.message) {
			await this.executeCommit(flags);
		} else {
			this.log(
				"💡 Interactive mode not yet implemented. Please provide a commit message with -m flag.",
			);
		}
	}

	private async executeCommit(flags: {
		message?: string;
		all?: boolean;
		"no-verify"?: boolean;
		amend?: boolean;
		"no-edit"?: boolean;
		"dry-run"?: boolean;
	}): Promise<void> {
		const gitArgs = ["commit"];

		if (flags.all) gitArgs.push("-a");
		if (flags.message) gitArgs.push("-m", flags.message);
		if (flags.amend) gitArgs.push("--amend");
		if (flags["no-edit"]) gitArgs.push("--no-edit");
		if (flags["no-verify"]) gitArgs.push("--no-verify");

		if (flags["dry-run"]) {
			this.log(colorify.blue("🔍 Dry run - would execute:"));
			this.log(colorify.gray(`git ${gitArgs.join(" ")}`));
			return;
		}

		// Check if there are staged changes
		if (!flags.all && !flags.amend) {
			const statusResult = Bun.spawn(["git", "diff", "--cached", "--quiet"]);
			const statusExitCode = await statusResult.exited;

			if (statusExitCode === 0) {
				this.warn(colorify.yellow("⚠️  No staged changes found."));
				this.log(colorify.blue("💡 Try one of these options:"));
				this.log(colorify.gray("  • Stage your changes: git add <files>"));
				this.log(colorify.gray('  • Use --all flag: intershell commit -a -m "message"'));
				this.log(colorify.gray("  • Check git status: git status"));
				throw new Error("No staged changes to commit");
			}
		}

		const result = Bun.spawn(["git", ...gitArgs], {
			stdio: ["inherit", "pipe", "pipe"],
		});

		const exitCode = await result.exited;
		if (exitCode === 0) {
			this.log(colorify.green("🚀 Commit successful!"));
		} else {
			const stderr = await new Response(result.stderr).text();
			if (stderr) this.error(colorify.gray(stderr));
			throw new Error("❌ Git commit failed");
		}
	}
}
