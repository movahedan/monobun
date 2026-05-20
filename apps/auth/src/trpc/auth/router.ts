import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { TenantRole } from "@packages/auth-contract";

import { prisma } from "../../db";
import { protectedProcedure, publicProcedure, router } from "../init";
import { humanAccessTokenForMembership } from "./access-token";
import { loginResultForUser } from "./login-result";
import { requestEmailOtp, verifyEmailOtp } from "./otp";
import { verifyPassword } from "./password";
import { checkRateLimit } from "./rate-limit";
import { registerUser } from "./register";
import { revokeSession } from "./session";

export const authRouter = router({
	login: publicProcedure
		.input(z.object({ email: z.string().email(), password: z.string().min(8) }))
		.mutation(async ({ input }) => {
			checkRateLimit(input.email.toLowerCase());
			const user = await prisma.user.findUnique({
				where: { email: input.email.toLowerCase() },
			});
			if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
				throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
			}
			return loginResultForUser(user.id);
		}),

	register: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				password: z.string().min(8).max(128),
				tenantName: z.string().min(1).max(80).optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const email = input.email.toLowerCase();
			checkRateLimit(`register:${email}`);
			const user = await registerUser({
				email,
				password: input.password,
				tenantName: input.tenantName,
			});
			return loginResultForUser(user.id);
		}),

	requestOtp: publicProcedure
		.input(z.object({ email: z.string().email() }))
		.mutation(async ({ input }) => {
			const email = input.email.toLowerCase();
			checkRateLimit(`otp:${email}`);
			return requestEmailOtp(email);
		}),

	verifyOtp: publicProcedure
		.input(z.object({ email: z.string().email(), code: z.string().regex(/^\d{6}$/) }))
		.mutation(async ({ input }) => {
			const email = input.email.toLowerCase();
			checkRateLimit(`otp-verify:${email}`);
			const user = await verifyEmailOtp(email, input.code);
			return loginResultForUser(user.id);
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
