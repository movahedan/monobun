import { EntityAffected } from "../affected";
import { EntityPackages } from "../packages";
import type {
	ComposeData,
	ComposeValidationResult,
	EntityAffectedService,
	PortMapping,
	ServiceDependencyGraph,
	ServiceHealth,
	ServiceInfo,
} from "./types";
import { parseDockerCompose } from "./yaml-parser";

const allPackages = await EntityPackages.getAllPackages();

export class EntityCompose {
	private readonly composePath: string;
	private compose: Promise<ComposeData>;

	constructor(composePath: string) {
		this.composePath = composePath;
		this.compose = this.read();
	}

	async validate(): Promise<ComposeValidationResult> {
		const compose = await this.compose;
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

	async read(): Promise<ComposeData> {
		return parseDockerCompose(await Bun.file(this.composePath).text());
	}

	async getCompose(): Promise<ComposeData> {
		return await this.compose;
	}

	async getServices(): Promise<ServiceInfo[]> {
		const compose = await this.compose;
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
		const compose = await this.compose;
		return Object.keys(compose.services).map((name) => ({
			name,
			status: "healthy" as const,
			checks: 10,
			failures: 0,
			lastCheck: new Date(),
		}));
	}

	async getServiceDependencies(): Promise<ServiceDependencyGraph> {
		const compose = await this.compose;
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
		const compose = await this.compose;
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

	private static parsePortMappings(ports: string[]): PortMapping[] {
		return ports.map((port) => {
			const [host, container] = port.split(":").map(Number);
			return {
				host: host || container,
				container: container || host,
				protocol: "tcp" as const,
			};
		});
	}

	private static parseEnvironment(env?: Record<string, string> | string[]): Record<string, string> {
		if (!env) return {};

		if (Array.isArray(env)) {
			const result: Record<string, string> = {};
			for (const item of env) {
				const [key, value] = item.split("=");
				if (key && value) {
					result[key] = value;
				}
			}
			return result;
		}

		return env;
	}
}
