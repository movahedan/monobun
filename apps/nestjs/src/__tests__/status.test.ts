import "reflect-metadata";

import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import supertest from "supertest";

import { AppModule } from "../app.module";
import { HttpExceptionFilter } from "../common/filters/http-exception.filter";

describe("@apps/nestjs status", () => {
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

	it("GET /api/v1/health returns non-list success body", async () => {
		const response = await supertest(app.getHttpServer()).get("/api/v1/health").expect(200);

		expect(response.body.ok).toBe(true);
		expect(typeof response.body.timestamp).toBe("string");
		expect(response.body.list).toBeUndefined();
		expect(response.body.pageInfo).toBeUndefined();
	});
});
