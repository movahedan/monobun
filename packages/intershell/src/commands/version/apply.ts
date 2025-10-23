import { Command, Flags } from "@oclif/core";
import { colorify } from "@repo/intershell/core";
import { EntityPackage, EntityPackageTags } from "@repo/intershell/entities";
import { $ } from "bun";

export default class VersionApply extends Command {
	static description = "Create git version tags and commit version changes";

	static examples = [
		"intershell version:apply",
		"intershell version:apply --message 'Release version 1.2.3'",
		"intershell version:apply --no-push",
	];

	static flags = {
		package: Flags.string({
			char: "p",
			description: "Package name to process (default: all packages)",
		}),
		message: Flags.string({
			char: "m",
			description: "Tag message",
		}),
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
		const { flags } = await this.parse(VersionApply);
		const packageName = flags.package || "root";
		this.log(`📦 Processing package: ${colorify.blue(packageName)}`);

		const packageInstance = new EntityPackage(packageName);
		const version = packageInstance.readVersion();
		const tagSeriesName = packageInstance.getTagSeriesName();
		const tagName = `${tagSeriesName}${version}`;

		if (!tagSeriesName) {
			throw new Error(
				`Tag series name not found for ${packageName}, this package should not be versioned (private package). Only versioned packages can be processed.`,
			);
		}

		if (flags["dry-run"]) {
			this.log(colorify.yellow("🔍 Dry run mode - would execute:"));
			this.log(colorify.gray(`  • Commit version changes for package ${packageName}`));
			this.log(colorify.gray(`  • Create tag ${tagName} for ${packageName}`));
			if (!flags["no-push"]) {
				this.log(colorify.gray("  • Push commit changes to remote"));
				this.log(colorify.gray("  • Push tags to remote"));
			}
			return;
		}

		this.log("📁 Adding all changes...");
		await $`git add .`;
		const statusResult = await $`git status --porcelain`.nothrow();
		const hasChanges = statusResult.text().trim() !== "";

		if (!hasChanges) {
			this.log(colorify.yellow("⚠️ No changes to commit"));
			return;
		}

		await this.commitVersionChanges();
		await this.createTagsForPackage(packageName, flags);
		await this.pushChanges(flags);

		this.log(colorify.green("✅ Version apply operation completed successfully!"));
	}

	private async commitVersionChanges(): Promise<void> {
		const commitMessage = await Bun.file(".git/COMMIT_EDITMSG").text();

		this.log("📝 Commit message:");
		this.log(commitMessage);

		await $`git commit -m "${commitMessage}"`;

		this.log(colorify.green("✅ Successfully committed version changes"));
		const commitHash = await $`git rev-parse --short HEAD`.text();
		this.log(`🏷️ Commit hash: ${commitHash.trim()}`);
	}

	private async createTagsForPackage(
		packageName: string,
		flags: {
			message?: string;
			"no-push"?: boolean;
			"dry-run"?: boolean;
		},
	): Promise<void> {
		const packageInstance = new EntityPackage(packageName);
		const version = packageInstance.readVersion();
		if (!version) {
			throw new Error(`Version not found for ${packageName}`);
		}
		const packageTags = new EntityPackageTags(packageInstance);

		// Check if tag already exists
		const tagExists = await packageTags.packageTagExists(version);
		if (tagExists) {
			const prefix = await packageTags.getTagPrefix();
			const tagName = `${prefix}${version}`;
			this.log(`⏭️ Tag already exists: ${tagName}`);
			return;
		}

		this.log(`🏷️ Creating tag for ${packageName}: ${version}`);

		try {
			await packageTags.createPackageTag(
				version,
				flags.message || `Release ${packageName} version ${version}`,
			);

			const prefix = await packageTags.getTagPrefix();
			const tagName = `${prefix}${version}`;
			this.log(`✅ Created tag: ${tagName}`);
		} catch (error) {
			throw new Error(
				`Failed to create tag for ${packageName}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	private async pushChanges(flags: { "no-push"?: boolean; "dry-run"?: boolean }): Promise<void> {
		if (flags["no-push"]) {
			this.log(colorify.yellow("⚠️ Skipping push (--no-push specified)"));
			return;
		}

		if (flags["dry-run"]) {
			this.log(colorify.yellow("⚠️ Skipping push (--dry-run specified)"));
			return;
		}

		try {
			this.log("📤 Pushing commit changes to remote...");
			await $`git push --follow-tags`;
			this.log("✅ Pushed commit changes to remote");
		} catch (error) {
			throw new Error(
				`Failed to push commit changes to remote: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}
}
