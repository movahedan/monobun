import { EntityAffected, EntityCompose, EntityPackage } from "intershell";

import { DEV_COMPOSE_FILE, PROD_COMPOSE_FILE } from "../container/stack";

/** Dev-only compose services — not built by production CI (`container --prod compose build`). */
const NON_PROD_BUILD_SERVICES = new Set(["apps", "postgres"]);

/** Matches intershell compose mapping: `@apps/nestjs` → `nestjs` (not exported from intershell entry). */
function packageNameToComposeServiceKey(packageName: string): string {
	if (!packageName.startsWith("@") || !packageName.includes("/")) {
		return packageName;
	}
	const withoutScope = packageName.slice(1);
	const slashIndex = withoutScope.lastIndexOf("/");
	return slashIndex === -1 ? withoutScope : withoutScope.slice(slashIndex + 1);
}

function isAffectedPackage(packageName: string, affectedPackages: readonly string[]): boolean {
	return affectedPackages.includes(packageName);
}

function findPackageForService(
	serviceName: string,
	allPackages: readonly string[],
): string | undefined {
	return allPackages.find(
		(packageName) => packageNameToComposeServiceKey(packageName) === serviceName,
	);
}

async function collectAffectedFromCompose(
	composePath: string,
	affectedPackages: readonly string[],
	allPackages: readonly string[],
): Promise<Set<string>> {
	const matched = new Set<string>();
	const services = await new EntityCompose(composePath).getServices();

	for (const service of services) {
		const packageName = findPackageForService(service.name, allPackages);
		if (packageName === undefined || !isAffectedPackage(packageName, affectedPackages)) {
			continue;
		}

		matched.add(service.name);
		for (const dependency of service.dependencies ?? []) {
			matched.add(dependency);
		}
	}

	return matched;
}

/**
 * Maps Turbo-affected workspace packages to Docker Compose service names for CI prod builds.
 * Scans dev + prod compose so apps only in dev (e.g. during rollout) still resolve; output is
 * limited to services defined in `docker-compose.yml`.
 */
export async function getAffectedComposeServices(baseSha?: string, to = "HEAD"): Promise<string[]> {
	const affectedPackages = await EntityAffected.getAffectedPackages(baseSha, to);
	if (affectedPackages.length === 0) {
		return [];
	}

	const allPackages = await EntityPackage.getAllPackages();
	const prodServices = await new EntityCompose(PROD_COMPOSE_FILE).getServices();
	const prodServiceNames = new Set(prodServices.map((service) => service.name));

	const fromProd = await collectAffectedFromCompose(
		PROD_COMPOSE_FILE,
		affectedPackages,
		allPackages,
	);
	const fromDev = await collectAffectedFromCompose(DEV_COMPOSE_FILE, affectedPackages, allPackages);

	const merged = new Set([...fromProd, ...fromDev]);

	return [...merged]
		.filter((name) => prodServiceNames.has(name))
		.filter((name) => !NON_PROD_BUILD_SERVICES.has(name))
		.sort();
}
