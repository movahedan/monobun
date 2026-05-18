import "reflect-metadata";

import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import supertest from "supertest";

import { AppModule } from "../app.module";
import { HttpExceptionFilter } from "../common/filters/http-exception.filter";

const tenantId = "00000000-0000-4000-8000-000000000001";

describe("@apps/nestjs API contract", () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
		app = moduleRef.createNestApplication();
		app.useGlobalFilters(new HttpExceptionFilter());
		app.setGlobalPrefix("api");
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it("GET /api/v1/tenants returns list envelope with pageInfo", async () => {
		const response = await supertest(app.getHttpServer())
			.get("/api/v1/tenants")
			.set("x-tenant-id", tenantId)
			.expect(200);

		expect(Array.isArray(response.body.list)).toBe(true);
		expect(response.body.pageInfo).toMatchObject({
			currentPage: 1,
			pageSize: 10,
			totalItems: 0,
			totalPages: 0,
		});
	});

	it("GET /api/v1/tenants without tenant header returns 401 ApiError", async () => {
		const response = await supertest(app.getHttpServer()).get("/api/v1/tenants").expect(401);

		expect(response.body.message).toBe("Missing x-tenant-id header");
		expect(response.body.success).toBeUndefined();
	});

	it("GET /api/v1/tenants with invalid query returns 400 ApiError with fields", async () => {
		const response = await supertest(app.getHttpServer())
			.get("/api/v1/tenants?page=0")
			.set("x-tenant-id", tenantId)
			.expect(400);

		expect(response.body.message).toBe("Validation failed");
		expect(Array.isArray(response.body.fields)).toBe(true);
		expect(response.body.fields[0]).toMatchObject({
			field: expect.any(String),
			message: expect.any(String),
		});
	});
});
