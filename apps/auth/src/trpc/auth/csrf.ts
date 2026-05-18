import { createHash, randomBytes } from "node:crypto";

import { authConfig } from "../../config";

export function createCsrfToken(): string {
	return randomBytes(32).toString("hex");
}

export function csrfCookieOptions(maxAgeSeconds: number) {
	return {
		httpOnly: false,
		secure: authConfig.cookieSecure,
		sameSite: "lax" as const,
		path: "/",
		maxAge: maxAgeSeconds,
	};
}

export function validateCsrf(
	cookieToken: string | undefined,
	formToken: string | undefined,
): boolean {
	if (!cookieToken || !formToken) {
		return false;
	}
	const a = createHash("sha256").update(cookieToken).digest("hex");
	const b = createHash("sha256").update(formToken).digest("hex");
	return a === b;
}

export function csrfCookieHeader(token: string, maxAgeSeconds: number): string {
	const opts = csrfCookieOptions(maxAgeSeconds);
	const parts = [
		`${authConfig.cookieCsrf}=${token}`,
		`Path=${opts.path}`,
		`Max-Age=${opts.maxAge}`,
		`SameSite=${opts.sameSite}`,
	];
	if (opts.secure) {
		parts.push("Secure");
	}
	return parts.join("; ");
}
