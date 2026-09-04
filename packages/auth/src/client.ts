import type { AuthLoginResult, AuthUser } from "./types";

type TrpcSuccess<T> = { readonly result: { readonly data: T } };
type TrpcError = {
	readonly error?: { readonly message?: string; readonly json?: { readonly message?: string } };
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function parseTrpcPayload<TOutput>(payload: unknown, responseOk: boolean): TOutput {
	if (!responseOk || !isRecord(payload)) {
		throw new Error("Auth request failed");
	}

	if ("error" in payload) {
		const err = payload as TrpcError;
		throw new Error(err.error?.json?.message ?? err.error?.message ?? "Authentication failed");
	}

	const success = payload as TrpcSuccess<TOutput>;
	if (!success.result?.data) {
		throw new Error("Unexpected auth response");
	}
	return success.result.data;
}

/**
 * Call `@apps/auth` tRPC mutation over a same-origin base (e.g. Vite `/auth/api` proxy).
 */
export async function authTrpcMutation<TInput, TOutput>(
	trpcBaseUrl: string,
	procedure: string,
	input: TInput,
): Promise<TOutput> {
	const base = trpcBaseUrl.replace(/\/$/, "");
	const response = await fetch(`${base}/${procedure}`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		credentials: "include",
		body: JSON.stringify(input),
	});
	const payload: unknown = await response.json().catch(() => null);
	return parseTrpcPayload(payload, response.ok);
}

/**
 * Call `@apps/auth` tRPC query (GET) with cookies — used after refresh to hydrate user.
 */
export async function authTrpcQuery<TOutput>(
	trpcBaseUrl: string,
	procedure: string,
): Promise<TOutput> {
	const base = trpcBaseUrl.replace(/\/$/, "");
	const response = await fetch(`${base}/${procedure}`, {
		method: "GET",
		credentials: "include",
	});
	const payload: unknown = await response.json().catch(() => null);
	return parseTrpcPayload(payload, response.ok);
}

export async function loginWithPassword(
	trpcBaseUrl: string,
	email: string,
	password: string,
): Promise<AuthLoginResult> {
	return authTrpcMutation(trpcBaseUrl, "auth.login", { email, password });
}

export async function logoutSession(trpcBaseUrl: string): Promise<void> {
	await authTrpcMutation(trpcBaseUrl, "auth.logout", {});
}

export type AuthMeResult = {
	readonly id: string;
	readonly email: string;
	readonly activeTenantId: string | null | undefined;
	readonly memberships: readonly {
		readonly tenantId: string;
		readonly role: string;
	}[];
};

export async function fetchAuthMe(trpcBaseUrl: string): Promise<AuthMeResult> {
	return authTrpcQuery(trpcBaseUrl, "auth.me");
}

export function authUserFromMe(me: AuthMeResult): AuthUser {
	const tenantId = me.activeTenantId ?? me.memberships[0]?.tenantId;
	if (!tenantId) {
		throw new Error("No tenant membership");
	}
	const membership = me.memberships.find((row) => row.tenantId === tenantId) ?? me.memberships[0];
	return {
		id: me.id,
		email: me.email,
		tenantId,
		role: membership?.role ?? "member",
	};
}
