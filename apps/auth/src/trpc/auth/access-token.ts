import type { TenantRole } from "@packages/auth-contract";

import { signHumanAccessToken } from "./jwt";

export async function humanAccessTokenForMembership(input: {
	userId: string;
	tenantId: string;
	role: TenantRole;
}): Promise<string> {
	return signHumanAccessToken({
		sub: input.userId,
		tid: input.tenantId,
		role: input.role,
	});
}
