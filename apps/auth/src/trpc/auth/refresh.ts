import type { TenantRole } from "@packages/auth-contract";

import { authConfig } from "../../config";
import { prisma } from "../../db";
import { signHumanAccessToken } from "./jwt";
import {
	hashRefreshToken,
	parseCookies,
	refreshCookieHeader,
	resolveSessionFromCookies,
	rotateSessionRefresh,
} from "./session";

const GENERIC_ERROR = { error: "invalid_grant" as const };

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

	const membership = session.user.memberships.find((m) => m.tenantId === session.activeTenantId);
	if (!membership) {
		return Response.json(GENERIC_ERROR, { status: 401 });
	}

	const rotated = await rotateSessionRefresh(session.id);
	if (!rotated) {
		return Response.json(GENERIC_ERROR, { status: 401 });
	}

	const accessToken = await signHumanAccessToken({
		sub: session.userId,
		tid: session.activeTenantId,
		role: membership.role as TenantRole,
	});

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
	const membership = session.user.memberships.find((m) => m.tenantId === session.activeTenantId);
	if (!membership) {
		return null;
	}
	const accessToken = await signHumanAccessToken({
		sub: session.userId,
		tid: session.activeTenantId,
		role: membership.role as TenantRole,
	});
	return { accessToken, session, membership };
}
