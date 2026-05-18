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

	const assertionPayload = await verifyClientAssertion(parsed.data.client_assertion);
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
): Promise<{ sub: string; iss: string } | null> {
	const unverified = JSON.parse(Buffer.from(assertion.split(".")[1] ?? "", "base64url").toString());
	const claims = assertionSchema.safeParse(unverified);
	if (!claims.success) {
		return null;
	}

	const client = await prisma.machineClient.findFirst({
		where: { clientId: claims.data.sub, revokedAt: null },
	});
	if (!client || client.clientId !== claims.data.iss) {
		return null;
	}

	const jwk = client.publicKeyJwk as JsonWebKey;
	const jwks = createLocalJWKSet({ keys: [jwk] });
	try {
		await jwtVerify(assertion, jwks, {
			algorithms: ["RS256"],
			subject: client.clientId,
			issuer: client.clientId,
		});
	} catch {
		return null;
	}

	return { sub: client.clientId, iss: client.clientId };
}
