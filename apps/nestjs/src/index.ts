import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import type { Request, Response } from "express";

import { log } from "@packages/utils/logger";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { type HealthStatus, HealthStatusSchema } from "./health/health.model";
import { swaggerSetup } from "./swagger.setup";

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule, { logger: false });

	app.useGlobalFilters(new HttpExceptionFilter());

	const server = app.getHttpAdapter().getInstance();
	server.get("/status", (_req: Request, res: Response) => {
		const body: HealthStatus = { ok: true, timestamp: new Date().toISOString() };
		HealthStatusSchema.parse(body);
		res.status(200).json(body);
	});

	app.enableCors({
		origin: process.env.ALLOWED_ORIGINS?.split(",") ?? [
			"http://localhost:3001",
			"http://localhost:3002",
		],
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "x-tenant-id", "x-actor-id"],
	});

	app.setGlobalPrefix("api");

	await swaggerSetup(app);

	const host = process.env.HOST ?? "0.0.0.0";
	const port = Number(process.env.NESTJS_PORT ?? process.env.PORT ?? 3006);

	if (process.argv.includes("--emit-openapi")) {
		log("OpenAPI emitted; exiting");
		return;
	}

	await app.listen(port, host);
	log(`@apps/nestjs listening on http://${host}:${port}`);
}

bootstrap().catch((error: unknown) => {
	log(`Failed to start @apps/nestjs: ${String(error)}`);
	process.exit(1);
});
