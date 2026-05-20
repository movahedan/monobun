import { TRPCError } from "@trpc/server";

import type { TenantRole } from "@packages/auth-contract";

import { prisma } from "../../db";
import { humanAccessTokenForMembership } from "./access-token";
import { createSession } from "./session";

export async function loginResultForUser(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: { memberships: { include: { tenant: true } } },
	});
	if (!user) {
		throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
	}
	const membership = user.memberships[0];
	if (!membership) {
		throw new TRPCError({ code: "FORBIDDEN", message: "No tenant membership" });
	}
	const { sessionId, refreshToken } = await createSession({
		userId: user.id,
		activeTenantId: membership.tenantId,
	});
	const accessToken = await humanAccessTokenForMembership({
		userId: user.id,
		tenantId: membership.tenantId,
		role: membership.role as TenantRole,
	});
	return {
		accessToken,
		sessionId,
		refreshToken,
		user: {
			id: user.id,
			email: user.email,
			tenantId: membership.tenantId,
			role: membership.role,
		},
	};
}
