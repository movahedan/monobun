import { describe, expect, test } from "bun:test";
import type { ParsedCommitData } from "../commit";
import { EntityVersion } from "./version";

describe("EntityVersion", () => {
	test("should create instance", () => {
		const entityVersion = new EntityVersion("api");
		expect(entityVersion).toBeDefined();
		expect(entityVersion.packageName).toBe("api");
	});

	test("should create root instance", () => {
		const entityVersion = new EntityVersion("root");
		expect(entityVersion).toBeDefined();
		expect(entityVersion.packageName).toBe("root");
	});

	test("should calculate bump type for regular package", async () => {
		const entityVersion = new EntityVersion("api");

		const commits: ParsedCommitData[] = [
			{
				message: { type: "feat", description: "add new feature", isBreaking: false },
				files: ["src/feature.ts"],
			} as ParsedCommitData,
		];

		const versionData = await entityVersion.calculateVersionData("1.0.0", "1.0.0", commits);
		expect(versionData.bumpType).toBe("minor");
	});

	test("should calculate bump type for breaking changes", async () => {
		const entityVersion = new EntityVersion("api");

		const commits: ParsedCommitData[] = [
			{
				message: { type: "feat", description: "add new feature", isBreaking: true },
				files: ["src/feature.ts"],
			} as ParsedCommitData,
		];

		const versionData = await entityVersion.calculateVersionData("1.0.0", "1.0.0", commits);
		expect(versionData.bumpType).toBe("major");
	});

	test("should calculate bump type for patch changes", async () => {
		const entityVersion = new EntityVersion("api");

		const commits: ParsedCommitData[] = [
			{
				message: { type: "fix", description: "fix bug", isBreaking: false },
				files: ["src/bug.ts"],
			} as ParsedCommitData,
		];

		const versionData = await entityVersion.calculateVersionData("1.0.0", "1.0.0", commits);
		expect(versionData.bumpType).toBe("patch");
	});

	test("should return none for empty commits", async () => {
		const entityVersion = new EntityVersion("api");
		const versionData = await entityVersion.calculateVersionData("1.0.0", "1.0.0", []);
		expect(versionData.bumpType).toBe("none");
	});

	test("should calculate version data for first version", async () => {
		const entityVersion = new EntityVersion("api");

		const versionData = await entityVersion.calculateVersionData("0.0.0", "0.0.0", []);

		expect(versionData.shouldBump).toBe(true);
		expect(versionData.targetVersion).toBe("0.1.0");
		expect(versionData.bumpType).toBe("minor");
		expect(versionData.reason).toBe("First version bump from 0.0.0");
	});

	test("should not bump when no commits", async () => {
		const entityVersion = new EntityVersion("api");

		const versionData = await entityVersion.calculateVersionData("1.0.0", "1.0.0", []);

		expect(versionData.shouldBump).toBe(false);
		expect(versionData.targetVersion).toBe("1.0.0");
		expect(versionData.bumpType).toBe("none");
		expect(versionData.reason).toBe("No commits in range");
	});

	test("should throw error when version on disk is higher", async () => {
		const entityVersion = new EntityVersion("api");

		await expect(entityVersion.calculateVersionData("2.0.0", "1.0.0", [])).rejects.toThrow(
			"Package version on disk (2.0.0) is higher than current git tag version (1.0.0)",
		);
	});

	test("should calculate bump type for root package", async () => {
		const entityVersion = new EntityVersion("root");

		const commits: ParsedCommitData[] = [
			{
				message: { type: "feat", description: "add feature", isBreaking: false, scopes: ["root"] },
				files: ["package.json"],
			} as ParsedCommitData,
		];

		const versionData = await entityVersion.calculateVersionData("1.0.0", "1.0.0", commits);
		expect(versionData.bumpType).toBe("minor");
	});
});
