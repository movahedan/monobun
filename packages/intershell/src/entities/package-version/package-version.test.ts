import { describe, expect, test } from "bun:test";
import type { ParsedCommitData } from "../commit";
import { EntityPackage } from "../package";
import { EntityPackageCommits } from "../package-commits";
import { EntityPackageTags } from "../package-tags";
import { EntityPackageVersion } from "./package-version";

// Helper function to create EntityPackageVersion instances
function createEntityPackageVersion(packageName: string): EntityPackageVersion {
	const packageInstance = new EntityPackage(packageName);
	const commitPackage = new EntityPackageCommits(packageInstance);
	const tagPackage = new EntityPackageTags(packageInstance);
	return new EntityPackageVersion(packageInstance, commitPackage, tagPackage);
}

describe("EntityPackageVersion", () => {
	test("should create instance", () => {
		const EntityPackageVersion = createEntityPackageVersion("api");
		expect(EntityPackageVersion).toBeDefined();
	});

	test("should create root instance", () => {
		const EntityPackageVersion = createEntityPackageVersion("root");
		expect(EntityPackageVersion).toBeDefined();
	});

	test("should calculate bump type for regular package", async () => {
		const EntityPackageVersion = createEntityPackageVersion("api");

		const commits: ParsedCommitData[] = [
			{
				message: { type: "feat", description: "add new feature", isBreaking: false },
				files: ["src/feature.ts"],
			} as ParsedCommitData,
		];

		const versionData = await EntityPackageVersion.calculateVersionData("1.0.0", "1.0.0", commits);
		expect(versionData.bumpType).toBe("minor");
	});

	test("should calculate bump type for breaking changes", async () => {
		const EntityPackageVersion = createEntityPackageVersion("api");

		const commits: ParsedCommitData[] = [
			{
				message: { type: "feat", description: "add new feature", isBreaking: true },
				files: ["src/feature.ts"],
			} as ParsedCommitData,
		];

		const versionData = await EntityPackageVersion.calculateVersionData("1.0.0", "1.0.0", commits);
		expect(versionData.bumpType).toBe("major");
	});

	test("should calculate bump type for patch changes", async () => {
		const EntityPackageVersion = createEntityPackageVersion("api");

		const commits: ParsedCommitData[] = [
			{
				message: { type: "fix", description: "fix bug", isBreaking: false },
				files: ["src/bug.ts"],
			} as ParsedCommitData,
		];

		const versionData = await EntityPackageVersion.calculateVersionData("1.0.0", "1.0.0", commits);
		expect(versionData.bumpType).toBe("patch");
	});

	test("should return none for empty commits", async () => {
		const EntityPackageVersion = createEntityPackageVersion("api");
		const versionData = await EntityPackageVersion.calculateVersionData("1.0.0", "1.0.0", []);
		expect(versionData.bumpType).toBe("none");
	});

	test("should calculate version data for first version", async () => {
		const EntityPackageVersion = createEntityPackageVersion("api");

		const versionData = await EntityPackageVersion.calculateVersionData("0.0.0", "0.0.0", []);

		expect(versionData.shouldBump).toBe(true);
		expect(versionData.targetVersion).toBe("0.1.0");
		expect(versionData.bumpType).toBe("minor");
		expect(versionData.reason).toBe("First version bump from 0.0.0");
	});

	test("should not bump when no commits", async () => {
		const EntityPackageVersion = createEntityPackageVersion("api");

		const versionData = await EntityPackageVersion.calculateVersionData("1.0.0", "1.0.0", []);

		expect(versionData.shouldBump).toBe(false);
		expect(versionData.targetVersion).toBe("1.0.0");
		expect(versionData.bumpType).toBe("none");
		expect(versionData.reason).toBe("No commits in range");
	});

	test("should throw error when version on disk is higher", async () => {
		const EntityPackageVersion = createEntityPackageVersion("api");

		await expect(EntityPackageVersion.calculateVersionData("2.0.0", "1.0.0", [])).rejects.toThrow(
			"Package version on disk (2.0.0) is higher than current git tag version (1.0.0)",
		);
	});

	test("should calculate bump type for root package", async () => {
		const EntityPackageVersion = createEntityPackageVersion("root");

		const commits: ParsedCommitData[] = [
			{
				message: { type: "feat", description: "add feature", isBreaking: false, scopes: ["root"] },
				files: ["package.json"],
			} as ParsedCommitData,
		];

		const versionData = await EntityPackageVersion.calculateVersionData("1.0.0", "1.0.0", commits);
		expect(versionData.bumpType).toBe("minor");
	});
});
