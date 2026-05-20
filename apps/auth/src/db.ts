import { PrismaClient } from "../../../node_modules/.prisma/auth-client";

const globalForPrisma = globalThis as { authPrisma?: PrismaClient };

export const prisma: PrismaClient =
	globalForPrisma.authPrisma ??
	new PrismaClient({
		datasourceUrl: process.env.AUTH_DATABASE_URL,
	});

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.authPrisma = prisma;
}
