import { createHash, randomInt, randomUUID } from "node:crypto";

import { TRPCError } from "@trpc/server";

import { log } from "@packages/utils/logger";

import { authConfig } from "../../config";
import { prisma } from "../../db";
import { hashPassword } from "./password";
import { uniqueTenantSlug } from "./tenant-slug";

const OTP_PURPOSE = "sign-in";

function hashOtpCode(code: string): string {
	return createHash("sha256").update(code).digest("hex");
}

function generateOtpCode(): string {
	return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function requestEmailOtp(email: string): Promise<{ ok: true }> {
	if (!authConfig.allowOtp) {
		throw new TRPCError({ code: "FORBIDDEN", message: "OTP sign-in is disabled" });
	}

	const normalized = email.toLowerCase();
	const code = generateOtpCode();
	const expiresAt = new Date(Date.now() + authConfig.otpTtlMinutes * 60_000);

	await prisma.emailOtp.create({
		data: {
			email: normalized,
			codeHash: hashOtpCode(code),
			purpose: OTP_PURPOSE,
			expiresAt,
		},
	});

	if (authConfig.otpLogToConsole) {
		log(`[auth] OTP for ${normalized}: ${code} (expires in ${authConfig.otpTtlMinutes}m)`);
	}

	return { ok: true };
}

export async function verifyEmailOtp(email: string, code: string) {
	if (!authConfig.allowOtp) {
		throw new TRPCError({ code: "FORBIDDEN", message: "OTP sign-in is disabled" });
	}

	const normalized = email.toLowerCase();
	const otp = await prisma.emailOtp.findFirst({
		where: {
			email: normalized,
			purpose: OTP_PURPOSE,
			consumedAt: null,
			expiresAt: { gt: new Date() },
		},
		orderBy: { createdAt: "desc" },
	});
	if (!otp || otp.codeHash !== hashOtpCode(code)) {
		throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired code" });
	}

	await prisma.emailOtp.update({
		where: { id: otp.id },
		data: { consumedAt: new Date() },
	});

	let user = await prisma.user.findUnique({ where: { email: normalized } });
	if (!user) {
		if (!authConfig.allowRegistration) {
			throw new TRPCError({ code: "FORBIDDEN", message: "Registration is disabled" });
		}
		const passwordHash = await hashPassword(randomUUID());
		const tenantName = `${normalized.split("@")[0]}'s workspace`;
		const slug = await uniqueTenantSlug(normalized);
		user = await prisma.$transaction(async (tx) => {
			const created = await tx.user.create({
				data: {
					email: normalized,
					passwordHash,
					emailVerifiedAt: new Date(),
				},
			});
			const tenant = await tx.tenant.create({
				data: { name: tenantName, slug },
			});
			await tx.tenantMember.create({
				data: { userId: created.id, tenantId: tenant.id, role: "owner" },
			});
			return created;
		});
	}

	return user;
}
