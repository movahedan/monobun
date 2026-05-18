import { jwtVerify, SignJWT } from "jose";

import type { TenantRole } from "@packages/auth-contract";
import { ROLE_SCOPES, type Scope } from "@packages/auth-contract";

import { authConfig } from "../../config";
import { getSigningMaterial } from "./keys";

export async function signHumanAccessToken(input: {
	sub: string;
	tid: string;
	role: TenantRole;
}): Promise<string> {
	const { privateKey, kid } = await getSigningMaterial();
	const scopes = [...ROLE_SCOPES[input.role]] as Scope[];
	const now = Math.floor(Date.now() / 1000);
	return new SignJWT({ scopes, tid: input.tid })
		.setProtectedHeader({ alg: "RS256", kid })
		.setSubject(input.sub)
		.setIssuer(authConfig.issuer)
		.setAudience(authConfig.audience)
		.setIssuedAt(now)
		.setExpirationTime(now + authConfig.accessTtlSeconds)
		.sign(privateKey);
}

export async function signMachineAccessToken(input: {
	clientId: string;
	scopes: Scope[];
	audience?: string;
}): Promise<string> {
	const { privateKey, kid } = await getSigningMaterial();
	const now = Math.floor(Date.now() / 1000);
	return new SignJWT({ scopes: input.scopes })
		.setProtectedHeader({ alg: "RS256", kid })
		.setSubject(input.clientId)
		.setIssuer(authConfig.issuer)
		.setAudience(input.audience ?? authConfig.audienceEval)
		.setIssuedAt(now)
		.setExpirationTime(now + authConfig.accessTtlSeconds)
		.sign(privateKey);
}

export async function verifyAccessToken(token: string, audience: string) {
	const { publicKey } = await getSigningMaterial();
	return jwtVerify(token, publicKey, {
		issuer: authConfig.issuer,
		audience,
	});
}
