import { TRPCError } from "@trpc/server";

import { authConfig } from "../../config";
import { prisma } from "../../db";
import { hashPassword } from "./password";
import { uniqueTenantSlug } from "./tenant-slug";

export type RegisterInput = Readonly<{
	email: string;
	password: string;
	tenantName?: string;
}>;

export async function registerUser(input: RegisterInput) {
	if (!authConfig.allowRegistration) {
		throw new TRPCError({ code: "FORBIDDEN", message: "Registration is disabled" });
	}

	const email = input.email.toLowerCase();
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
	}

	const passwordHash = await hashPassword(input.password);
	const tenantName = input.tenantName?.trim() || `${email.split("@")[0]}'s workspace`;
	const slug = await uniqueTenantSlug(email);

	return prisma.$transaction(async (tx) => {
		const user = await tx.user.create({
			data: {
				email,
				passwordHash,
				emailVerifiedAt: new Date(),
			},
		});
		const tenant = await tx.tenant.create({
			data: { name: tenantName, slug },
		});
		await tx.tenantMember.create({
			data: { userId: user.id, tenantId: tenant.id, role: "owner" },
		});
		return user;
	});
}
