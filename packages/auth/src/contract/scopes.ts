export const SCOPES = {
	admin: "feature-flags:admin",
	write: "feature-flags:write",
	read: "feature-flags:read",
} as const;

export type Scope = (typeof SCOPES)[keyof typeof SCOPES];

export const ALL_SCOPES: readonly Scope[] = [SCOPES.admin, SCOPES.write, SCOPES.read];
