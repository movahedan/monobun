import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { exportJWK, generateKeyPair, SignJWT } from "jose";

import { SCOPES } from "@packages/auth-contract";

import { authConfig } from "../config";
import { prisma } from "../db";
import { verifyAccessToken } from "../trpc/auth/jwt";
import { handleTokenRequest } from "../trpc/auth/m2m";

const clientId = "test-m2m-client";
const databaseUrl = process.env.AUTH_DATABASE_URL?.trim();
const describeWithDb = databaseUrl ? describe : describe.skip;

describeWithDb("POST /api/token M2M", () => {
	let privateKey: CryptoKey;

	beforeAll(async () => {
		const keys = await generateKeyPair("RS256");
		privateKey = keys.privateKey;
		const publicKeyJwk = await exportJWK(keys.publicKey);
		publicKeyJwk.alg = "RS256";
		publicKeyJwk.use = "sig";

		await prisma.machineClient.upsert({
			where: { clientId },
			create: {
				clientId,
				name: "Test M2M",
				publicKeyJwk: publicKeyJwk as object,
				allowedScopes: [SCOPES.read],
			},
			update: {
				publicKeyJwk: publicKeyJwk as object,
				allowedScopes: [SCOPES.read],
				revokedAt: null,
			},
		});
	});

	afterAll(async () => {
		await prisma.machineClient.deleteMany({ where: { clientId } });
		await prisma.$disconnect();
	});

	it("issues access_token with feature-flags:read", async () => {
		const now = Math.floor(Date.now() / 1000);
		const assertion = await new SignJWT({})
			.setProtectedHeader({ alg: "RS256" })
			.setIssuer(clientId)
			.setSubject(clientId)
			.setAudience(authConfig.issuer)
			.setIssuedAt(now)
			.setExpirationTime(now + 60)
			.sign(privateKey);

		const req = new Request("http://localhost/api/token", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				grant_type: "client_credentials",
				client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
				client_assertion: assertion,
				client_id: clientId,
				scope: SCOPES.read,
			}),
		});

		const res = await handleTokenRequest(req);
		expect(res.status).toBe(200);
		const body = (await res.json()) as { access_token: string; scope: string };
		expect(body.scope).toContain(SCOPES.read);

		const verified = await verifyAccessToken(body.access_token, authConfig.audienceEval);
		expect(verified.payload.sub).toBe(clientId);
		expect((verified.payload as { scopes: string[] }).scopes).toContain(SCOPES.read);
	});
});
