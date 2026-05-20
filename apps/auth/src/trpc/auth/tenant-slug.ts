import { randomBytes } from "node:crypto";

import { prisma } from "../../db";

const MAX_SLUG_LENGTH = 48;

export function baseSlugFromEmail(email: string): string {
	const local = email.split("@")[0] ?? "user";
	const normalized = local
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return (normalized || "workspace").slice(0, MAX_SLUG_LENGTH);
}

export async function uniqueTenantSlug(email: string): Promise<string> {
	const base = baseSlugFromEmail(email);
	const existing = await prisma.tenant.findUnique({ where: { slug: base } });
	if (!existing) {
		return base;
	}
	const suffix = randomBytes(3).toString("hex");
	return `${base.slice(0, MAX_SLUG_LENGTH - 7)}-${suffix}`;
}
