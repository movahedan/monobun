import { entitiesShell } from "../entities.shell";

export const EntityAffected = {
	async getAffectedPackages(baseSha?: string, to = "HEAD"): Promise<string[]> {
		const { EntityTag } = await import("../tag");
		const fromSha = await EntityTag.getBaseCommitSha(baseSha);

		try {
			const result = await entitiesShell.turboRunBuild([`--filter=...[${fromSha}...${to}]`]).text();
			const turboOutput = JSON.parse(result);

			const packages = turboOutput.tasks?.map((task: { package: string }) => task.package) || [];

			// Filter out root package and undefined values
			return packages.filter((pkg: string) => pkg && pkg !== "//");
		} catch (error) {
			console.warn(`Failed to get affected packages via turbo: ${error}`);
			// Fallback: return empty array
			return [];
		}
	},
};
