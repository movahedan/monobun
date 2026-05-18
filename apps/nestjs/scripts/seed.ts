import { randomBytes } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";
import { FlagValueType, PrismaClient } from "@prisma/client";

const SEED_TENANT_ID = "00000000-0000-4000-8000-000000000001";
const SEED_PROJECT_ID = "00000000-0000-4000-8000-000000000010";

function requireDatabaseUrl(): string {
	const url = process.env.DATABASE_URL?.trim();
	if (!url) {
		throw new Error("DATABASE_URL is required to run the seed script");
	}
	return url;
}

function createSdkKey(): string {
	return randomBytes(32).toString("hex");
}

async function main(): Promise<void> {
	const prisma = new PrismaClient({
		adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }),
	});

	await prisma.tenant.upsert({
		where: { id: SEED_TENANT_ID },
		update: { name: "Demo Organization", slug: "demo" },
		create: {
			id: SEED_TENANT_ID,
			name: "Demo Organization",
			slug: "demo",
		},
	});

	await prisma.project.upsert({
		where: { id: SEED_PROJECT_ID },
		update: {
			tenantId: SEED_TENANT_ID,
			name: "Main App",
			key: "main",
		},
		create: {
			id: SEED_PROJECT_ID,
			tenantId: SEED_TENANT_ID,
			name: "Main App",
			key: "main",
		},
	});

	const environments = [
		{ key: "dev", name: "Development" },
		{ key: "staging", name: "Staging" },
		{ key: "prod", name: "Production" },
	] as const;

	for (const env of environments) {
		await prisma.environment.upsert({
			where: {
				projectId_key: {
					projectId: SEED_PROJECT_ID,
					key: env.key,
				},
			},
			update: { name: env.name },
			create: {
				projectId: SEED_PROJECT_ID,
				key: env.key,
				name: env.name,
				sdkKey: createSdkKey(),
			},
		});
	}

	const flags = [
		{
			key: "new-checkout",
			name: "New checkout flow",
			description: "Enables the redesigned checkout experience",
			valueType: FlagValueType.boolean,
			isEnabled: true,
			defaultOnValue: "true",
			defaultOffValue: "false",
		},
		{
			key: "banner-message",
			name: "Homepage banner",
			description: "Remote string config for marketing banner",
			valueType: FlagValueType.string,
			isEnabled: false,
			defaultOnValue: "Welcome back",
			defaultOffValue: "",
		},
	] as const;

	for (const flag of flags) {
		await prisma.featureFlag.upsert({
			where: {
				projectId_key: {
					projectId: SEED_PROJECT_ID,
					key: flag.key,
				},
			},
			update: {
				name: flag.name,
				description: flag.description,
				valueType: flag.valueType,
				isEnabled: flag.isEnabled,
				defaultOnValue: flag.defaultOnValue,
				defaultOffValue: flag.defaultOffValue,
			},
			create: {
				projectId: SEED_PROJECT_ID,
				key: flag.key,
				name: flag.name,
				description: flag.description,
				valueType: flag.valueType,
				isEnabled: flag.isEnabled,
				targetingRules: { rules: [] },
				defaultOnValue: flag.defaultOnValue,
				defaultOffValue: flag.defaultOffValue,
			},
		});
	}

	await prisma.$disconnect();
	console.log("Seed complete: demo tenant, project, 3 environments, 2 feature flags");
}

main().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
