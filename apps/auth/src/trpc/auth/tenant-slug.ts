import { randomBytes } from "node:crypto";

import { prisma } from "../../db";

const MAX_SLUG_LENGTH = 48;
/** RFC 5321 local-part limit; caps ReDoS surface before slugify. */
const MAX_EMAIL_LOCAL_LENGTH = 64;

function isLowerAlphaNumeric(char: string): boolean {
	return (char >= "a" && char <= "z") || (char >= "0" && char <= "9");
}

/** Linear-time slugify (no regex alternation / backtracking on user input). */
function slugifyLocalPart(local: string): string {
	const lowered = local.toLowerCase();
	const chars: string[] = [];
	let pendingDash = false;

	for (const char of lowered) {
		if (isLowerAlphaNumeric(char)) {
			if (pendingDash) {
				chars.push("-");
				pendingDash = false;
			}
			chars.push(char);
			continue;
		}
		if (chars.length > 0) {
			pendingDash = true;
		}
	}

	return chars.join("");
}

export function baseSlugFromEmail(email: string): string {
	const local = (email.split("@")[0] ?? "user").slice(0, MAX_EMAIL_LOCAL_LENGTH);
	const normalized = slugifyLocalPart(local);
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
