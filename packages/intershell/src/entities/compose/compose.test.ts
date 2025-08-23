import { describe, expect, it, mock } from "bun:test";

// Mock the EntityPackages module before importing the class
mock.module("../packages", () => ({
	EntityPackages: {
		getAllPackages: () => ["root", "app", "db"],
	},
}));

// Import the class to test static methods
const { EntityCompose } = await import("./compose");

describe("EntityCompose", () => {
	describe("static methods", () => {
		describe("parsePortMappings", () => {
			it("should parse port mappings correctly", () => {
				const ports = ["3000:3000", "8080:80", "9000"];
				const mappings = EntityCompose["parsePortMappings"](ports);

				expect(mappings).toHaveLength(3);
				expect(mappings[0]).toEqual({
					host: 3000,
					container: 3000,
					protocol: "tcp",
				});
				expect(mappings[1]).toEqual({
					host: 8080,
					container: 80,
					protocol: "tcp",
				});
				expect(mappings[2]).toEqual({
					host: 9000,
					container: 9000,
					protocol: "tcp",
				});
			});

			it("should handle empty ports array", () => {
				const mappings = EntityCompose["parsePortMappings"]([]);
				expect(mappings).toHaveLength(0);
			});

			it("should handle single port without colon", () => {
				const ports = ["9000"];
				const mappings = EntityCompose["parsePortMappings"](ports);

				expect(mappings).toHaveLength(1);
				expect(mappings[0]).toEqual({
					host: 9000,
					container: 9000,
					protocol: "tcp",
				});
			});

			it("should handle port with only host specified", () => {
				const ports = ["3000:"];
				const mappings = EntityCompose["parsePortMappings"](ports);

				expect(mappings).toHaveLength(1);
				expect(mappings[0]).toEqual({
					host: 3000,
					container: 3000,
					protocol: "tcp",
				});
			});
		});

		describe("parseEnvironment", () => {
			it("should parse array environment variables", () => {
				const env = ["NODE_ENV=development", "PORT=3000", "DEBUG=true"];
				const result = EntityCompose["parseEnvironment"](env);

				expect(result).toEqual({
					NODE_ENV: "development",
					PORT: "3000",
					DEBUG: "true",
				});
			});

			it("should parse object environment variables", () => {
				const env = {
					NODE_ENV: "production",
					PORT: "8080",
				};
				const result = EntityCompose["parseEnvironment"](env);

				expect(result).toEqual({
					NODE_ENV: "production",
					PORT: "8080",
				});
			});

			it("should handle undefined environment", () => {
				const result = EntityCompose["parseEnvironment"](undefined);
				expect(result).toEqual({});
			});

			it("should handle malformed array environment variables", () => {
				const env = ["NODE_ENV=development", "INVALID", "PORT=3000"];
				const result = EntityCompose["parseEnvironment"](env);

				expect(result).toEqual({
					NODE_ENV: "development",
					PORT: "3000",
				});
			});

			it("should handle empty array environment variables", () => {
				const env: string[] = [];
				const result = EntityCompose["parseEnvironment"](env);

				expect(result).toEqual({});
			});

			it("should handle environment variables with equals in value", () => {
				const env = ["DATABASE_URL=postgresql://user:pass@localhost:5432/db"];
				const result = EntityCompose["parseEnvironment"](env);

				expect(result).toEqual({
					DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
				});
			});
		});
	});

	describe("port mapping edge cases", () => {
		it("should handle various port formats", () => {
			const testCases = [
				{ input: "3000:3000", expected: { host: 3000, container: 3000 } },
				{ input: "8080:80", expected: { host: 8080, container: 80 } },
				{ input: "9000", expected: { host: 9000, container: 9000 } },
				{ input: "3000:", expected: { host: 3000, container: 3000 } },
				{ input: ":3000", expected: { host: 3000, container: 3000 } },
			];

			testCases.forEach(({ input, expected }) => {
				const mappings = EntityCompose["parsePortMappings"]([input]);
				expect(mappings).toHaveLength(1);
				expect(mappings[0].host).toBe(expected.host);
				expect(mappings[0].container).toBe(expected.container);
				expect(mappings[0].protocol).toBe("tcp");
			});
		});

		it("should handle non-numeric port values gracefully", () => {
			const ports = ["abc:def", "invalid", "123:abc"];
			const mappings = EntityCompose["parsePortMappings"](ports);

			expect(mappings).toHaveLength(3);

			// Non-numeric values result in NaN or undefined based on || logic
			expect(mappings[0].host).toBeNaN();
			expect(mappings[0].container).toBeNaN();
			expect(mappings[1].host).toBeUndefined();
			expect(mappings[1].container).toBeNaN();
			expect(mappings[2].host).toBe(123);
			expect(mappings[2].container).toBe(123);
		});
	});

	describe("environment parsing edge cases", () => {
		it("should handle empty string values", () => {
			const env = ["KEY=", "EMPTY=", "VALUE=something"];
			const result = EntityCompose["parseEnvironment"](env);

			expect(result).toEqual({
				VALUE: "something",
			});
		});

		it("should handle keys without values", () => {
			const env = ["KEY", "ANOTHER_KEY", "VALID_KEY=value"];
			const result = EntityCompose["parseEnvironment"](env);

			expect(result).toEqual({
				VALID_KEY: "value",
			});
		});

		it("should handle mixed environment formats", () => {
			const env = ["NODE_ENV=production", "DEBUG=true", "EMPTY=", "NO_VALUE", "COMPLEX=key=value"];
			const result = EntityCompose["parseEnvironment"](env);

			expect(result).toEqual({
				NODE_ENV: "production",
				DEBUG: "true",
				COMPLEX: "key",
			});
		});
	});
});
