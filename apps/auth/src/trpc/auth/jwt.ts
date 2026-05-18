import { jwtVerify, SignJWT } from "jose";

import { ROLE_SCOPES, type Scope, type TenantRole } from "@packages/auth-contract";

import { authConfig } from "../../config";
import { getSigningMaterial } from "./keys";

async function signAccessToken(input: {
	sub: string;
	claims: Record<string, unknown>;
	audience: string;
}): Promise<string> {
	const { privateKey, kid } = await getSigningMaterial();
	const now = Math.floor(Date.now() / 1000);
	return new SignJWT(input.claims)
		.setProtectedHeader({ alg: "RS256", kid })
		.setSubject(input.sub)
		.setIssuer(authConfig.issuer)
		.setAudience(input.audience)
		.setIssuedAt(now)
		.setExpirationTime(now + authConfig.accessTtlSeconds)
		.sign(privateKey);
}

export async function signHumanAccessToken(input: {
	sub: string;
	tid: string;
	role: TenantRole;
}): Promise<string> {
	const scopes = [...ROLE_SCOPES[input.role]] as Scope[];
	return signAccessToken({
		sub: input.sub,
		claims: { scopes, tid: input.tid },
		audience: authConfig.audience,
	});
}

export async function signMachineAccessToken(input: {
	clientId: string;
	scopes: Scope[];
	audience?: string;
}): Promise<string> {
	return signAccessToken({
		sub: input.clientId,
		claims: { scopes: input.scopes },
		audience: input.audience ?? authConfig.audienceEval,
	});
}

export async function verifyAccessToken(token: string, audience: string) {
	const { publicKey } = await getSigningMaterial();
	return jwtVerify(token, publicKey, {
		issuer: authConfig.issuer,
		audience,
	});
}
