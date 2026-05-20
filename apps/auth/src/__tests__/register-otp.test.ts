import { afterAll, describe, expect, it } from "bun:test";

import { prisma } from "../db";
import { createCaller } from "../trpc/caller";
import { createContext } from "../trpc/context";

const databaseUrl = process.env.AUTH_DATABASE_URL?.trim();
const describeWithDb = databaseUrl ? describe : describe.skip;

const testEmail = `register-test-${Date.now()}@example.com`;
const testPassword = "test-password-123";

describeWithDb("auth.register and auth.verifyOtp", () => {
	afterAll(async () => {
		const user = await prisma.user.findUnique({
			where: { email: testEmail },
			include: { memberships: true },
		});
		if (user) {
			const tenantIds = user.memberships.map((m) => m.tenantId);
			await prisma.user.delete({ where: { id: user.id } });
			await prisma.tenant.deleteMany({ where: { id: { in: tenantIds } } });
		}
		await prisma.emailOtp.deleteMany({ where: { email: testEmail } });
		await prisma.$disconnect();
	});

	it("registers a user with a personal tenant", async () => {
		const req = new Request("https://auth.internal/test");
		const caller = createCaller(await createContext(req));
		const result = await caller.auth.register({
			email: testEmail,
			password: testPassword,
			tenantName: "Test Workspace",
		});

		expect(result.accessToken).toBeString();
		expect(result.user.email).toBe(testEmail);

		const user = await prisma.user.findUnique({
			where: { email: testEmail },
			include: { memberships: true },
		});
		expect(user?.memberships).toHaveLength(1);
		expect(user?.memberships[0]?.role).toBe("owner");
	});

	it("rejects duplicate registration", async () => {
		const req = new Request("https://auth.internal/test");
		const caller = createCaller(await createContext(req));
		await expect(
			caller.auth.register({
				email: testEmail,
				password: testPassword,
			}),
		).rejects.toMatchObject({ code: "CONFLICT" });
	});
});
