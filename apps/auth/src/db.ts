import { PrismaClient } from "./generated/prisma";

const globalForPrisma = globalThis as { authPrisma?: PrismaClient };

export const prisma =
	globalForPrisma.authPrisma ??
	new PrismaClient({
		datasourceUrl: process.env.AUTH_DATABASE_URL,
	});

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.authPrisma = prisma;
}
