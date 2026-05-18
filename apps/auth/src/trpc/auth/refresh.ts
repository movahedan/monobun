import type { TenantRole } from "@packages/auth-contract";

import { authConfig } from "../../config";
import { prisma } from "../../db";
import { humanAccessTokenForMembership } from "./access-token";
import {
	hashRefreshToken,
	parseCookies,
	refreshCookieHeader,
	resolveSessionFromCookies,
	rotateSessionRefresh,
} from "./session";

const GENERIC_ERROR = { error: "invalid_grant" as const };

async function accessTokenFromActiveMembership(session: {
	userId: string;
	activeTenantId: string;
	user: {
		memberships: Array<{ tenantId: string; role: string }>;
	};
}): Promise<string | null> {
	const membership = session.user.memberships.find((m) => m.tenantId === session.activeTenantId);
	if (!membership) {
		return null;
	}
	return humanAccessTokenForMembership({
		userId: session.userId,
		tenantId: session.activeTenantId,
		role: membership.role as TenantRole,
	});
}

export async function handleRefreshRequest(req: Request): Promise<Response> {
	const cookies = parseCookies(req.headers.get("cookie"));
	const sessionId = cookies[authConfig.cookieSession];
	const refreshToken = cookies[authConfig.cookieRefresh];

	if (!sessionId || !refreshToken) {
		return Response.json(GENERIC_ERROR, { status: 401 });
	}

	const session = await prisma.session.findFirst({
		where: {
			id: sessionId,
			revokedAt: null,
			expiresAt: { gt: new Date() },
			refreshTokenHash: hashRefreshToken(refreshToken),
		},
		include: {
			user: { include: { memberships: true } },
		},
	});

	if (!session?.activeTenantId) {
		return Response.json(GENERIC_ERROR, { status: 401 });
	}

	const accessToken = await accessTokenFromActiveMembership({
		userId: session.userId,
		activeTenantId: session.activeTenantId,
		user: session.user,
	});
	if (!accessToken) {
		return Response.json(GENERIC_ERROR, { status: 401 });
	}

	const rotated = await rotateSessionRefresh(session.id);
	if (!rotated) {
		return Response.json(GENERIC_ERROR, { status: 401 });
	}

	const maxAge = authConfig.refreshTtlDays * 24 * 60 * 60;
	const headers = new Headers({ "content-type": "application/json" });
	headers.append("set-cookie", refreshCookieHeader(rotated.refreshToken, maxAge));

	return Response.json(
		{
			access_token: accessToken,
			token_type: "Bearer",
			expires_in: authConfig.accessTtlSeconds,
		},
		{ headers },
	);
}

export async function refreshFromSessionCookie(req: Request) {
	const session = await resolveSessionFromCookies(req.headers.get("cookie"));
	if (!session?.activeTenantId) {
		return null;
	}
	const accessToken = await accessTokenFromActiveMembership({
		userId: session.userId,
		activeTenantId: session.activeTenantId,
		user: session.user,
	});
	if (!accessToken) {
		return null;
	}
	const membership = session.user.memberships.find((m) => m.tenantId === session.activeTenantId);
	return { accessToken, session, membership };
}
