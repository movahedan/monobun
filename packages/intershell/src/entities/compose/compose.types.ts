export interface ComposeData {
	readonly version: string;
	readonly services: Record<string, ServiceDefinition>;
	readonly networks: Record<string, NetworkDefinition>;
	readonly volumes: Record<string, VolumeDefinition>;
	readonly validation: ComposeValidationResult;
}

export interface ServiceDefinition {
	readonly image?: string;
	readonly build?: string | BuildDefinition;
	readonly ports?: string[];
	readonly environment?: Record<string, string> | string[];
	readonly volumes?: string[];
	readonly depends_on?: string[];
	readonly networks?: string[];
	readonly restart?: string;
	readonly command?: string | string[];
	readonly entrypoint?: string | string[];
}

export interface BuildDefinition {
	readonly context: string;
	readonly dockerfile?: string;
	readonly args?: Record<string, string>;
}

export interface NetworkDefinition {
	readonly driver?: string;
	readonly external?: boolean;
}

export interface VolumeDefinition {
	readonly driver?: string;
	readonly external?: boolean;
}

export interface ServiceInfo {
	readonly name: string;
	readonly image?: string;
	readonly ports: PortMapping[];
	readonly environment: Record<string, string>;
	readonly volumes: string[];
	readonly dependencies: string[];
	readonly health: ServiceHealth;
}

export interface PortMapping {
	readonly host: number;
	readonly container: number;
	readonly protocol: "tcp" | "udp";
}

export interface ServiceHealth {
	readonly name: string;
	readonly status: "healthy" | "unhealthy" | "starting" | "unknown";
	readonly checks: number;
	readonly failures: number;
	readonly lastCheck?: Date;
}

export interface ServiceDependencyGraph {
	readonly services: string[];
	readonly dependencies: Record<string, string[]>;
}

export interface PortConflict {
	readonly port: number;
	readonly services: string[];
	readonly severity: "error" | "warning";
}

export interface EntityAffectedService {
	readonly name: string;
	readonly port?: number;
}

export interface ComposeValidationResult {
	readonly isValid: boolean;
	readonly errors: ComposeValidationError[];
}

export interface ComposeValidationError {
	readonly code: string;
	readonly message: string;
	readonly service?: string;
	readonly field?: string;
}
