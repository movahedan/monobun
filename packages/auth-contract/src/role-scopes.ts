import { SCOPES, type Scope } from "./scopes";

export type TenantRole = "owner" | "admin" | "member";

export const ROLE_SCOPES: Record<TenantRole, readonly Scope[]> = {
	owner: [SCOPES.admin, SCOPES.write, SCOPES.read],
	admin: [SCOPES.admin, SCOPES.write, SCOPES.read],
	member: [SCOPES.read],
};

const SCOPE_RANK: Record<Scope, number> = {
	[SCOPES.read]: 1,
	[SCOPES.write]: 2,
	[SCOPES.admin]: 3,
};

/** `admin` satisfies `write` and `read`; `write` satisfies `read`. */
export function hasScope(granted: readonly string[], required: Scope): boolean {
	if (granted.includes(required)) {
		return true;
	}
	const requiredRank = SCOPE_RANK[required];
	let maxRank = 0;
	for (const scope of granted) {
		const rank = SCOPE_RANK[scope as Scope];
		if (rank !== undefined && rank > maxRank) {
			maxRank = rank;
		}
	}
	return maxRank >= requiredRank;
}
