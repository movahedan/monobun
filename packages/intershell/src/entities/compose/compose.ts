import { EntityAffected } from "../affected";
import { EntityPackages } from "../packages";
import type {
	ComposeData,
	ComposeValidationResult,
	EntityAffectedService,
	NetworkDefinition,
	PortMapping,
	ServiceDefinition,
	ServiceDependencyGraph,
	ServiceHealth,
	ServiceInfo,
	VolumeDefinition,
} from "./types";

type TemporaryBunYamlTypeSinceThisIsNotTypedYet = {
	YAML: {
		parse: (input: string) => Record<string, unknown>;
	};
};

const allPackages = await EntityPackages.getAllPackages();

export class EntityCompose {
	private readonly composePath: string;
	private compose: ComposeData | undefined;

	constructor(composePath: string) {
		this.composePath = composePath;
	}

	async validate(): Promise<ComposeValidationResult> {
		const compose = await this.getCompose();
		const errors = [];

		if (!compose.services || Object.keys(compose.services).length === 0) {
			errors.push({
				code: "NO_SERVICES",
				message: "At least one service must be defined",
			});
		}

		// Check each service has required configuration
		for (const [name, service] of Object.entries(compose.services)) {
			if (!service.image && !service.build) {
				errors.push({
					code: "NO_IMAGE_OR_BUILD",
					message: "Service must have either image or build configuration",
					service: name,
				});
			}
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}

	async getCompose(): Promise<ComposeData> {
		this.compose =
			this.compose || EntityCompose.parseDockerCompose(await Bun.file(this.composePath).text());
		return this.compose;
	}

	async getServices(): Promise<ServiceInfo[]> {
		const compose = await this.getCompose();
		const services: ServiceInfo[] = [];

		for (const [name, service] of Object.entries(compose.services)) {
			const ports = EntityCompose.parsePortMappings(service.ports || []);
			const environment = EntityCompose.parseEnvironment(service.environment);

			services.push({
				name,
				image: service.image,
				ports,
				environment,
				volumes: service.volumes || [],
				dependencies: service.depends_on || [],
				health: {
					name,
					status: "unknown",
					checks: 0,
					failures: 0,
				},
			});
		}

		return services;
	}

	async getServiceHealth(): Promise<ServiceHealth[]> {
		const compose = await this.getCompose();
		return Object.keys(compose.services).map((name) => ({
			name,
			status: "healthy" as const,
			checks: 10,
			failures: 0,
			lastCheck: new Date(),
		}));
	}

	async getServiceDependencies(): Promise<ServiceDependencyGraph> {
		const compose = await this.getCompose();
		const services = Object.keys(compose.services);
		const dependencies: Record<string, string[]> = {};

		for (const [name, service] of Object.entries(compose.services)) {
			dependencies[name] = service.depends_on || [];
		}

		return {
			services,
			dependencies,
		};
	}

	async getServiceUrls(): Promise<Record<string, string>> {
		const mappings = await this.getPortMappings();
		return Object.fromEntries(mappings.map((m) => [m.host, `http://localhost:${m.host}`]));
	}

	async getPortMappings(): Promise<PortMapping[]> {
		const compose = await this.getCompose();
		const mappings: PortMapping[] = [];

		for (const service of Object.values(compose.services)) {
			if (service.ports) {
				mappings.push(...EntityCompose.parsePortMappings(service.ports));
			}
		}

		return mappings;
	}

	async getAffectedServices(baseSha?: string, to?: string): Promise<EntityAffectedService[]> {
		try {
			const keys = await EntityAffected.getAffectedPackages(baseSha, to);
			const serviceMap = new Map<string, EntityAffectedService>();
			const affectedServices = new Set<string>();

			const services = await this.getServices();

			// Find services associated with affected packages
			for (const service of services) {
				const associatedPackage = allPackages.find(
					(p) => p.replace(/^@repo\//, "") === service.name,
				);

				if (keys.some((k: string) => k === associatedPackage)) {
					affectedServices.add(service.name);
					serviceMap.set(service.name, {
						name: service.name,
						port: service.ports[0]?.host,
					});

					// Add dependencies
					if (service.dependencies) {
						for (const dep of service.dependencies) {
							affectedServices.add(dep);
						}
					}
				}
			}

			// Add all affected services to the map
			for (const serviceName of affectedServices) {
				if (!serviceMap.has(serviceName)) {
					const devService = services.find((s) => s.name === serviceName);
					if (devService) {
						serviceMap.set(serviceName, {
							name: devService.name,
							port: devService.ports[0]?.host,
						});
					}
				}
			}

			return Array.from(serviceMap.values());
		} catch (error) {
			throw new Error(`Failed to get affected services: ${error}`);
		}
	}

	static parseDockerCompose(input: string): ComposeData {
		const parsed = (Bun as unknown as TemporaryBunYamlTypeSinceThisIsNotTypedYet).YAML.parse(input);

		if (parsed.services) {
			for (const [, service] of Object.entries(parsed.services)) {
				if (service.ports && Array.isArray(service.ports)) {
					(service as Record<string, unknown>).ports = service.ports.map((port: unknown) =>
						typeof port === "string" ? port : String(port),
					);
				}

				if (service.environment && Array.isArray(service.environment)) {
					const envObj: Record<string, string> = {};
					for (const env of service.environment) {
						if (typeof env === "string" && env.includes("=")) {
							const [key, ...valueParts] = env.split("=");
							envObj[key] = valueParts.join("=");
						}
					}
					(service as Record<string, unknown>).environment = envObj;
				}
			}
		}

		return {
			version: (parsed.version as string) || "3.8",
			services: (parsed.services as Record<string, ServiceDefinition>) || {},
			networks: (parsed.networks as Record<string, NetworkDefinition>) || {},
			volumes: (parsed.volumes as Record<string, VolumeDefinition>) || {},
			validation: {
				isValid: true,
				errors: [],
			},
		};
	}

	public static parsePortMappings(ports: string[]): PortMapping[] {
		return ports.map((port) => {
			const [host, container] = port.split(":").map(Number);
			return {
				host: host ?? container,
				container: container ?? host,
				protocol: "tcp" as const,
			};
		});
	}

	public static parseEnvironment(env?: Record<string, string> | string[]): Record<string, string> {
		if (!env) return {};

		if (Array.isArray(env)) {
			const result: Record<string, string> = {};
			for (const item of env) {
				if (typeof item === "string" && item.includes("=")) {
					const [key, ...valueParts] = item.split("=");
					if (key && valueParts.length > 0) {
						result[key] = valueParts.join("=");
					}
				}
			}
			return result;
		}

		return env;
	}
}
