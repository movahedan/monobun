import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";

type CustomBunType = {
	YAML: {
		parse: (input: string) => Record<string, unknown>;
	};
	file: (path: string) => { text: () => string };
};

describe("EntityCompose", () => {
	// Store original Bun methods for restoration
	let originalBunYaml: CustomBunType["YAML"];
	let originalBunFile: CustomBunType["file"];

	// Default YAML template that we can modify per test case
	const defaultYaml = {
		version: "3.8",
		services: {
			"test-service": {
				image: "app:latest",
				ports: ["3000:3000"],
				environment: ["NODE_ENV=production", "PORT=3000"],
				volumes: ["/app/data:/data"],
				depends_on: ["db"],
			},
			db: {
				image: "postgres:13",
				ports: ["5432:5432"],
				environment: ["POSTGRES_DB=myapp"],
			},
		} as Record<
			string,
			{
				image?: string;
				build?: string;
				ports?: string[];
				environment?: string[];
				volumes?: string[];
				depends_on?: string[];
			}
		>,
		networks: { default: {} } as Record<string, unknown>,
		volumes: { data: {} } as Record<string, unknown>,
	};

	// Helper function to create modified YAML for specific test cases
	const createTestYaml = (modifications: Partial<typeof defaultYaml>) => {
		return { ...defaultYaml, ...modifications };
	};

	// Set up mocks before each test
	beforeEach(async () => {
		// Store original Bun methods
		originalBunYaml = (Bun as unknown as CustomBunType).YAML;
		originalBunFile = (Bun as unknown as CustomBunType).file;
	});

	// Restore mocks after each test
	afterEach(() => {
		// Restore original Bun methods
		(Bun as unknown as CustomBunType).YAML = originalBunYaml;
		(Bun as unknown as CustomBunType).file = originalBunFile;
	});

	// Store original methods to restore after tests
	let originalEntityPackageGetAllPackages: () => Promise<string[]>;
	let originalEntityAffectedGetAffectedPackages: (
		baseSha?: string,
		to?: string,
	) => Promise<string[]>;

	// Common mock setup for dependencies - now with proper cleanup
	const setupMocks = async () => {
		// Import modules
		const { EntityPackage } = await import("../package");
		const { EntityAffected } = await import("../affected");

		// Store original methods if not already stored
		if (!originalEntityPackageGetAllPackages) {
			originalEntityPackageGetAllPackages = EntityPackage.getAllPackages;
		}
		if (!originalEntityAffectedGetAffectedPackages) {
			originalEntityAffectedGetAffectedPackages = EntityAffected.getAffectedPackages;
		}

		// Mock EntityPackage.getAllPackages to avoid package.json errors
		EntityPackage.getAllPackages = () => Promise.resolve(["root", "test-package"]);

		// Mock EntityAffected.getAffectedPackages
		EntityAffected.getAffectedPackages = () => Promise.resolve(["test-service", "db"]);

		return { EntityPackage, EntityAffected };
	};

	// Cleanup function to restore original methods
	const cleanupMocks = async () => {
		if (originalEntityPackageGetAllPackages) {
			const { EntityPackage } = await import("../package");
			EntityPackage.getAllPackages = originalEntityPackageGetAllPackages;
		}
		if (originalEntityAffectedGetAffectedPackages) {
			const { EntityAffected } = await import("../affected");
			EntityAffected.getAffectedPackages = originalEntityAffectedGetAffectedPackages;
		}
	};

	// Common mock setup for Bun
	const setupBunMocks = (
		mockYamlParse: ReturnType<typeof mock>,
		mockFileText: ReturnType<typeof mock>,
	) => {
		(Bun as unknown as CustomBunType).YAML = { parse: mockYamlParse };
		(Bun as unknown as CustomBunType).file = mock(() => ({ text: mockFileText }));
	};

	it("should handle core functionality - parsing, validation, and basic operations", async () => {
		await setupMocks();

		// Create test YAML with an invalid service for validation testing
		const testYaml = createTestYaml({
			version: "3.9",
			services: {
				...defaultYaml.services,
				"invalid-service": {
					// Missing image and build - should fail validation
				},
			},
		});

		const mockYamlParse = mock(() => testYaml);

		const mockFileText = mock(() => Promise.resolve("mock yaml content"));
		setupBunMocks(mockYamlParse, mockFileText);

		const { EntityCompose } = await import("./compose");

		// Test instance creation and validation
		const entityCompose = new EntityCompose("docker-compose.yml");

		const validation = await entityCompose.validate();
		expect(validation.isValid).toBe(false);
		expect(validation.errors).toHaveLength(1);
		expect(validation.errors[0].code).toBe("NO_IMAGE_OR_BUILD");
		expect(validation.errors[0].service).toBe("invalid-service");

		// Test getCompose and caching behavior
		const compose1 = await entityCompose.getCompose();
		const compose2 = await entityCompose.getCompose();
		expect(compose1).toBe(compose2); // Should return cached version
		expect(compose1.version).toBe("3.9");
		expect(Object.keys(compose1.services)).toHaveLength(3);

		// Test getServices with comprehensive data
		const services = await entityCompose.getServices();
		expect(services).toHaveLength(3);

		const testService = services.find((s) => s.name === "test-service");
		expect(testService?.image).toBe("app:latest");
		expect(testService?.ports).toHaveLength(1);
		expect(testService?.ports[0].host).toBe(3000);
		expect(testService?.dependencies).toEqual(["db"]);
		expect(testService?.volumes).toEqual(["/app/data:/data"]);

		const dbService = services.find((s) => s.name === "db");
		expect(dbService?.image).toBe("postgres:13");
		expect(dbService?.ports[0].host).toBe(5432);

		// Cleanup mocks
		await cleanupMocks();
	});

	it("should handle service operations - health, dependencies, URLs, and caching", async () => {
		await setupMocks();

		// Use default YAML for this test - it already has the dependencies we need
		const mockYamlParse = mock(() => defaultYaml);

		const mockFileText = mock(() => Promise.resolve("mock yaml content"));
		setupBunMocks(mockYamlParse, mockFileText);

		const { EntityCompose } = await import("./compose");
		const entityCompose = new EntityCompose("docker-compose.yml");

		// Test getServiceHealth (lines 79-81)
		const health = await entityCompose.getServiceHealth();
		expect(health).toHaveLength(2);
		expect(health[0]).toEqual({
			name: "test-service",
			status: "healthy",
			checks: 10,
			failures: 0,
			lastCheck: expect.any(Date),
		});
		expect(health[1]).toEqual({
			name: "db",
			status: "healthy",
			checks: 10,
			failures: 0,
			lastCheck: expect.any(Date),
		});

		// Test getServiceDependencies
		const dependencies = await entityCompose.getServiceDependencies();
		expect(dependencies.services).toHaveLength(2);
		expect(dependencies.dependencies).toEqual({
			"test-service": ["db"],
			db: [],
		});

		// Test getServiceUrls (lines 93-95)
		const urls = await entityCompose.getServiceUrls();
		expect(urls).toEqual({
			"3000": "http://localhost:3000",
			"5432": "http://localhost:5432",
		});

		// Test getPortMappings
		const portMappings = await entityCompose.getPortMappings();
		expect(portMappings).toHaveLength(2);
		expect(portMappings[0]).toEqual({
			host: 3000,
			container: 3000,
			protocol: "tcp",
		});
		expect(portMappings[1]).toEqual({
			host: 5432,
			container: 5432,
			protocol: "tcp",
		});

		// Cleanup mocks
		await cleanupMocks();
	});

	it("should handle static parsing methods with comprehensive edge cases", async () => {
		await setupMocks();
		const { EntityCompose } = await import("./compose");

		// Test parsePortMappings with various scenarios
		const portTestCases = [
			"3000:3000", // Normal
			"8080", // Host only
			":80", // Container only
			"0:3000", // Zero host port
			"3000:0", // Zero container port
			"65535:3000", // Max port number
			"abc:3000", // Non-numeric host
			"3000:def", // Non-numeric container
			"", // Empty string
		];

		const result = EntityCompose.parsePortMappings(portTestCases);
		expect(result).toHaveLength(9);

		// Normal case
		expect(result[0]).toEqual({ host: 3000, container: 3000, protocol: "tcp" });

		// Host only
		expect(result[1]).toEqual({ host: 8080, container: 8080, protocol: "tcp" });

		// Container only - empty string becomes 0, then 0 ?? 80 = 0 (0 is not null/undefined)
		expect(result[2]).toEqual({ host: 0, container: 80, protocol: "tcp" });

		// Zero ports (should preserve 0, not treat as falsy)
		expect(result[3]).toEqual({ host: 0, container: 3000, protocol: "tcp" });
		expect(result[4]).toEqual({ host: 3000, container: 0, protocol: "tcp" });

		// Max port
		expect(result[5]).toEqual({ host: 65535, container: 3000, protocol: "tcp" });

		// Non-numeric (should result in NaN)
		expect(result[6].host).toBeNaN();
		expect(result[7].container).toBeNaN();

		// Empty string - Number("") returns 0 for both host and container
		expect(result[8].host).toBe(0);
		expect(result[8].container).toBe(0);
		expect(result[8].protocol).toBe("tcp");

		// Test parseEnvironment with various scenarios
		const envTestCases = [
			"NODE_ENV=production",
			"PORT=3000",
			"KEY1=value=with=equals",
			"KEY2=", // Empty value
			"KEY3", // No equals
			"=VALUE", // No key
			"", // Empty string
			"KEY4=0", // Zero value
			"KEY5=false", // Falsy value
		];

		const envResult = EntityCompose.parseEnvironment(envTestCases);
		expect(envResult).toEqual({
			NODE_ENV: "production",
			PORT: "3000",
			KEY1: "value=with=equals",
			KEY2: "", // Empty values are included
			KEY4: "0",
			KEY5: "false",
		});

		// Test parseDockerCompose with comprehensive YAML
		// Note: The static parseDockerCompose method uses Bun.YAML.parse directly
		// So we need to mock it before calling the static method
		const mockYamlParse = mock((input: string) => {
			if (input.includes('version: "3.9"')) {
				return createTestYaml({
					version: "3.9",
					services: {
						app: {
							image: "node:18",
							ports: ["3000:3000", "8080:80"],
							environment: [
								"NODE_ENV=production",
								"DATABASE_URL=postgresql://user:pass@db:5432/db",
							],
							volumes: ["/app/data:/data", "/app/logs:/logs"],
							depends_on: ["db", "redis"],
						},
						db: {
							image: "postgres:13",
							ports: ["5432:5432"],
							environment: ["POSTGRES_DB=myapp", "POSTGRES_PASSWORD=secret"],
						},
					},
				});
			}
			return defaultYaml;
		});

		// Set up Bun mock for static method testing
		(Bun as unknown as CustomBunType).YAML = { parse: mockYamlParse };

		const yamlInput = `
version: "3.9"
services:
  app:
    image: node:18
    ports:
      - "3000:3000"
      - "8080:80"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/db
    volumes:
      - /app/data:/data
      - /app/logs:/logs
    depends_on:
      - db
      - redis
  db:
    image: postgres:13
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_PASSWORD=secret
networks:
  default:
volumes:
  data:
  logs:
`;

		const composeData = EntityCompose.parseDockerCompose(yamlInput);
		expect(composeData.version).toBe("3.9");
		expect(composeData.services.app).toBeDefined();
		expect(composeData.services.app.image).toBe("node:18");
		expect(composeData.services.app.ports).toEqual(["3000:3000", "8080:80"]);
		expect(composeData.services.app.depends_on).toEqual(["db", "redis"]);
		expect(composeData.services.db.image).toBe("postgres:13");

		// Cleanup mocks
		await cleanupMocks();
	});

	it("should handle complex scenarios and error cases comprehensively", async () => {
		await setupMocks();

		// Create complex test YAML with multiple services and invalid ones for validation
		const complexYaml = createTestYaml({
			services: {
				"web-app": {
					image: "nginx:alpine",
					ports: ["80:80", "443:443"],
					environment: ["NGINX_HOST=localhost"],
					volumes: ["/var/log/nginx:/var/log/nginx"],
					depends_on: ["api", "db"],
				},
				api: {
					build: ".",
					ports: ["3000:3000"],
					environment: ["NODE_ENV=production", "DB_HOST=db"],
					depends_on: ["db"],
				},
				db: {
					image: "postgres:13",
					ports: ["5432:5432"],
					environment: ["POSTGRES_DB=myapp"],
					volumes: ["postgres_data:/var/lib/postgresql/data"],
				},
				redis: {
					image: "redis:alpine",
					ports: ["6379:6379"],
				},
				"invalid-service": {
					// Missing image and build - should fail validation
				},
				"another-invalid": {
					// Also missing image and build
				},
			},
			networks: { default: { driver: "bridge" } },
			volumes: { postgres_data: { driver: "local" } },
		});

		const mockYamlParse = mock(() => complexYaml);

		const mockFileText = mock(() => Promise.resolve("mock yaml content"));
		setupBunMocks(mockYamlParse, mockFileText);

		const { EntityCompose } = await import("./compose");
		const entityCompose = new EntityCompose("docker-compose.yml");

		// Test validation with multiple invalid services
		const validation = await entityCompose.validate();
		expect(validation.isValid).toBe(false);
		expect(validation.errors).toHaveLength(2);
		expect(validation.errors.map((e: { code: string }) => e.code)).toEqual([
			"NO_IMAGE_OR_BUILD",
			"NO_IMAGE_OR_BUILD",
		]);

		// Test comprehensive service operations
		const services = await entityCompose.getServices();
		expect(services).toHaveLength(6);

		// Test web-app service
		const webApp = services.find((s) => s.name === "web-app");
		expect(webApp?.image).toBe("nginx:alpine");
		expect(webApp?.ports).toHaveLength(2);
		expect(webApp?.dependencies).toEqual(["api", "db"]);

		// Test API service
		const api = services.find((s) => s.name === "api");
		expect(api?.image).toBeUndefined(); // API service uses build, not image
		expect(api?.ports[0].host).toBe(3000);
		expect(api?.dependencies).toEqual(["db"]);

		// Test database service
		const db = services.find((s) => s.name === "db");
		expect(db?.image).toBe("postgres:13");
		expect(db?.ports[0].host).toBe(5432);

		// Test Redis service
		const redis = services.find((s) => s.name === "redis");
		expect(redis?.image).toBe("redis:alpine");
		expect(redis?.ports[0].host).toBe(6379);

		// Test port mappings across all services
		const allPortMappings = await entityCompose.getPortMappings();
		expect(allPortMappings).toHaveLength(5); // 5 services with ports: web-app(2), api(1), db(1), redis(1)

		const portNumbers = allPortMappings.map((p) => p.host).filter((p) => typeof p === "number");
		expect(portNumbers).toEqual([80, 443, 3000, 5432, 6379]);

		// Test service dependencies graph
		const dependencies = await entityCompose.getServiceDependencies();
		expect(dependencies.services).toHaveLength(6);
		expect(dependencies.dependencies["web-app"]).toEqual(["api", "db"]);
		expect(dependencies.dependencies.api).toEqual(["db"]);
		expect(dependencies.dependencies.db).toEqual([]);
		expect(dependencies.dependencies.redis).toEqual([]);

		// Test service URLs
		const urls = await entityCompose.getServiceUrls();
		expect(urls).toEqual({
			"80": "http://localhost:80",
			"443": "http://localhost:443",
			"3000": "http://localhost:3000",
			"5432": "http://localhost:5432",
			"6379": "http://localhost:6379",
		});

		// Test health status
		const health = await entityCompose.getServiceHealth();
		expect(health).toHaveLength(6);
		expect(health.every((h) => h.status === "healthy")).toBe(true);
		expect(health.every((h) => h.checks === 10)).toBe(true);
		expect(health.every((h) => h.failures === 0)).toBe(true);

		// Cleanup mocks
		await cleanupMocks();
	});
});
