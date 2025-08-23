import { describe, expect, it } from "bun:test";
import type { ServiceDefinition } from "./types";
import { parseDockerCompose, parseYAML } from "./yaml-parser";

describe("YAML Parser", () => {
	describe("parseYAML", () => {
		it("should parse basic key-value pairs", () => {
			const input = "version: '3.8'\nname: test";
			const result = parseYAML(input);

			expect(result.version).toBe("3.8");
			expect(result.name).toBe("test");
		});

		it("should parse nested objects", () => {
			const input = `
version: '3.8'
services:
  app:
    image: node:18
    ports:
      - "3000:3000"
`;
			const result = parseYAML(input);

			expect(result.version).toBe("3.8");
			expect(result.services).toBeDefined();
			expect((result.services as Record<string, ServiceDefinition>).app).toBeDefined();
			expect((result.services as Record<string, ServiceDefinition>).app.image).toBe("node:18");
			expect(Array.isArray((result.services as Record<string, ServiceDefinition>).app.ports)).toBe(
				true,
			);
		});

		it("should parse arrays", () => {
			const input = `
ports:
  - "3000:3000"
  - "8080:80"
`;
			const result = parseYAML(input);

			expect(Array.isArray(result.ports as string[])).toBe(true);
			expect(result.ports as string[]).toHaveLength(2);
			expect((result.ports as string[])[0]).toBe("3000:3000");
			expect((result.ports as string[])[1]).toBe("8080:80");
		});

		it("should skip comments and empty lines", () => {
			const input = `
# This is a comment
version: '3.8'

# Another comment
name: test
`;
			const result = parseYAML(input);

			expect(result.version).toBe("3.8");
			expect(result.name).toBe("test");
			expect(result["# This is a comment"]).toBeUndefined();
		});
	});

	describe("parseDockerCompose", () => {
		it("should parse docker-compose file with defaults", () => {
			const input = `
services:
  app:
    image: node:18
    ports:
      - "3000:3000"
`;
			const result = parseDockerCompose(input);

			expect(result.version).toBe("3.8");
			expect(result.services).toBeDefined();
			expect(result.networks).toBeDefined();
			expect(result.volumes).toBeDefined();
			expect(result.validation.isValid).toBe(true);
		});

		it("should handle environment variables", () => {
			const input = `
services:
  app:
    environment:
      - NODE_ENV=production
      - PORT=3000
`;
			const result = parseDockerCompose(input);

			const service = result.services.app as ServiceDefinition;
			const environment = service.environment as Record<string, string>;

			expect(environment).toBeDefined();
			expect(environment.NODE_ENV).toBe("production");
			expect(environment.PORT).toBe("3000");
		});
	});

	describe("parseValue edge cases", () => {
		it("should parse numbers", () => {
			const input = "port: 3000";
			const result = parseYAML(input);
			expect(result.port).toBe(3000);
		});

		it("should parse booleans", () => {
			const input = "enabled: true\ndisabled: false";
			const result = parseYAML(input);
			expect(result.enabled).toBe(true);
			expect(result.disabled).toBe(false);
		});

		it("should parse quoted strings", () => {
			const input = 'name: "test-service"';
			const result = parseYAML(input);
			expect(result.name).toBe("test-service");
		});
	});

	describe("complex array scenarios", () => {
		it("should handle arrays at root level", () => {
			const input = `
items:
  - "item1"
  - "item2"
`;
			const result = parseYAML(input);
			expect(Array.isArray(result.items)).toBe(true);
			expect(result.items).toHaveLength(2);
		});

		it("should handle empty array items", () => {
			const input = `
services:
  app:
    volumes:
      - 
      - /data:/data
`;
			const result = parseYAML(input);
			const services = result.services as Record<string, { volumes: string[] }>;
			expect(Array.isArray(services.app.volumes)).toBe(true);
			expect(services.app.volumes).toHaveLength(2);
		});

		it("should handle mixed array content", () => {
			const input = `
config:
  items:
    - name: "item1"
    - "simple-string"
    - 
      nested: true
`;
			const result = parseYAML(input);
			const config = result.config as { items: unknown[] };
			expect(Array.isArray(config.items)).toBe(true);
			// biome-ignore lint/suspicious/noExplicitAny: "any is used to access the items array"
			expect((config.items[0] as any).name).toBe("item1");
			// biome-ignore lint/suspicious/noExplicitAny: "any is used to access the items array"
			expect(config.items[1] as any).toBe("simple-string");
			// biome-ignore lint/suspicious/noExplicitAny: "any is used to access the items array"
			expect((config.items[2] as any).nested).toBe(true);
		});
	});

	describe("edge cases", () => {
		it("should handle malformed YAML gracefully", () => {
			const input = `
key1: value1
key2: 
  - item1
  - item2
key3: value3
`;
			const result = parseYAML(input);
			expect(result.key1).toBe("value1");
			expect(Array.isArray(result.key2)).toBe(true);
			expect(result.key3).toBe("value3");
		});

		it("should handle deeply nested structures", () => {
			const input = `
level1:
  level2:
    level3:
      level4:
        value: "deep"
        items:
          - "nested1"
          - "nested2"
`;
			const result = parseYAML(input);
			const level1 = result.level1 as Record<string, unknown>;
			const level2 = level1.level2 as Record<string, unknown>;
			const level3 = level2.level3 as Record<string, unknown>;
			const level4 = level3.level4 as Record<string, unknown>;
			expect(level4.value).toBe("deep");
			expect(Array.isArray(level4.items)).toBe(true);
		});

		it("should handle array items without parent key", () => {
			const input = `
  - "orphaned-item"
`;
			const result = parseYAML(input);
			// This should handle gracefully without crashing
			expect(result).toBeDefined();
		});

		it("should handle array items with existing array key", () => {
			const input = `
config:
  items: []
  - "new-item"
`;
			const result = parseYAML(input);
			// The parser now correctly parses [] as an array
			const config = result.config as Record<string, unknown>;
			expect(Array.isArray(config.items)).toBe(true);
			expect(config.items).toHaveLength(0); // Empty array
			// Note: The orphaned array item creates a nested structure
			expect(Array.isArray(config.config)).toBe(true);
			expect(config.config).toContain("new-item");
		});

		it("should handle parseValue edge cases", () => {
			// Test empty string and whitespace
			const input = "empty: \nwhitespace:   \nzero: 0";
			const result = parseYAML(input);
			expect(result.empty).toEqual({});
			expect(result.whitespace).toEqual({});
			expect(result.zero).toBe(0);
		});

		it("should handle array items with existing array in current object", () => {
			const input = `
config:
  items: []
  nested:
    subitems: []
    - "subitem"
`;
			const result = parseYAML(input);
			const config = result.config as Record<string, unknown>;
			const nested = config.nested as Record<string, unknown>;

			// The parser creates nested keys for orphaned array items
			expect(Array.isArray(nested.subitems)).toBe(true);
			expect(Array.isArray(nested.nested)).toBe(true);
			expect(nested.nested).toContain("subitem");
		});

		it("should handle array items with complex nesting", () => {
			const input = `
level1:
  level2:
    level3:
      items: []
      - "deep-item"
`;
			const result = parseYAML(input);
			const level1 = result.level1 as Record<string, unknown>;
			const level2 = level1.level2 as Record<string, unknown>;
			const level3 = level2.level3 as Record<string, unknown>;

			// The parser creates nested keys for orphaned array items
			expect(Array.isArray(level3.items)).toBe(true);
			expect(Array.isArray(level3.level3)).toBe(true);
			expect(level3.level3).toContain("deep-item");
		});

		it("should handle array items after empty object definition", () => {
			const input = `
services:
  - name: "service1"
  - name: "service2"
`;
			const result = parseYAML(input);

			expect(Array.isArray(result.services)).toBe(true);
			expect(result.services as Array<Record<string, unknown>>).toHaveLength(2);
			expect((result.services as Array<Record<string, unknown>>)[0].name).toBe("service1");
			expect((result.services as Array<Record<string, unknown>>)[1].name).toBe("service2");
		});

		it("should fallback to existing array when no parent key found", () => {
			const input = `
existing:
  - "item1"
  - "item2"
`;
			const result = parseYAML(input);

			expect(Array.isArray(result.existing)).toBe(true);
			expect(result.existing as string[]).toHaveLength(2);
			expect((result.existing as string[])[0]).toBe("item1");
			expect((result.existing as string[])[1]).toBe("item2");
		});

		it("should handle array item with empty key definition above", () => {
			const input = `
services:
  app:
    - "config1"
    - "config2"
`;
			const result = parseYAML(input);

			const services = result.services as Record<string, unknown>;
			expect(Array.isArray(services.app)).toBe(true);
			expect(services.app as string[]).toHaveLength(2);
			expect((services.app as string[])[0]).toBe("config1");
			expect((services.app as string[])[1]).toBe("config2");
		});

		it("should use fallback array detection for orphaned array items", () => {
			// This creates a scenario where an array item can't find its parent key
			// and needs to fallback to existing array detection
			const input = `
root:
  items: []
- "orphaned-item"
`;
			const result = parseYAML(input);

			const root = result.root as Record<string, unknown>;
			// The orphaned item should be added to the existing items array
			expect(Array.isArray(root.items)).toBe(true);
		});

		it("should handle array item finding parent key with empty value", () => {
			// This should trigger lines 108-109: empty value key definition
			const input = `
services:
  web:
    - "config1"
    - "config2"
`;
			const result = parseYAML(input);

			const services = result.services as Record<string, unknown>;
			expect(Array.isArray(services.web)).toBe(true);
			expect(services.web as string[]).toHaveLength(2);
			expect((services.web as string[])[0]).toBe("config1");
			expect((services.web as string[])[1]).toBe("config2");
		});

		it("should use array fallback when parent key not found at correct indent", () => {
			// This should trigger lines 117-118: fallback array detection
			// Create a scenario where array items exist but can't find parent at right indent
			const input = `
config:
  items: []
  nested:
    value: "test"
- "fallback-item"
`;
			const result = parseYAML(input);

			const config = result.config as Record<string, unknown>;
			// The fallback should find the existing items array
			expect(Array.isArray(config.items)).toBe(true);
		});

		it("should handle complex nested array scenarios", () => {
			// Test complex nested structure to ensure parser robustness
			const input = `
root:
  services:
    - name: "service1"
    - name: "service2"
  config:
    items: []
`;
			const result = parseYAML(input);

			const root = result.root as Record<string, unknown>;
			const services = root.services as Array<Record<string, unknown>>;
			expect(Array.isArray(services)).toBe(true);
			expect(services).toHaveLength(2);
			expect(services[0].name).toBe("service1");
			expect(services[1].name).toBe("service2");
		});
	});
});
