import { createLocalJWKSet, jwtVerify } from "jose";
import { z } from "zod";

import { SCOPES, type Scope } from "@packages/auth-contract";

import { authConfig } from "../../config";
import { prisma } from "../../db";
import { signMachineAccessToken } from "./jwt";

const assertionSchema = z.object({
	iss: z.string(),
	sub: z.string(),
	aud: z.union([z.string(), z.array(z.string())]),
	exp: z.number(),
	iat: z.number().optional(),
	jti: z.string().optional(),
});

const tokenRequestSchema = z.object({
	grant_type: z.literal("client_credentials"),
	client_assertion_type: z.literal("urn:ietf:params:oauth:client-assertion-type:jwt-bearer"),
	client_assertion: z.string(),
	client_id: z.string().min(1),
	scope: z.string().optional(),
});

export async function handleTokenRequest(req: Request): Promise<Response> {
	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return Response.json({ error: "invalid_request" }, { status: 400 });
	}

	const parsed = tokenRequestSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json({ error: "invalid_request" }, { status: 400 });
	}

	const assertionPayload = await verifyClientAssertion(
		parsed.data.client_assertion,
		parsed.data.client_id,
	);
	if (!assertionPayload) {
		return Response.json({ error: "invalid_client" }, { status: 401 });
	}

	const machineClient = await prisma.machineClient.findFirst({
		where: { clientId: assertionPayload.sub, revokedAt: null },
	});
	if (!machineClient) {
		return Response.json({ error: "invalid_client" }, { status: 401 });
	}

	const requestedScopes = parsed.data.scope
		? parsed.data.scope.split(" ").filter(Boolean)
		: [...machineClient.allowedScopes];

	const allowed = new Set(machineClient.allowedScopes);
	const scopes = requestedScopes.filter((s): s is Scope =>
		(Object.values(SCOPES) as string[]).includes(s),
	);
	if (!scopes.every((s) => allowed.has(s))) {
		return Response.json({ error: "invalid_scope" }, { status: 400 });
	}

	const accessToken = await signMachineAccessToken({
		clientId: machineClient.clientId,
		scopes,
		audience: authConfig.audienceEval,
	});

	return Response.json({
		access_token: accessToken,
		token_type: "Bearer",
		expires_in: authConfig.accessTtlSeconds,
		scope: scopes.join(" "),
	});
}

async function verifyClientAssertion(
	assertion: string,
	clientId: string,
): Promise<{ sub: string; iss: string } | null> {
	const client = await prisma.machineClient.findFirst({
		where: { clientId, revokedAt: null },
	});
	if (!client) {
		return null;
	}

	const jwk = client.publicKeyJwk as JsonWebKey;
	const jwks = createLocalJWKSet({ keys: [jwk] });
	try {
		const { payload } = await jwtVerify(assertion, jwks, {
			algorithms: ["RS256"],
			subject: clientId,
			issuer: clientId,
		});
		const claims = assertionSchema.safeParse(payload);
		if (!claims.success || claims.data.sub !== clientId || claims.data.iss !== clientId) {
			return null;
		}
	} catch {
		return null;
	}

	return { sub: clientId, iss: clientId };
}
