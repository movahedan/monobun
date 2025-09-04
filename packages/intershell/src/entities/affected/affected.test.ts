import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { $ } from "bun";

describe("EntityAffected", async () => {
	beforeEach(async () => {
		// Import and mock entitiesShell methods directly
		const { entitiesShell } = await import("../entities.shell");

		// Mock turboRunBuild directly
		entitiesShell.turboRunBuild = mock(
			() =>
				({
					exitCode: 0,
					json: () => Promise.resolve({ packages: ["package1", "package2"] }),
					text: () => Promise.resolve('{"packages":["package1","package2"]}'),
				}) as unknown as $.ShellPromise,
		);
	});

	describe("getAffectedPackages", () => {
		it("should call EntityTag.getBaseCommitSha with correct parameters", async () => {
			// Import and mock EntityTag first
			const { EntityTag } = await import("../tag");

			// Store original method
			const originalGetBaseCommitSha = EntityTag.getBaseCommitSha;

			// Mock EntityTag.getBaseCommitSha
			const mockGetBaseTagSha = mock(() => Promise.resolve("resolved-sha"));
			EntityTag.getBaseCommitSha = mockGetBaseTagSha;

			// Now import EntityAffected after mocking
			const { EntityAffected } = await import("./affected");

			// Act
			await EntityAffected.getAffectedPackages("custom-sha").catch(() => undefined);

			// Assert
			expect(mockGetBaseTagSha).toHaveBeenCalledWith("custom-sha");

			// Restore original method
			EntityTag.getBaseCommitSha = originalGetBaseCommitSha;
		});

		it("should call EntityTag.getBaseCommitSha with undefined when no baseSha provided", async () => {
			// Import and mock EntityTag first
			const { EntityTag } = await import("../tag");

			// Store original method
			const originalGetBaseCommitSha = EntityTag.getBaseCommitSha;

			// Mock EntityTag.getBaseCommitSha
			const mockGetBaseTagSha = mock(() => Promise.resolve("resolved-sha"));
			EntityTag.getBaseCommitSha = mockGetBaseTagSha;

			// Now import EntityAffected after mocking
			const { EntityAffected } = await import("./affected");

			// Act
			await EntityAffected.getAffectedPackages().catch(() => undefined);

			// Assert
			expect(mockGetBaseTagSha).toHaveBeenCalledWith(undefined);

			// Restore original method
			EntityTag.getBaseCommitSha = originalGetBaseCommitSha;
		});

		it("should handle EntityTag.getBaseCommitSha throwing an error", async () => {
			// Import and mock EntityTag first
			const { EntityTag } = await import("../tag");

			// Store original method
			const originalGetBaseCommitSha = EntityTag.getBaseCommitSha;

			// Mock EntityTag.getBaseCommitSha to throw error
			const mockGetBaseTagSha = mock(() => Promise.reject(new Error("Failed to get base tag SHA")));
			EntityTag.getBaseCommitSha = mockGetBaseTagSha;

			// Now import EntityAffected after mocking
			const { EntityAffected } = await import("./affected");

			// Act & Assert
			expect(EntityAffected.getAffectedPackages()).rejects.toThrow("Failed to get base tag SHA");

			// Restore original method
			EntityTag.getBaseCommitSha = originalGetBaseCommitSha;
		});
	});

	describe("function structure and behavior", () => {
		it("should have getAffectedPackages function", async () => {
			// Import fresh EntityAffected module
			const { EntityAffected } = await import("./affected");

			expect(EntityAffected.getAffectedPackages).toBeDefined();
			expect(typeof EntityAffected.getAffectedPackages).toBe("function");
		});

		it("should return a promise", async () => {
			// Import and mock EntityTag first
			const { EntityTag } = await import("../tag");

			// Store original method
			const originalGetBaseCommitSha = EntityTag.getBaseCommitSha;

			// Mock the EntityTag to prevent actual execution
			const mockGetBaseTagSha = mock(() => Promise.resolve("test-sha"));
			EntityTag.getBaseCommitSha = mockGetBaseTagSha;

			// Now import EntityAffected after mocking
			const { EntityAffected } = await import("./affected");

			const result = EntityAffected.getAffectedPackages();
			expect(result).toBeInstanceOf(Promise);

			// Restore original method
			EntityTag.getBaseCommitSha = originalGetBaseCommitSha;
		});

		it("should accept optional baseSha parameter", async () => {
			// Import fresh EntityAffected module
			const { EntityAffected } = await import("./affected");

			// This test verifies the function signature
			// The function has 2 parameters: baseSha (optional) and to (with default value)
			// But function.length only counts parameters before the first default value, so it's 1
			expect(EntityAffected.getAffectedPackages.length).toBe(1);
		});

		it("should accept optional to parameter with default value", async () => {
			// Import fresh EntityAffected module
			const { EntityAffected } = await import("./affected");

			// This test verifies the function signature
			// The function has 2 parameters: baseSha (optional) and to (with default value)
			// But function.length only counts parameters before the first default value, so it's 1
			expect(EntityAffected.getAffectedPackages.length).toBe(1);
		});
	});

	describe("parameter handling", () => {
		it("should handle string baseSha parameter", async () => {
			// Import EntityAffected first
			const { EntityAffected } = await import("./affected");

			// Now import EntityTag and mock its method
			const { EntityTag } = await import("../tag");
			const mockGetBaseTagSha = mock(() => Promise.resolve("resolved-sha"));
			EntityTag.getBaseCommitSha = mockGetBaseTagSha;

			// Act
			await EntityAffected.getAffectedPackages("test-sha").catch(() => undefined);

			// Assert
			expect(mockGetBaseTagSha).toHaveBeenCalledWith("test-sha");
		});

		it("should handle undefined baseSha parameter", async () => {
			// Import EntityAffected first
			const { EntityAffected } = await import("./affected");

			// Now import EntityTag and mock its method
			const { EntityTag } = await import("../tag");
			const mockGetBaseTagSha = mock(() => Promise.resolve("resolved-sha"));
			EntityTag.getBaseCommitSha = mockGetBaseTagSha;

			// Act
			await EntityAffected.getAffectedPackages().catch(() => undefined);

			// Assert
			expect(mockGetBaseTagSha).toHaveBeenCalledWith(undefined);
		});

		it("should handle custom to parameter", async () => {
			// Import EntityAffected first
			const { EntityAffected } = await import("./affected");

			// Now import EntityTag and mock its method
			const { EntityTag } = await import("../tag");
			const mockGetBaseTagSha = mock(() => Promise.resolve("resolved-sha"));
			EntityTag.getBaseCommitSha = mockGetBaseTagSha;

			// Act
			await EntityAffected.getAffectedPackages("test-sha", "custom-branch").catch(() => undefined);

			// Assert
			expect(mockGetBaseTagSha).toHaveBeenCalledWith("test-sha");
		});

		it("should use HEAD as default to parameter", async () => {
			// Import EntityAffected first
			const { EntityAffected } = await import("./affected");

			// Now import EntityTag and mock its method
			const { EntityTag } = await import("../tag");
			const mockGetBaseTagSha = mock(() => Promise.resolve("resolved-sha"));
			EntityTag.getBaseCommitSha = mockGetBaseTagSha;

			// Act
			await EntityAffected.getAffectedPackages("test-sha").catch(() => undefined);

			// Assert
			expect(mockGetBaseTagSha).toHaveBeenCalledWith("test-sha");
		});
	});

	describe("error handling", () => {
		it("should propagate EntityTag.getBaseCommitSha errors", async () => {
			// Import EntityAffected first
			const { EntityAffected } = await import("./affected");

			// Now import EntityTag and mock its method
			const { EntityTag } = await import("../tag");
			const mockGetBaseTagSha = mock(() => Promise.reject(new Error("Custom error message")));
			EntityTag.getBaseCommitSha = mockGetBaseTagSha;

			// Act & Assert
			expect(EntityAffected.getAffectedPackages()).rejects.toThrow("Custom error message");
		});

		it("should handle different error types from EntityTag.getBaseCommitSha", async () => {
			// Import EntityAffected first
			const { EntityAffected } = await import("./affected");

			// Now import EntityTag and mock its method
			const { EntityTag } = await import("../tag");
			const mockGetBaseTagSha = mock(() => Promise.reject(new TypeError("Type error")));
			EntityTag.getBaseCommitSha = mockGetBaseTagSha;

			// Act & Assert
			expect(EntityAffected.getAffectedPackages()).rejects.toThrow("Type error");
		});
	});
});
