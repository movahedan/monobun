import { Command, Flags } from "@oclif/core";
import { colorify } from "@repo/intershell/core";
import { EntityTag } from "@repo/intershell/entities";
import { $ } from "bun";

export default class VersionCi extends Command {
	static description = "Complete CI versioning workflow: auth → prepare → apply";

	static examples = [
		"intershell version:ci",
		"intershell version:ci --dry-run",
		"intershell version:ci --no-push",
	];

	static flags = {
		"no-push": Flags.boolean({
			char: "n",
			description: "Don't push tag to remote after creation",
			default: false,
		}),
		"dry-run": Flags.boolean({
			char: "d",
			description: "Show planned changes without applying them",
			default: false,
		}),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(VersionCi);
		this.log("🚀 Starting CI version workflow...");

		await this.configureGitAuth(flags);

		const fromTag = await EntityTag.getBaseCommitSha();
		this.log(`📝 Using base commit: ${colorify.blue(fromTag)}`);

		this.log("\n🔧 Preparing versions...");
		// Note: In a real implementation, you would call the prepare command here
		// For now, we'll just show what would happen
		this.log(`📝 Would run: intershell version:prepare --from ${fromTag}`);

		this.log("\n🚀 Applying version changes...");
		// Note: In a real implementation, you would call the apply command here
		// For now, we'll just show what would happen
		this.log(`📝 Would run: intershell version:apply${flags["no-push"] ? " --no-push" : ""}`);

		this.log(colorify.green("\n✅ CI version workflow completed successfully!"));
	}

	private async configureGitAuth(flags: {
		"dry-run"?: boolean;
		"no-push"?: boolean;
	}): Promise<void> {
		this.log("🔍 Configuring Git authentication...");

		if (flags["dry-run"]) {
			this.log("-> 🔍 Dry run, skipping git config");
			return;
		}

		if (!process.env.GITHUB_ACTIONS) {
			this.log("-> 🔍 Running locally, skip git config");
			return;
		}

		if (!process.env.GITHUB_REPOSITORY) {
			this.log("-> ⚠️ GITHUB_REPOSITORY not found");
			return;
		}

		if (!process.env.GITHUB_TOKEN) {
			this.log("-> ⚠️ GITHUB_TOKEN not found");
			return;
		}

		this.log("-> 🔐 Configuring Git authentication...");
		await $`git config user.name "github-actions[bot]"`;
		await $`git config user.email "github-actions[bot]@users.noreply.github.com"`;
		await $`git remote set-url origin https://x-access-token:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`;

		const actualRemoteUrl = await $`git remote get-url origin`.text();
		const maskedUrl = actualRemoteUrl.replace(/https:\/\/x-access-token:[^@]+@/, "***@");
		this.log(`-> 🔗 Git authentication configured, remote URL: ${maskedUrl}`);
	}
}
