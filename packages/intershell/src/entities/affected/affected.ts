import { entitiesShell } from "../entities.shell";
import { EntityTag } from "../tag";

export const EntityAffected = {
	async getAffectedPackages(baseSha?: string, to = "HEAD"): Promise<string[]> {
		const fromSha = await EntityTag.getBaseCommitSha(baseSha);

		const affected = await entitiesShell
			.turboRunBuild([`--filter="...[${fromSha}...${to}]"`, "--dry-run=json"])
			.json();

		return affected.packages.slice(1);
	},
};
