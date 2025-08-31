/** biome-ignore-all lint/correctness/noUnusedPrivateClassMembers: wip */
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

	// @ts-expect-error wip
	private isWorkspaceLevelCommit(commit: ParsedCommitData): boolean {
		// Workspace-level commits affect the entire monorepo
		return (
			commit.files?.some(
				(file) =>
					file.startsWith(".") || // Hidden files (e.g., .gitignore, .env)
					file.includes("turbo.json") || // Turborepo configuration
					file.includes("package.json") || // Root package.json
					file.includes("docker-compose") || // Docker configuration
					file.includes("lefthook.yml") || // Git hooks
					file.includes("renovate.json") || // Dependency updates
					file.includes("i.config.ts") || // Intershell configuration
					file.includes("biome.json") || // Linting configuration
					file.includes("tsconfig.json") || // TypeScript configuration
					file.includes("README.md") || // Documentation
					file.includes("CHANGELOG.md") || // Changelog files
					file.includes("CLAUDE.md"), // Project documentation
			) ?? false
		);
	}

	// @ts-expect-error wip
	private isAppLevelCommit(commit: ParsedCommitData): boolean {
		// App-level commits affect specific applications
		return (
			commit.files?.some(
				(file) =>
					file.startsWith("apps/") || // Application directories
					file.includes("src/app/") || // Next.js app directory structure
					file.includes("src/pages/") || // Page-based routing
					file.includes("src/components/") || // App-specific components
					file.includes("src/styles/") || // App-specific styles
					file.includes("public/") || // Public assets
					file.includes("Dockerfile") || // App-specific Dockerfile
					file.includes("nginx.conf") || // App-specific nginx config
					file.includes("vite.config") || // Vite configuration
					file.includes("next.config") || // Next.js configuration
					file.includes("astro.config") || // Astro configuration
					file.includes("tailwind.config"), // Tailwind configuration
			) ?? false
		);
	}

	// @ts-expect-error wip
	private async hasInternalDependencyChanges(): Promise<boolean> {
		// For now, assume internal changes require root bump
		// This will be enhanced later with actual dependency analysis
		return true;
	}
}
