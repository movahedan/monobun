import fs from "node:fs";
import { Command, Flags } from "@oclif/core";
import { colorify } from "@repo/intershell/core";
import {
	DefaultChangelogTemplate,
	EntityCompose,
	EntityPackage,
	EntityPackageChangelog,
	EntityPackageCommits,
	EntityPackageTags,
	EntityPackageVersion,
	type EntityPackageVersionBumpType,
	EntityTag,
} from "@repo/intershell/entities";
import { $ } from "bun";

const bumpTypeOptions = ["major", "minor", "patch", "none"] as EntityPackageVersionBumpType[];

export default class VersionPrepare extends Command {
	static description = "Prepare version bumps and generate changelogs for packages";

	static examples = [
		"intershell version:prepare",
		"intershell version:prepare --package root",
		"intershell version:prepare --from v1.0.0 --to HEAD",
		"intershell version:prepare --from-version 1.0.0 --to-version 1.2.0",
		"intershell version:prepare --package @repo/intershell --from-version 1.0.0",
		"intershell version:prepare --package root --bump-type major",
		"intershell version:prepare --bump-type patch",
	];

	static flags = {
		package: Flags.string({
			char: "p",
			description: "Package name to process (default: all packages)",
			default: "root",
		}),
		from: Flags.string({
			char: "f",
			description: "Start commit/tag for changelog generation",
		}),
		to: Flags.string({
			char: "t",
			description: "End commit/tag for changelog generation (default: HEAD)",
		}),
		"from-version": Flags.string({
			description:
				"Start version for changelog generation (converts to appropriate tag based on package)",
		}),
		"to-version": Flags.string({
			description:
				"End version for changelog generation (converts to appropriate tag based on package)",
		}),
		"bump-type": Flags.string({
			description: "Override version bump type (major, minor, patch, none)",
			options: bumpTypeOptions,
		}),
	};

	async run(): Promise<void> {
		const { flags } = await this.parse(VersionPrepare);
		const packageName = flags.package || "root";

		this.log("🔍 Validating package configurations...");
		const validationResult = await EntityPackage.validateAllPackages();
		if (validationResult.length > 0) {
			this.error(
				`❌ Package validation failed!\nFound ${validationResult.length} validation errors:\n${validationResult.map((error) => `  📦 ${error}`).join("\n")}`,
			);
		}
		this.log(colorify.green("✅ All packages passed validation"));

		const allVersionedPackages = await EntityPackage.getVersionedPackages();
		const packageInstance = new EntityPackage(packageName);
		const packageTags = new EntityPackageTags(packageInstance);
		const packageCommits = new EntityPackageCommits(packageInstance);
		const packageVersion = new EntityPackageVersion(packageInstance, packageCommits, packageTags);
		const prefix = packageInstance.getTagSeriesName();

		if (!allVersionedPackages.includes(packageName)) {
			throw new Error(
				`Package "${packageName}" should not be versioned (private package). Only versioned packages can be processed.`,
			);
		}
		if (!prefix) {
			throw new Error(
				`Tag series name not found for ${packageName}, this package should not be versioned (private package). Only versioned packages can be processed.`,
			);
		}

		this.log(`🚀 Starting version preparation for package ${colorify.blue(packageName)}`);
		const { fromCommit, toCommit } = await this.resolveCommitRange({
			packageTags,
			from: flags.from,
			to: flags.to,
			fromVersion: Array.isArray(flags["from-version"])
				? flags["from-version"][0]
				: flags["from-version"],
			toVersion: Array.isArray(flags["to-version"]) ? flags["to-version"][0] : flags["to-version"],
		});

		const from =
			flags.from || flags["from-version"]
				? fromCommit
				: await packageTags.getBaseTagShaForPackage();

		this.log(`📝 Generating changelog from ${colorify.blue(from)} to ${colorify.blue(toCommit)}`);

		// Get commits and version data using EntityPackageVersion
		const commits = await packageCommits.getCommitsInRange(from, toCommit);
		const overrideBumpType = flags["bump-type"] as "major" | "minor" | "patch" | "none" | undefined;
		const versionData = await packageVersion.calculateVersionData(commits, overrideBumpType);

		// Create changelog with commits
		const template = new DefaultChangelogTemplate(packageName, prefix);
		const changelog = new EntityPackageChangelog(packageInstance, commits, {
			template,
			versionData,
			versionMode: true,
		});
		const changelogContent = changelog.generateMergedChangelog();

		if (commits.length === 0) {
			this.log(colorify.yellow(`📦 ${packageName}: ${colorify.yellow("No commits found")}`));
			return;
		}
		if (!versionData.shouldBump) {
			this.log(
				colorify.yellow(
					`📦 ${packageName}: ${colorify.yellow("No version bump needed")} (${versionData.bumpType})`,
				),
			);
			return;
		}

		this.log(
			`🔄 Updating package version from ${versionData.currentVersion} to ${versionData.targetVersion} in ${packageInstance.getJsonPath()}`,
		);
		await packageInstance.writeVersion(versionData.targetVersion);
		await $`bun install`;
		await packageInstance.writeChangelog(changelogContent);

		const tagName = `${prefix}${versionData.targetVersion}`;
		const versionCommitMessage = `release(${packageName}): ${tagName} [${versionData.bumpType}] (${versionData.currentVersion} => ${versionData.targetVersion})\n\n📝 Commits processed: ${commits.length}\n📝 Changelog updated: (${packageInstance.getChangelogPath()})`;
		this.log(
			`📦 (${colorify.yellow(versionData.currentVersion)} => ${colorify.green(versionData.targetVersion)}) ${colorify.blue(packageName)}: ${versionData.bumpType} (${colorify.green(packageInstance.getChangelogPath())})`,
		);
		await Bun.write(".git/COMMIT_EDITMSG", versionCommitMessage);
		this.log(
			`${colorify.green("📝 Commit message written in")} ${colorify.blue(".git/COMMIT_EDITMSG")}:`,
			`\n\t${versionCommitMessage.replace(/\n/g, "\n\t")}`,
		);

		const services = await new EntityCompose("docker-compose.yml").getServices();
		const servicesToDeploy = services.filter((s) => s.name === packageName).map((s) => s.name);
		if (servicesToDeploy) {
			const servicesToDeployNames = servicesToDeploy.join(",");
			if (process.env.GITHUB_OUTPUT) {
				await fs.promises.appendFile(
					process.env.GITHUB_OUTPUT,
					`packages-to-deploy=${servicesToDeployNames}\n`,
				);
			}
			this.log(`\n🚀 Packages to deploy: ${colorify.blue(servicesToDeployNames)}`);
		}

		this.log(
			"\n📝 Next steps:\n" +
				"1. Review the generated changelogs\n" +
				`2. Run ${colorify.blue("intershell version:apply")} to commit, tag and push the versions (you can turn it off using --no-push)`,
		);
		this.log(colorify.green("✅ Version preparation completed!"));
	}

	/**
	 * Resolves from/to commits, handling version-to-tag conversion when needed
	 */
	private async resolveCommitRange({
		packageTags,
		from,
		to,
		fromVersion,
		toVersion,
	}: {
		packageTags: EntityPackageTags;
		from?: string;
		to?: string;
		fromVersion?: string;
		toVersion?: string;
	}): Promise<{ fromCommit: string; toCommit: string }> {
		let fromCommit: string;
		let toCommit: string;
		// Handle --from-version conversion
		if (fromVersion) {
			const fromTag = `${await packageTags.getTagPrefix()}${fromVersion}`;
			this.log(`📝 Converting --from-version ${fromVersion} to tag: ${fromTag}`);
			fromCommit = await EntityTag.getBaseCommitSha(fromTag);
		} else if (from) {
			fromCommit = await EntityTag.getBaseCommitSha(from);
		} else {
			// No --from specified, let EntityPackageTags auto-find the correct base SHA
			// This will use the latest tag if it exists, or fall back to first commit for first-time versioning
			fromCommit = await packageTags.getBaseTagShaForPackage();
		}

		// Handle --to-version conversion
		if (toVersion) {
			const toTag = `${await packageTags.getTagPrefix()}${toVersion}`;
			this.log(`📝 Converting --to-version ${toVersion} to tag: ${toTag}`);
			toCommit = await EntityTag.getBaseCommitSha(toTag);
		} else {
			toCommit = to || "HEAD";
		}

		return { fromCommit, toCommit };
	}
}
