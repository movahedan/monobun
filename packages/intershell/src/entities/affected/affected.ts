import { entitiesShell } from "../entities.shell";

export const EntityAffected = {
	async getAffectedPackages(baseSha?: string, to = "HEAD"): Promise<string[]> {
		const { EntityTag } = await import("../tag");
		const fromSha = await EntityTag.getBaseCommitSha(baseSha);

		const affected = await entitiesShell
			.turboRunBuild([`--filter="...[${fromSha}...${to}]"`, "--dry-run=json"])
			.json();

		return affected.packages.slice(1);
	},
};
