import type { VersionBumpType } from "../changelog/types";
import type { ParsedCommitData } from "../commit/types";
import { EntityPackages } from "../packages/packages";
import type { VersionHistory } from "./types";

export class EntityVersion {
	constructor(private readonly packageName: string) {}

	// Version calculation and management
	async getCurrentVersion(): Promise<string> {
		const packageInstance = new EntityPackages(this.packageName);
		const version = packageInstance.readVersion();
		if (!version) {
			throw new Error(`No version found for package ${this.packageName}`);
		}
		return version;
	}

	async getNextVersion(bumpType: "major" | "minor" | "patch"): Promise<string> {
		const currentVersion = await this.getCurrentVersion();
		return this.calculateNextVersion(currentVersion, bumpType);
	}

	private calculateNextVersion(
		currentVersion: string,
		bumpType: "major" | "minor" | "patch",
	): string {
		const [major, minor, patch] = currentVersion.split(".").map(Number);
		if (Number.isNaN(major) || Number.isNaN(minor) || Number.isNaN(patch)) {
			throw new Error(`Invalid version: ${currentVersion}`);
		}

		switch (bumpType) {
			case "major":
				return `${major + 1}.0.0`;
			case "minor":
				return `${major}.${minor + 1}.0`;
			case "patch":
				return `${major}.${minor}.${patch + 1}`;
			default:
				throw new Error(`Invalid bump type: ${bumpType}`);
		}
	}

	// Version history and tracking
	async getVersionHistory(): Promise<VersionHistory> {
		// TODO: Implement tag series integration
		throw new Error("Not implemented yet");
	}

	async getLatestVersion(): Promise<string | null> {
		const history = await this.getVersionHistory();
		return history.latestVersion || null;
	}

	async versionExists(version: string): Promise<boolean> {
		const history = await this.getVersionHistory();
		return history.versions.some((v) => v.version === version);
	}

	// Version bump type calculation (moved from EntityChangelog)
	async calculateBumpType(commits: ParsedCommitData[]): Promise<VersionBumpType> {
		if (this.packageName === "root") {
			return await this.calculateRootBumpType(commits);
		}
		return await this.calculatePackageBumpType(commits);
	}

	private async calculateRootBumpType(_commits: ParsedCommitData[]): Promise<VersionBumpType> {
		// TODO: Implement root package bump logic
		throw new Error("Root bump logic not implemented yet");
	}

	private async calculatePackageBumpType(_commits: ParsedCommitData[]): Promise<VersionBumpType> {
		// TODO: Implement package-specific bump logic
		throw new Error("Package bump logic not implemented yet");
	}

	// private isWorkspaceLevelCommit(_commit: ParsedCommitData): boolean {
	// 	// TODO: Implement workspace level detection
	// 	return false;
	// }

	// private isAppLevelCommit(_commit: ParsedCommitData): boolean {
	// 	// TODO: Implement app level detection
	// 	return false;
	// }

	// private async hasInternalDependencyChanges(): Promise<boolean> {
	// 	// TODO: Implement internal dependency change detection
	// 	return false;
	// }
}
