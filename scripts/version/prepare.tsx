import fs from "node:fs";
import { parseArgs } from "node:util";
import { $ } from "bun";
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
} from "intershell";
import { type ReactNode, useCallback } from "react";
import { colorify } from "../colorify";
import { renderAndExit } from "../render-and-exit";
import { StepProgressApp, type StepProgressStep } from "../step-progress";

const BUMP_TYPES = [
	"major",
	"minor",
	"patch",
	"none",
	"synced",
] as const satisfies readonly EntityPackageVersionBumpType[];

export interface VersionPrepareCliValues {
	readonly packageName: string;
	readonly from?: string;
	readonly to?: string;
	readonly fromVersion?: string;
	readonly toVersion?: string;
	readonly bumpType?: EntityPackageVersionBumpType;
	readonly quiet: boolean;
}

export function parseVersionPrepareCli(rest: readonly string[]): VersionPrepareCliValues {
	const { values } = parseArgs({
		args: [...rest],
		options: {
			package: { type: "string", short: "p", default: "root" },
			from: { type: "string", short: "f" },
			to: { type: "string", short: "t" },
			"from-version": { type: "string" },
			"to-version": { type: "string" },
			"bump-type": { type: "string" },
			quiet: { type: "boolean", short: "q", default: false },
		},
		strict: true,
	});

	const rawBump = values["bump-type"];
	if (rawBump !== undefined && !(BUMP_TYPES as readonly string[]).includes(rawBump)) {
		throw new Error(`Invalid --bump-type: ${rawBump}. Expected one of: ${BUMP_TYPES.join(", ")}`);
	}

	const pickString = (v: string | string[] | undefined): string | undefined => {
		if (v === undefined) return undefined;
		return Array.isArray(v) ? v[0] : v;
	};

	return {
		packageName: values.package ?? "root",
		from: values.from,
		to: values.to,
		fromVersion: pickString(values["from-version"]),
		toVersion: pickString(values["to-version"]),
		bumpType: rawBump as EntityPackageVersionBumpType | undefined,
		quiet: values.quiet === true,
	};
}

interface PrepareMutableState {
	readonly cli: VersionPrepareCliValues;
	packageInstance: EntityPackage | undefined;
	packageTags: EntityPackageTags | undefined;
	packageCommits: EntityPackageCommits | undefined;
	packageVersion: EntityPackageVersion | undefined;
	prefix: string | undefined;
	fromCommitResolved: string | undefined;
	toCommit: string | undefined;
	fromForCommits: string | undefined;
	commits: Awaited<ReturnType<EntityPackageCommits["getCommitsInRange"]>> | undefined;
	versionData: Awaited<ReturnType<EntityPackageVersion["calculateVersionData"]>> | undefined;
	changelogContent: string | undefined;
	doneEarly: boolean;
}

function createPrepareState(cli: VersionPrepareCliValues): PrepareMutableState {
	return {
		cli,
		packageInstance: undefined,
		packageTags: undefined,
		packageCommits: undefined,
		packageVersion: undefined,
		prefix: undefined,
		fromCommitResolved: undefined,
		toCommit: undefined,
		fromForCommits: undefined,
		commits: undefined,
		versionData: undefined,
		changelogContent: undefined,
		doneEarly: false,
	};
}

async function resolveCommitRange({
	packageTags,
	from,
	to,
	fromVersion,
	toVersion,
}: {
	readonly packageTags: EntityPackageTags;
	readonly from?: string;
	readonly to?: string;
	readonly fromVersion?: string;
	readonly toVersion?: string;
}): Promise<{ fromCommit: string; toCommit: string }> {
	let fromCommit: string;
	let toCommit: string;

	if (fromVersion) {
		const fromTag = `${await packageTags.getTagPrefix()}${fromVersion}`;
		console.log(`📝 Converting --from-version ${fromVersion} to tag: ${fromTag}`);
		fromCommit = await EntityTag.getBaseCommitSha(fromTag);
	} else if (from) {
		fromCommit = await EntityTag.getBaseCommitSha(from);
	} else {
		fromCommit = await packageTags.getBaseTagShaForPackage();
	}

	if (toVersion) {
		const toTag = `${await packageTags.getTagPrefix()}${toVersion}`;
		console.log(`📝 Converting --to-version ${toVersion} to tag: ${toTag}`);
		toCommit = await EntityTag.getBaseCommitSha(toTag);
	} else {
		toCommit = to ?? "HEAD";
	}

	return { fromCommit, toCommit };
}

function getVersionPrepareSteps(state: PrepareMutableState): readonly StepProgressStep[] {
	return [
		{
			label: "Validating packages",
			run: async () => {
				const validationResult = await EntityPackage.validateAllPackages();
				if (validationResult.length > 0) {
					throw new Error(
						`❌ Package validation failed!\nFound ${validationResult.length} validation errors:\n${validationResult.map((error) => `  📦 ${error}`).join("\n")}`,
					);
				}

				const allVersionedPackages = await EntityPackage.getVersionedPackages();
				const packageInstance = new EntityPackage(state.cli.packageName);
				const packageTags = new EntityPackageTags(packageInstance);
				const packageCommits = new EntityPackageCommits(packageInstance);
				const packageVersion = new EntityPackageVersion(
					packageInstance,
					packageCommits,
					packageTags,
				);
				const prefix = packageInstance.getTagSeriesName();

				if (!allVersionedPackages.includes(state.cli.packageName)) {
					throw new Error(
						`Package "${state.cli.packageName}" should not be versioned (private package). Only versioned packages can be processed.`,
					);
				}
				if (!prefix) {
					throw new Error(
						`Tag series name not found for ${state.cli.packageName}, this package should not be versioned (private package). Only versioned packages can be processed.`,
					);
				}

				state.packageInstance = packageInstance;
				state.packageTags = packageTags;
				state.packageCommits = packageCommits;
				state.packageVersion = packageVersion;
				state.prefix = prefix;
			},
		},
		{
			label: "Resolving revision range",
			run: async () => {
				const packageTags = state.packageTags;
				const packageInstance = state.packageInstance;
				const packageCommits = state.packageCommits;
				const packageVersion = state.packageVersion;
				const prefix = state.prefix;
				if (!packageTags || !packageInstance || !packageCommits || !packageVersion || !prefix) {
					throw new Error("Version prepare: internal state incomplete");
				}

				const { fromCommit, toCommit } = await resolveCommitRange({
					packageTags,
					from: state.cli.from,
					to: state.cli.to,
					fromVersion: state.cli.fromVersion,
					toVersion: state.cli.toVersion,
				});
				state.fromCommitResolved = fromCommit;
				state.toCommit = toCommit;

				const fromForCommits =
					state.cli.from || state.cli.fromVersion
						? fromCommit
						: await packageTags.getBaseTagShaForPackage();
				state.fromForCommits = fromForCommits;

				const commits = await packageCommits.getCommitsInRange(fromForCommits, toCommit);
				const versionData = await packageVersion.calculateVersionData(commits, state.cli.bumpType);

				const template = new DefaultChangelogTemplate(state.cli.packageName, prefix);
				const changelog = new EntityPackageChangelog(packageInstance, commits, {
					template,
					versionData,
					versionMode: true,
				});
				const changelogContent = changelog.generateMergedChangelog();

				state.commits = commits;
				state.versionData = versionData;
				state.changelogContent = changelogContent;

				if (commits.length === 0) {
					console.log(
						colorify.yellow(`📦 ${state.cli.packageName}: ${colorify.yellow("No commits found")}`),
					);
					state.doneEarly = true;
					return;
				}
				if (!versionData.shouldBump) {
					console.log(
						colorify.yellow(
							`📦 ${state.cli.packageName}: ${colorify.yellow("No version bump needed")} (${versionData.bumpType})`,
						),
					);
					state.doneEarly = true;
				}
			},
		},
		{
			label: "Writing version and changelog",
			run: async () => {
				if (state.doneEarly) return;
				const packageInstance = state.packageInstance;
				const versionData = state.versionData;
				const changelogContent = state.changelogContent;
				const commits = state.commits;
				const prefix = state.prefix;
				if (
					!packageInstance ||
					!versionData ||
					changelogContent === undefined ||
					!commits ||
					!prefix
				) {
					throw new Error("Version prepare: internal state incomplete");
				}

				await packageInstance.writeVersion(versionData.targetVersion);
				await $`bun install`;
				await packageInstance.writeChangelog(changelogContent);

				const tagName = `${prefix}${versionData.targetVersion}`;
				const versionCommitMessage = `release(${state.cli.packageName}): ${tagName} [${versionData.bumpType}] (${versionData.currentVersion} => ${versionData.targetVersion})\n\n📝 Commits processed: ${commits.length}\n📝 Changelog updated: (${packageInstance.getChangelogPath()})`;

				await Bun.write(".git/COMMIT_EDITMSG", versionCommitMessage);
				console.log(
					`${colorify.green("📝 Commit message written in")} ${colorify.blue(".git/COMMIT_EDITMSG")}:`,
					`\n\t${versionCommitMessage.replace(/\n/g, "\n\t")}`,
				);
			},
		},
		{
			label: "Finalizing metadata",
			run: async () => {
				if (state.doneEarly) return;
				const packageInstance = state.packageInstance;
				if (!packageInstance) throw new Error("Version prepare: internal state incomplete");

				try {
					const services = await new EntityCompose("docker-compose.yml").getServices();
					const servicesToDeploy = services
						.filter((s) => s.name === state.cli.packageName)
						.map((s) => s.name);
					if (servicesToDeploy.length > 0) {
						const servicesToDeployNames = servicesToDeploy.join(",");
						if (process.env.GITHUB_OUTPUT) {
							await fs.promises.appendFile(
								process.env.GITHUB_OUTPUT,
								`packages-to-deploy=${servicesToDeployNames}\n`,
							);
						}
					}
				} catch (error) {
					console.log(
						colorify.yellow(
							`📦 ${state.cli.packageName}: ${colorify.yellow("No services found")}: ${error}`,
						),
					);
				}

				console.log(
					"\n📝 Next steps:\n" +
						"1. Review the generated changelogs\n" +
						`2. Run ${colorify.blue("bun run release apply")} to commit, tag and push the versions (you can turn it off using --no-push)`,
				);
			},
		},
	];
}

function VersionPrepareInkApp({ state }: { readonly state: PrepareMutableState }): ReactNode {
	const resolveSteps = useCallback(() => getVersionPrepareSteps(state), [state]);
	return (
		<StepProgressApp completedHeading="Version prepare completed" resolveSteps={resolveSteps} />
	);
}

export async function runVersionPrepare(rest: readonly string[]): Promise<void> {
	const cli = parseVersionPrepareCli(rest);
	const state = createPrepareState(cli);
	const steps = getVersionPrepareSteps(state);

	if (cli.quiet) {
		for (const step of steps) await step.run();
		return;
	}

	await renderAndExit(<VersionPrepareInkApp state={state} />);
}
