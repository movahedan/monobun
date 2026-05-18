import "reflect-metadata";

import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import type { INestApplication } from "@nestjs/common";
import supertest from "supertest";

import { createTestJwtEnv, type TestJwtEnv } from "./test-jwt-env";

describe("@apps/nestjs API contract", () => {
	let env: TestJwtEnv;
	let app: INestApplication;
	let accessToken: string;

	beforeAll(async () => {
		env = await createTestJwtEnv();
		app = env.app;
		accessToken = env.accessToken;
	});

	afterAll(async () => {
		await app.close();
	});

	it("GET /api/v1/tenants returns list envelope with pageInfo", async () => {
		const response = await supertest(app.getHttpServer())
			.get("/api/v1/tenants")
			.set("Authorization", `Bearer ${accessToken}`)
			.expect(200);

		expect(Array.isArray(response.body.list)).toBe(true);
		expect(response.body.pageInfo).toMatchObject({
			currentPage: 1,
			pageSize: 10,
			totalItems: 0,
			totalPages: 0,
		});
	});

	it("GET /api/v1/tenants without Bearer returns 401 ApiError", async () => {
		const response = await supertest(app.getHttpServer()).get("/api/v1/tenants").expect(401);

		expect(response.body.message).toMatch(/Bearer|token/i);
		expect(response.body.success).toBeUndefined();
	});

	it("GET /api/v1/tenants with invalid query returns 400 ApiError with fields", async () => {
		const response = await supertest(app.getHttpServer())
			.get("/api/v1/tenants?page=0")
			.set("Authorization", `Bearer ${accessToken}`)
			.expect(400);

		expect(response.body.message).toBe("Validation failed");
		expect(Array.isArray(response.body.fields)).toBe(true);
		expect(response.body.fields[0]).toMatchObject({
			field: expect.any(String),
			message: expect.any(String),
		});
	});
});
