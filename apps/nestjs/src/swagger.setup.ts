import { spawn } from "node:child_process";
import { resolve } from "node:path";

import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from "@nestjs/swagger";

import { log } from "@packages/utils/logger";

import * as ApiModels from "./common/api/api-error.model";
import * as ListModels from "./common/api/list-query.model";
import * as PageInfoModels from "./common/api/page-info.model";
import { BaseDto } from "./common/models/dto.model";
import * as HealthModels from "./health/health.model";
import * as TenantModels from "./tenants/tenant.model";

const isDevelopment = process.env.NODE_ENV === "development";
const NESTJS_SDK_PATH = resolve(process.cwd(), "../../packages/nestjs-sdk");
const OPENAPI_YAML_PATH = resolve(NESTJS_SDK_PATH, "src/openapi.yaml");

const dtoModules = [ApiModels, ListModels, PageInfoModels, HealthModels, TenantModels] as const;

type Constructor = new (...args: never[]) => unknown;

function isDtoClass(value: unknown): value is Constructor {
	if (typeof value !== "function") return false;
	return value.prototype instanceof BaseDto;
}

export async function swaggerSetup(app: INestApplication): Promise<OpenAPIObject> {
	const extraModels = dtoModules.flatMap((module) => Object.values(module)).filter(isDtoClass);

	const document = SwaggerModule.createDocument(app, buildSwaggerConfig(), { extraModels });

	SwaggerModule.setup("api/docs", app, document, {
		customSiteTitle: "Monobun Feature Flags Control Plane",
	});

	const shouldEmit = isDevelopment || process.argv.includes("--emit-openapi");
	if (shouldEmit) {
		await emitOpenApi(document)
			.then(() => log("[swagger] openapi.yaml written for @packages/nestjs-sdk"))
			.catch((error: unknown) => log(`[swagger] OpenAPI emit failed: ${String(error)}`));
	}

	return document;
}

function buildSwaggerConfig() {
	return new DocumentBuilder()
		.setTitle("Monobun Feature Flags Control Plane")
		.setDescription(
			`Management API for multi-tenant feature flags and remote config.

**Success shapes**
- Paginated lists: \`{ list: T[], pageInfo: PageInfo }\`
- Single resources: resource schema at the root (no envelope)

**Errors** (4xx/5xx): \`{ message?: string, fields?: { field, message }[] }\``,
		)
		.setVersion("1.0.0")
		.addApiKey(
			{
				type: "apiKey",
				in: "header",
				name: "x-tenant-id",
				description: "Tenant scope (UUID)",
			},
			"TenantAuth",
		)
		.addServer(
			`http://localhost:${process.env.NESTJS_PORT ?? process.env.PORT ?? 3006}`,
			"Development",
		)
		.addTag("Health", "Liveness and readiness")
		.addTag("Tenants", "Tenant directory (management)")
		.build();
}

async function emitOpenApi(document: OpenAPIObject): Promise<void> {
	const yaml = Bun.YAML.stringify(document, null, 2);
	const current = await Bun.file(OPENAPI_YAML_PATH)
		.text()
		.catch(() => "");
	if (current.trim() === yaml.trim()) return;
	await Bun.write(OPENAPI_YAML_PATH, yaml);

	if (process.argv.includes("--emit-openapi")) {
		process.exit(0);
	}

	await runKubbGenerate();
}

async function runKubbGenerate(): Promise<void> {
	return new Promise((resolvePromise, reject) => {
		const child = spawn(process.execPath, ["run", "kubb"], {
			cwd: NESTJS_SDK_PATH,
			stdio: "inherit",
		});
		child.on("close", (code) =>
			code === 0 ? resolvePromise() : reject(new Error(`kubb exited ${code}`)),
		);
		child.on("error", reject);
	});
}
