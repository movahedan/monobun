import { describe, expect, test } from "bun:test";
import type { ParsedCommitData } from "../commit/types.js";
import { EntityVersion } from "./version.js";

describe("EntityVersion - Commit Level Detection", () => {
	const entityVersion = new EntityVersion("root");

	// Helper function to create mock commit data
	const createMockCommit = (files: string[]): ParsedCommitData => ({
		message: {
			subject: "test commit",
			type: "feat",
			scopes: [],
			description: "test commit",
			bodyLines: [],
			isBreaking: false,
			isMerge: false,
			isDependency: false,
		},
		files,
	});

	describe("isWorkspaceLevelCommit", () => {
		test("should detect workspace-level commits", () => {
			const workspaceCommits = [
				createMockCommit([".gitignore"]),
				createMockCommit(["turbo.json"]),
				createMockCommit(["package.json"]),
				createMockCommit(["docker-compose.yml"]),
				createMockCommit(["lefthook.yml"]),
				createMockCommit(["renovate.json"]),
				createMockCommit(["i.config.ts"]),
				createMockCommit(["biome.json"]),
				createMockCommit(["tsconfig.json"]),
				createMockCommit(["README.md"]),
				createMockCommit(["CHANGELOG.md"]),
				createMockCommit(["CLAUDE.md"]),
			];

			for (const commit of workspaceCommits) {
				expect(
					(
						entityVersion as unknown as {
							isWorkspaceLevelCommit: (commit: ParsedCommitData) => boolean;
						}
					).isWorkspaceLevelCommit(commit),
				).toBe(true);
			}
		});

		test("should not detect non-workspace commits", () => {
			const nonWorkspaceCommits = [
				createMockCommit(["apps/admin/src/app/page.tsx"]),
				createMockCommit(["packages/ui/src/button/button.tsx"]),
				createMockCommit(["src/components/Header.tsx"]),
			];

			for (const commit of nonWorkspaceCommits) {
				expect(
					(
						entityVersion as unknown as {
							isWorkspaceLevelCommit: (commit: ParsedCommitData) => boolean;
						}
					).isWorkspaceLevelCommit(commit),
				).toBe(false);
			}
		});

		test("should handle commits with no files", () => {
			const commitWithNoFiles = createMockCommit([]);
			expect(
				(
					entityVersion as unknown as {
						isWorkspaceLevelCommit: (commit: ParsedCommitData) => boolean;
					}
				).isWorkspaceLevelCommit(commitWithNoFiles),
			).toBe(false);
		});

		test("should handle commits with undefined files", () => {
			const commitWithUndefinedFiles: ParsedCommitData = {
				message: {
					subject: "test commit",
					type: "feat",
					scopes: [],
					description: "test commit",
					bodyLines: [],
					isBreaking: false,
					isMerge: false,
					isDependency: false,
				},
			};
			expect(
				(
					entityVersion as unknown as {
						isWorkspaceLevelCommit: (commit: ParsedCommitData) => boolean;
					}
				).isWorkspaceLevelCommit(commitWithUndefinedFiles),
			).toBe(false);
		});
	});

	describe("isAppLevelCommit", () => {
		test("should detect app-level commits", () => {
			const appCommits = [
				createMockCommit(["apps/admin/src/app/page.tsx"]),
				createMockCommit(["apps/storefront/src/components/Header.tsx"]),
				createMockCommit(["apps/api/src/index.ts"]),
				createMockCommit(["apps/docs-astro/src/pages/index.astro"]),
				createMockCommit(["src/app/layout.tsx"]),
				createMockCommit(["src/pages/index.tsx"]),
				createMockCommit(["src/components/Button.tsx"]),
				createMockCommit(["src/styles/globals.css"]),
				createMockCommit(["public/favicon.ico"]),
				createMockCommit(["Dockerfile"]),
				createMockCommit(["nginx.conf"]),
				createMockCommit(["vite.config.ts"]),
				createMockCommit(["next.config.js"]),
				createMockCommit(["astro.config.ts"]),
				createMockCommit(["tailwind.config.js"]),
			];

			for (const commit of appCommits) {
				expect(
					(
						entityVersion as unknown as { isAppLevelCommit: (commit: ParsedCommitData) => boolean }
					).isAppLevelCommit(commit),
				).toBe(true);
			}
		});

		test("should not detect non-app commits", () => {
			const nonAppCommits = [
				createMockCommit([".gitignore"]),
				createMockCommit(["turbo.json"]),
				createMockCommit(["packages/ui/src/button/button.tsx"]),
				createMockCommit(["scripts/version-prepare.ts"]),
			];

			for (const commit of nonAppCommits) {
				expect(
					(
						entityVersion as unknown as { isAppLevelCommit: (commit: ParsedCommitData) => boolean }
					).isAppLevelCommit(commit),
				).toBe(false);
			}
		});

		test("should handle commits with no files", () => {
			const commitWithNoFiles = createMockCommit([]);
			expect(
				(
					entityVersion as unknown as { isAppLevelCommit: (commit: ParsedCommitData) => boolean }
				).isAppLevelCommit(commitWithNoFiles),
			).toBe(false);
		});

		test("should handle commits with undefined files", () => {
			const commitWithUndefinedFiles: ParsedCommitData = {
				message: {
					subject: "test commit",
					type: "feat",
					scopes: [],
					description: "test commit",
					bodyLines: [],
					isBreaking: false,
					isMerge: false,
					isDependency: false,
				},
			};
			expect(
				(
					entityVersion as unknown as { isAppLevelCommit: (commit: ParsedCommitData) => boolean }
				).isAppLevelCommit(commitWithUndefinedFiles),
			).toBe(false);
		});
	});

	describe("Mixed commit scenarios", () => {
		test("should handle commits with both workspace and app files", () => {
			const mixedCommit = createMockCommit([
				"turbo.json", // workspace-level
				"apps/admin/src/app/page.tsx", // app-level
			]);

			expect(
				(
					entityVersion as unknown as {
						isWorkspaceLevelCommit: (commit: ParsedCommitData) => boolean;
					}
				).isWorkspaceLevelCommit(mixedCommit),
			).toBe(true);
			expect(
				(
					entityVersion as unknown as { isAppLevelCommit: (commit: ParsedCommitData) => boolean }
				).isAppLevelCommit(mixedCommit),
			).toBe(true);
		});

		test("should handle commits with package files", () => {
			const packageCommit = createMockCommit([
				"packages/ui/src/button/button.tsx",
				"packages/utils/src/cn.ts",
			]);

			expect(
				(
					entityVersion as unknown as {
						isWorkspaceLevelCommit: (commit: ParsedCommitData) => boolean;
					}
				).isWorkspaceLevelCommit(packageCommit),
			).toBe(false);
			expect(
				(
					entityVersion as unknown as { isAppLevelCommit: (commit: ParsedCommitData) => boolean }
				).isAppLevelCommit(packageCommit),
			).toBe(false);
		});
	});
});
