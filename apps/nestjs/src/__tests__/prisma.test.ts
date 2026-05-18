import "reflect-metadata";

import { afterAll, beforeAll, describe, expect, it } from "bun:test";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL?.trim();
const describeWithDb = databaseUrl ? describe : describe.skip;

describeWithDb("@apps/nestjs prisma (integration)", () => {
	let prisma: PrismaClient;

	beforeAll(async () => {
		prisma = new PrismaClient({
			adapter: new PrismaPg({ connectionString: databaseUrl }),
		});
		await prisma.$connect();
	});

	afterAll(async () => {
		await prisma.$disconnect();
	});

	it("connects and reads tenants table", async () => {
		const count = await prisma.tenant.count();
		expect(count).toBeGreaterThanOrEqual(0);
	});

	it("seed tenant exists after db:seed", async () => {
		const tenant = await prisma.tenant.findUnique({
			where: { slug: "demo" },
		});
		expect(tenant).not.toBeNull();
		expect(tenant?.name).toBe("Demo Organization");
	});

	it("seed project has three environments", async () => {
		const project = await prisma.project.findFirst({
			where: { key: "main", tenant: { slug: "demo" } },
			include: { environments: true, featureFlags: true },
		});
		expect(project).not.toBeNull();
		expect(project?.environments).toHaveLength(3);
		expect(project?.featureFlags.length).toBeGreaterThanOrEqual(2);
	});
});
