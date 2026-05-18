import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { TenantRole } from "@packages/auth-contract";

import { prisma } from "../../db";
import { protectedProcedure, publicProcedure, router } from "../init";
import { humanAccessTokenForMembership } from "./access-token";
import { verifyPassword } from "./password";
import { createSession, revokeSession } from "./session";

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 60_000;

function checkRateLimit(key: string): void {
	const now = Date.now();
	const entry = loginAttempts.get(key);
	if (!entry || entry.resetAt < now) {
		loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
		return;
	}
	entry.count += 1;
	if (entry.count > MAX_ATTEMPTS) {
		throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many attempts" });
	}
}

export const authRouter = router({
	login: publicProcedure
		.input(z.object({ email: z.string().email(), password: z.string().min(8) }))
		.mutation(async ({ input }) => {
			checkRateLimit(input.email.toLowerCase());
			const user = await prisma.user.findUnique({
				where: { email: input.email.toLowerCase() },
				include: { memberships: { include: { tenant: true } } },
			});
			if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
				throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
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
		}),

	logout: protectedProcedure.mutation(async ({ ctx }) => {
		if (ctx.sessionId) {
			await revokeSession(ctx.sessionId);
		}
		return { ok: true };
	}),

	me: protectedProcedure.query(async ({ ctx }) => {
		const user = await prisma.user.findUnique({
			where: { id: ctx.userId },
			include: { memberships: { include: { tenant: true } } },
		});
		if (!user) {
			throw new TRPCError({ code: "NOT_FOUND" });
		}
		return {
			id: user.id,
			email: user.email,
			activeTenantId: ctx.activeTenantId,
			memberships: user.memberships.map((m) => ({
				tenantId: m.tenantId,
				role: m.role,
				tenantName: m.tenant.name,
				tenantSlug: m.tenant.slug,
			})),
		};
	}),

	switchTenant: protectedProcedure
		.input(z.object({ tenantId: z.uuid() }))
		.mutation(async ({ ctx, input }) => {
			const membership = await prisma.tenantMember.findFirst({
				where: { userId: ctx.userId, tenantId: input.tenantId },
			});
			if (!membership) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}
			if (ctx.sessionId) {
				await prisma.session.update({
					where: { id: ctx.sessionId },
					data: { activeTenantId: input.tenantId },
				});
			}
			const accessToken = await humanAccessTokenForMembership({
				userId: ctx.userId,
				tenantId: input.tenantId,
				role: membership.role as TenantRole,
			});
			return { accessToken, tenantId: input.tenantId };
		}),
});

export type AuthRouter = typeof authRouter;
