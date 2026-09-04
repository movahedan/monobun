export type AuthUser = {
	readonly id: string;
	readonly email: string;
	readonly tenantId: string;
	readonly role: string;
};

export type AuthLoginResult = {
	readonly accessToken: string;
	readonly sessionId: string;
	readonly refreshToken: string;
	readonly user: AuthUser;
};

export type AuthSessionOptions = {
	/** POST refresh endpoint (same-origin proxy recommended). Default `/auth/api/refresh`. */
	readonly refreshUrl?: string;
	/** tRPC HTTP base (no trailing slash). Default `/auth/api`. */
	readonly trpcBaseUrl?: string;
	readonly sessionCookieName?: string;
	readonly refreshCookieName?: string;
	/** Access-token lifetime used for proactive refresh. Default 15 minutes. */
	readonly accessTtlMs?: number;
	/** Cookie Max-Age for session/refresh. Default 30 days. */
	readonly cookieMaxAgeSeconds?: number;
};

export type ResolvedAuthSessionOptions = {
	readonly refreshUrl: string;
	readonly trpcBaseUrl: string;
	readonly sessionCookieName: string;
	readonly refreshCookieName: string;
	readonly accessTtlMs: number;
	readonly cookieMaxAgeSeconds: number;
};

export const DEFAULT_AUTH_SESSION_OPTIONS: ResolvedAuthSessionOptions = {
	refreshUrl: "/auth/api/refresh",
	trpcBaseUrl: "/auth/api",
	sessionCookieName: "auth_session",
	refreshCookieName: "auth_refresh",
	accessTtlMs: 15 * 60 * 1000,
	cookieMaxAgeSeconds: 30 * 24 * 60 * 60,
};

export function resolveAuthSessionOptions(
	options?: AuthSessionOptions,
): ResolvedAuthSessionOptions {
	return {
		refreshUrl: options?.refreshUrl ?? DEFAULT_AUTH_SESSION_OPTIONS.refreshUrl,
		trpcBaseUrl: options?.trpcBaseUrl ?? DEFAULT_AUTH_SESSION_OPTIONS.trpcBaseUrl,
		sessionCookieName: options?.sessionCookieName ?? DEFAULT_AUTH_SESSION_OPTIONS.sessionCookieName,
		refreshCookieName: options?.refreshCookieName ?? DEFAULT_AUTH_SESSION_OPTIONS.refreshCookieName,
		accessTtlMs: options?.accessTtlMs ?? DEFAULT_AUTH_SESSION_OPTIONS.accessTtlMs,
		cookieMaxAgeSeconds:
			options?.cookieMaxAgeSeconds ?? DEFAULT_AUTH_SESSION_OPTIONS.cookieMaxAgeSeconds,
	};
}
