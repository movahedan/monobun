import "reflect-metadata";

import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import type { INestApplication } from "@nestjs/common";
import { SignJWT } from "jose";
import supertest from "supertest";

import { createTestJwtEnv, type TestJwtEnv } from "./test-jwt-env";

const tenantId = "00000000-0000-4000-8000-000000000001";
const userId = "00000000-0000-4000-8000-000000000099";

describe("@apps/nestjs JwtAuthGuard", () => {
	let env: TestJwtEnv;
	let app: INestApplication;
	let accessToken: string;
	let privateKey: CryptoKey;

	beforeAll(async () => {
		env = await createTestJwtEnv();
		app = env.app;
		accessToken = env.accessToken;
		privateKey = env.privateKey;
	});

	afterAll(async () => {
		await app.close();
	});

	it("GET /api/v1/tenants accepts valid Bearer token", async () => {
		await supertest(app.getHttpServer())
			.get("/api/v1/tenants")
			.set("Authorization", `Bearer ${accessToken}`)
			.expect(200);
	});

	it("GET /api/v1/tenants without token returns 401", async () => {
		const response = await supertest(app.getHttpServer()).get("/api/v1/tenants").expect(401);
		expect(response.body.message).toMatch(/Bearer|token/i);
	});

	it("GET /api/v1/tenants with wrong scope returns 403", async () => {
		const now = Math.floor(Date.now() / 1000);
		const noScopeToken = await new SignJWT({ scopes: [], tid: tenantId })
			.setProtectedHeader({ alg: "RS256", kid: "test" })
			.setSubject(userId)
			.setIssuer(process.env.AUTH_ISSUER ?? "http://auth.test")
			.setAudience(process.env.AUTH_AUDIENCE ?? "monobun-api")
			.setIssuedAt(now)
			.setExpirationTime(now + 3600)
			.sign(privateKey);

		const response = await supertest(app.getHttpServer())
			.get("/api/v1/tenants")
			.set("Authorization", `Bearer ${noScopeToken}`)
			.expect(403);

		expect(response.body.message).toBe("Insufficient scope");
	});
});
