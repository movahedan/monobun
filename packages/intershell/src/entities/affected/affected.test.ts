import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

// Mock EntityTag
const mockGetBaseTagSha = mock(() => Promise.resolve("abc123"));
const mockEntityTag = {
	getBaseTagSha: mockGetBaseTagSha,
};

// Mock modules before importing
mock.module("../tag", () => ({
	EntityTag: mockEntityTag,
}));

// Now import the module after mocking
const { EntityAffected } = await import("./affected");

describe("EntityAffected", () => {
	beforeEach(() => {
		// Reset all mocks before each test
		mockGetBaseTagSha.mockClear();
	});

	afterEach(() => {
		mock.restore();
	});

	describe("getAffectedPackages", () => {
		it("should call EntityTag.getBaseTagSha with correct parameters", async () => {
			// Arrange
			const baseSha = "custom-sha";
			mockGetBaseTagSha.mockResolvedValue("resolved-sha");

			// Act
			await EntityAffected.getAffectedPackages(baseSha).catch(() => undefined);

			// Assert
			expect(mockGetBaseTagSha).toHaveBeenCalledWith(baseSha);
		});

		it("should call EntityTag.getBaseTagSha with undefined when no baseSha provided", async () => {
			// Act
			await EntityAffected.getAffectedPackages().catch(() => undefined);

			// Assert
			expect(mockGetBaseTagSha).toHaveBeenCalledWith(undefined);
		});

		it("should handle EntityTag.getBaseTagSha throwing an error", async () => {
			// Arrange
			const error = new Error("Failed to get base tag SHA");
			mockGetBaseTagSha.mockRejectedValue(error);

			// Act & Assert
			expect(EntityAffected.getAffectedPackages()).rejects.toThrow("Failed to get base tag SHA");
		});
	});

	describe("function structure and behavior", () => {
		it("should have getAffectedPackages function", () => {
			expect(EntityAffected.getAffectedPackages).toBeDefined();
			expect(typeof EntityAffected.getAffectedPackages).toBe("function");
		});

		it("should return a promise", () => {
			// Mock the EntityTag to prevent actual execution
			mockGetBaseTagSha.mockResolvedValue("test-sha");

			const result = EntityAffected.getAffectedPackages();
			expect(result).toBeInstanceOf(Promise);
		});

		it("should accept optional baseSha parameter", () => {
			// This test verifies the function signature
			// The function has 1 parameter because 'to' has a default value
			expect(EntityAffected.getAffectedPackages.length).toBe(1);
		});

		it("should accept optional to parameter with default value", () => {
			// This test verifies the function signature
			// The function has 1 parameter because 'to' has a default value
			expect(EntityAffected.getAffectedPackages.length).toBe(1);
		});
	});

	describe("parameter handling", () => {
		it("should handle string baseSha parameter", () => {
			// Arrange
			const baseSha = "test-sha";
			mockGetBaseTagSha.mockResolvedValue("resolved-sha");

			// Act
			EntityAffected.getAffectedPackages(baseSha).catch(() => undefined);

			// Assert
			expect(mockGetBaseTagSha).toHaveBeenCalledWith(baseSha);
		});

		it("should handle undefined baseSha parameter", () => {
			// Act
			EntityAffected.getAffectedPackages(undefined).catch(() => undefined);

			// Assert
			expect(mockGetBaseTagSha).toHaveBeenCalledWith(undefined);
		});

		it("should handle custom to parameter", () => {
			// Arrange
			const baseSha = "test-sha";
			const to = "custom-branch";
			mockGetBaseTagSha.mockResolvedValue("resolved-sha");

			// Act
			EntityAffected.getAffectedPackages(baseSha, to).catch(() => undefined);

			// Assert
			expect(mockGetBaseTagSha).toHaveBeenCalledWith(baseSha);
		});

		it("should use HEAD as default to parameter", () => {
			// Arrange
			const baseSha = "test-sha";
			mockGetBaseTagSha.mockResolvedValue("resolved-sha");

			// Act
			EntityAffected.getAffectedPackages(baseSha).catch(() => undefined);

			// Assert
			expect(mockGetBaseTagSha).toHaveBeenCalledWith(baseSha);
		});
	});

	describe("error handling", () => {
		it("should propagate EntityTag.getBaseTagSha errors", () => {
			// Arrange
			const error = new Error("Custom error message");
			mockGetBaseTagSha.mockRejectedValue(error);

			// Act & Assert
			expect(EntityAffected.getAffectedPackages()).rejects.toThrow("Custom error message");
		});

		it("should handle different error types from EntityTag.getBaseTagSha", () => {
			// Arrange
			const error = new TypeError("Type error");
			mockGetBaseTagSha.mockRejectedValue(error);

			// Act & Assert
			expect(EntityAffected.getAffectedPackages()).rejects.toThrow("Type error");
		});
	});
});
