export {
	type AuthMeResult,
	authTrpcMutation,
	authTrpcQuery,
	authUserFromMe,
	fetchAuthMe,
	loginWithPassword,
	logoutSession,
} from "./client";
/** Shared scopes / JWT claim types (also `@packages/auth/contract`). */
export type { HumanAccessClaims, MachineAccessClaims } from "./contract";
export {
	ALL_SCOPES,
	hasScope,
	ROLE_SCOPES,
	SCOPES,
	type Scope,
	type TenantRole,
} from "./contract";
export { createAuthFetcherBindings } from "./fetcher-bindings";
export {
	AuthSession,
	type AuthSessionSnapshot,
	type AuthSessionStatus,
	authSession,
} from "./session";
export type {
	AuthLoginResult,
	AuthSessionOptions,
	AuthUser,
	ResolvedAuthSessionOptions,
} from "./types";
export {
	DEFAULT_AUTH_SESSION_OPTIONS,
	resolveAuthSessionOptions,
} from "./types";
