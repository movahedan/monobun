import { Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { log } from "@packages/utils/logger";

function getDatabaseUrl(): string | undefined {
	const url = process.env.DATABASE_URL?.trim();
	return url && url.length > 0 ? url : undefined;
}

/** Placeholder only — no credentials; `onModuleInit` skips connect when `DATABASE_URL` is unset. */
const UNCONFIGURED_DATABASE_URL = "postgresql://127.0.0.1:5432/monobun";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	constructor() {
		const connectionString = getDatabaseUrl() ?? UNCONFIGURED_DATABASE_URL;
		const adapter = new PrismaPg({ connectionString });
		super({ adapter });
	}

	async onModuleInit(): Promise<void> {
		const connectionString = getDatabaseUrl();
		if (!connectionString || connectionString.includes("dummy")) {
			return;
		}

		try {
			await this.$connect();
		} catch (error) {
			if (process.env.NODE_ENV !== "production") {
				log(`Prisma connection skipped: ${error instanceof Error ? error.message : String(error)}`);
			}
		}
	}

	async onModuleDestroy(): Promise<void> {
		try {
			await this.$disconnect();
		} catch {
			// ignore disconnect errors during shutdown
		}
	}

	isConfigured(): boolean {
		return Boolean(getDatabaseUrl());
	}
}
