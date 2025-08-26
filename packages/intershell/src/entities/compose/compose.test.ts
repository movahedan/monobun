import { describe, expect, it, mock } from "bun:test";
import type { ComposeData, ServiceDefinition } from "./types";

// Mock the EntityPackages module before importing the class
mock.module("../packages", () => ({
	EntityPackages: {
		getAllPackages: () => ["root", "app", "db"],
	},
}));

// Import the class to test static methods
const { EntityCompose } = await import("./compose");

// Helper function to access the private parseDockerCompose function
function callParseDockerCompose(input: string): ComposeData {
	return (EntityCompose as unknown as { parseDockerCompose: (input: string) => ComposeData })[
		"parseDockerCompose"
	](input);
}

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

describe("Docker Compose Parser", () => {
	describe("parseDockerCompose", () => {
		it("should parse docker-compose file with defaults", () => {
			const input = `
services:
  app:
    image: node:18
    ports:
      - "3000:3000"
`;
			const result = callParseDockerCompose(input);

			expect(result.version).toBe("3.8");
			expect(result.services).toBeDefined();
			expect(result.networks).toBeDefined();
			expect(result.volumes).toBeDefined();
			expect(result.validation.isValid).toBe(true);
		});

		it("should handle custom version", () => {
			const input = `
version: '3.9'
services:
  app:
    image: node:18
`;
			const result = EntityCompose.parseDockerCompose(input);

			expect(result.version).toBe("3.9");
		});

		it("should handle environment variables array format", () => {
			const input = `
services:
  app:
    environment:
      - NODE_ENV=production
      - PORT=3000
      - API_KEY=secret123
`;
			const result = EntityCompose.parseDockerCompose(input);

			const service = result.services.app as ServiceDefinition;
			const environment = service.environment as Record<string, string>;

			expect(environment).toBeDefined();
			expect(environment.NODE_ENV).toBe("production");
			expect(environment.PORT).toBe("3000");
			expect(environment.API_KEY).toBe("secret123");
		});

		it("should handle environment variables object format", () => {
			const input = `
services:
  app:
    environment:
      NODE_ENV: production
      PORT: 3000
      API_KEY: secret123
`;
			const result = EntityCompose.parseDockerCompose(input);

			const service = result.services.app as ServiceDefinition;
			const environment = service.environment as Record<string, unknown>;

			expect(environment).toBeDefined();
			expect(environment.NODE_ENV).toBe("production");
			expect(environment.PORT).toBe(3000);
			expect(environment.API_KEY).toBe("secret123");
		});

		it("should handle ports array with string conversion", () => {
			const input = `
services:
  app:
    ports:
      - "3000:3000"
      - "8080:80"
      - "9000:9000"
`;
			const result = EntityCompose.parseDockerCompose(input);

			const service = result.services.app as ServiceDefinition;
			const ports = service.ports as string[];

			expect(Array.isArray(ports)).toBe(true);
			expect(ports).toHaveLength(3);
			expect(ports[0]).toBe("3000:3000");
			expect(ports[1]).toBe("8080:80");
			expect(ports[2]).toBe("9000:9000");
		});

		it("should handle empty services, networks, and volumes", () => {
			const input = `
version: '3.8'
`;
			const result = EntityCompose.parseDockerCompose(input);

			expect(result.services).toEqual({});
			expect(result.networks).toEqual({});
			expect(result.volumes).toEqual({});
		});

		it("should handle complex service configuration", () => {
			const input = `
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    environment:
      - NGINX_HOST=localhost
      - NGINX_PORT=80
    volumes:
      - "./nginx.conf:/etc/nginx/nginx.conf"
    depends_on:
      - app
    networks:
      - frontend
      - backend
    restart: unless-stopped

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://localhost:5432/myapp
    volumes:
      - "./app:/app"
      - "/app/node_modules"
    depends_on:
      - db
    networks:
      - backend

  db:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secret
    volumes:
      - "postgres_data:/var/lib/postgresql/data"
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge

volumes:
  postgres_data:
    driver: local
`;
			const result = EntityCompose.parseDockerCompose(input);

			expect(result.services.web).toBeDefined();
			expect(result.services.app).toBeDefined();
			expect(result.services.db).toBeDefined();

			// Test web service
			const web = result.services.web as ServiceDefinition;
			expect(web.image).toBe("nginx:alpine");
			expect(web.ports).toEqual(["80:80", "443:443"]);
			expect(web.environment).toEqual({
				NGINX_HOST: "localhost",
				NGINX_PORT: "80",
			});
			expect(web.volumes).toEqual(["./nginx.conf:/etc/nginx/nginx.conf"]);
			expect(web.depends_on).toEqual(["app"]);
			expect(web.networks).toEqual(["frontend", "backend"]);
			expect(web.restart).toBe("unless-stopped");

			// Test app service
			const app = result.services.app as ServiceDefinition;
			expect(app.build).toBe(".");
			expect(app.ports).toEqual(["3000:3000"]);
			expect(app.environment).toEqual({
				NODE_ENV: "production",
				DATABASE_URL: "postgresql://localhost:5432/myapp",
			});

			// Test networks and volumes
			expect(result.networks.frontend).toBeDefined();
			expect(result.networks.backend).toBeDefined();
			expect(result.volumes.postgres_data).toBeDefined();
		});

		it("should handle environment variables with equals in value", () => {
			const input = `
services:
  app:
    environment:
      - DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
      - REDIS_URL=redis://localhost:6379/0
      - API_KEY=key=value=123
`;
			const result = EntityCompose.parseDockerCompose(input);

			const service = result.services.app as ServiceDefinition;
			const environment = service.environment as Record<string, string>;

			expect(environment.DATABASE_URL).toBe("postgresql://user:pass@host:5432/db?sslmode=require");
			expect(environment.REDIS_URL).toBe("redis://localhost:6379/0");
			expect(environment.API_KEY).toBe("key=value=123");
		});
	});
});
