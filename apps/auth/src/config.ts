function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required env: ${name}`);
	}
	return value;
}

function optionalEnv(name: string, fallback: string): string {
	return process.env[name] ?? fallback;
}

export const authConfig = {
	host: optionalEnv("HOST", "0.0.0.0"),
	port: Number(optionalEnv("AUTH_PORT", optionalEnv("PORT", "3007"))),
	issuer: optionalEnv("AUTH_ISSUER", "http://localhost:3007"),
	audience: optionalEnv("AUTH_AUDIENCE", "monobun-api"),
	audienceEval: optionalEnv("AUTH_AUDIENCE_EVAL", "monobun-eval"),
	accessTtlSeconds: Number(optionalEnv("AUTH_ACCESS_TTL_SECONDS", "900")),
	refreshTtlDays: 30,
	databaseUrl: () => requireEnv("AUTH_DATABASE_URL"),
	cookieSession: optionalEnv("AUTH_COOKIE_SESSION", "auth_session"),
	cookieRefresh: optionalEnv("AUTH_COOKIE_REFRESH", "auth_refresh"),
	cookieCsrf: optionalEnv("AUTH_COOKIE_CSRF", "auth_csrf"),
	cookieSecure: optionalEnv("AUTH_COOKIE_SECURE", "false") === "true",
	jwtPrivateKey: () => optionalEnv("AUTH_JWT_PRIVATE_KEY", "./dev-keys/private.pem"),
	jwtPublicKey: () => optionalEnv("AUTH_JWT_PUBLIC_KEY", "./dev-keys/public.pem"),
	seedAdminEmail: optionalEnv("AUTH_SEED_ADMIN_EMAIL", "admin@example.com"),
	seedAdminPassword: () => requireEnv("AUTH_SEED_ADMIN_PASSWORD"),
} as const;
