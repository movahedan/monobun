import { EntityAffected, EntityCompose } from "intershell";

import { PROD_COMPOSE_FILE } from "../container/stack";

const WORKSPACE_PACKAGE_FIELD = "x-monobun-package";

type ComposeServiceDef = {
	[WORKSPACE_PACKAGE_FIELD]?: string;
};

/**
 * Maps Turbo-affected packages to prod compose service names using `x-monobun-package`
 * on each service (see docker-compose.yml). Avoids intershell `getAffectedServices`, which
 * relies on a module-level package list that is empty/wrong when intershell resolves from
 * `tools/scripts/node_modules` in CI.
 */
export async function getAffectedComposeServices(baseSha?: string, to = "HEAD"): Promise<string[]> {
	const affectedPackages = new Set(await EntityAffected.getAffectedPackages(baseSha, to));
	if (affectedPackages.size === 0) {
		return [];
	}

	const compose = new EntityCompose(PROD_COMPOSE_FILE);
	const [composeData, services] = await Promise.all([compose.getCompose(), compose.getServices()]);

	const matched = new Set<string>();

	for (const service of services) {
		const definition = composeData.services[service.name] as ComposeServiceDef | undefined;
		const workspacePackage = definition?.[WORKSPACE_PACKAGE_FIELD];
		if (workspacePackage === undefined || !affectedPackages.has(workspacePackage)) {
			continue;
		}

		matched.add(service.name);
		for (const dependency of service.dependencies ?? []) {
			matched.add(dependency);
		}
	}

	return [...matched].sort();
}
