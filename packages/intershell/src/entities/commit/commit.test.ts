import { describe, expect, it, mock } from "bun:test";
import { EntityCommit, EntityCommitClass } from "./commit";

// Mock bun:test
mock.module("bun", () => ({
	$: mock((_strings: TemplateStringsArray, ..._values: unknown[]) =>
		Promise.resolve({
			stdout: { toString: () => "main" },
			exitCode: 0,
			text: () => "main",
		}),
	),
}));

describe("EntityCommit", () => {
	describe("instance", () => {
		it("should be available as singleton instance", () => {
			expect(EntityCommit).toBeDefined();
			expect(typeof EntityCommit.validateCommitMessage).toBe("function");
			expect(typeof EntityCommit.formatCommitMessage).toBe("function");
		});
	});

	describe("static parseByMessage", () => {
		it("should parse conventional commit message", () => {
			const message = "feat(ui): add new button component";
			const result = EntityCommitClass.parseByMessage(message);

			expect(result.type).toBe("feat");
			expect(result.scopes).toEqual(["ui"]);
			expect(result.description).toBe("add new button component");
			expect(result.isBreaking).toBe(false);
			expect(result.isMerge).toBe(false);
			expect(result.isDependency).toBe(false);
		});

		it("should parse merge commit message", () => {
			const message = "Merge pull request #123 from feature/new-feature";
			const result = EntityCommitClass.parseByMessage(message);

			expect(result.type).toBe("merge");
			expect(result.isMerge).toBe(true);
		});

		it("should parse dependency update message", () => {
			const message = "deps(deps): update react to v18";
			const result = EntityCommitClass.parseByMessage(message);

			expect(result.type).toBe("deps");
			expect(result.isDependency).toBe(true);
		});
	});

	describe("validateCommitMessage", () => {
		it("should validate valid conventional commit", () => {
			const message = "feat(root): add new button component";
			const errors = EntityCommit.validateCommitMessage(message);

			expect(errors).toEqual([]);
		});

		it("should reject invalid commit type", () => {
			const message = "invalid(root): add new button component";
			const errors = EntityCommit.validateCommitMessage(message);

			expect(errors.length).toBeGreaterThan(0);
			expect(errors.some((error) => error.includes("invalid type"))).toBe(true);
		});

		it("should reject invalid scope", () => {
			const message = "feat(invalid-scope): add new button component";
			const errors = EntityCommit.validateCommitMessage(message);

			expect(errors.length).toBeGreaterThan(0);
			expect(errors.some((error) => error.includes("invalid scope"))).toBe(true);
		});

		it("should reject description that starts with type", () => {
			const message = "feat(root): feat add new button component";
			const errors = EntityCommit.validateCommitMessage(message);

			expect(errors.length).toBeGreaterThan(0);
			expect(errors.some((error) => error.includes("should not start with a type"))).toBe(true);
		});

		it("should reject description that ends with period", () => {
			const message = "feat(root): add new button component.";
			const errors = EntityCommit.validateCommitMessage(message);

			expect(errors.length).toBeGreaterThan(0);
			expect(errors.some((error) => error.includes("should not end with a period"))).toBe(true);
		});
	});

	describe("formatCommitMessage", () => {
		it("should format conventional commit message", () => {
			const messageData = {
				subject: "feat(root): add new button component",
				type: "feat",
				scopes: ["root"],
				description: "add new button component",
				bodyLines: ["This adds a new reusable button component", "with proper TypeScript types"],
				isBreaking: false,
				isMerge: false,
				isDependency: false,
			};

			const formatted = EntityCommit.formatCommitMessage(messageData);
			expect(formatted).toBe(
				"feat(root): add new button component\n\nThis adds a new reusable button component\nwith proper TypeScript types",
			);
		});

		it("should format breaking change commit", () => {
			const messageData = {
				subject: "feat(root): add new button component",
				type: "feat",
				scopes: ["root"],
				description: "add new button component",
				bodyLines: [],
				isBreaking: true,
				isMerge: false,
				isDependency: false,
			};

			const formatted = EntityCommit.formatCommitMessage(messageData);
			expect(formatted).toContain("BREAKING CHANGE");
		});
	});
});
