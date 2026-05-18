import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { exportJWK, generateKeyPair, SignJWT } from "jose";

import { SCOPES } from "@packages/auth-contract";

import { AppModule } from "../app.module";
import { HttpExceptionFilter } from "../common/filters/http-exception.filter";

const tenantId = "00000000-0000-4000-8000-000000000001";
const userId = "00000000-0000-4000-8000-000000000099";

export type TestJwtEnv = {
	app: INestApplication;
	accessToken: string;
	privateKey: CryptoKey;
};

export async function createTestJwtEnv(): Promise<TestJwtEnv> {
	const { publicKey, privateKey } = await generateKeyPair("RS256");
	const publicJwk = await exportJWK(publicKey);
	publicJwk.alg = "RS256";
	publicJwk.kid = "test";

	const jwksServer = Bun.serve({
		port: 0,
		fetch() {
			return Response.json({ keys: [publicJwk] });
		},
	});

	process.env.AUTH_JWKS_URL = `${jwksServer.url.origin}/.well-known/jwks.json`;
	process.env.AUTH_ISSUER = "http://auth.test";
	process.env.AUTH_AUDIENCE = "monobun-api";
	process.env.AUTH_ALLOW_HEADER_TENANT = "false";

	const now = Math.floor(Date.now() / 1000);
	const accessToken = await new SignJWT({
		scopes: [SCOPES.read],
		tid: tenantId,
	})
		.setProtectedHeader({ alg: "RS256", kid: "test" })
		.setSubject(userId)
		.setIssuer(process.env.AUTH_ISSUER)
		.setAudience(process.env.AUTH_AUDIENCE)
		.setIssuedAt(now)
		.setExpirationTime(now + 3600)
		.sign(privateKey);

	const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
	const app = moduleRef.createNestApplication();
	app.useGlobalFilters(new HttpExceptionFilter());
	app.setGlobalPrefix("api");
	await app.init();

	return { app, accessToken, privateKey };
}
