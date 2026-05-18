import { exportJWK, generateKeyPair } from "jose";

import { SCOPES } from "@packages/auth-contract";

import { authConfig } from "../src/config.ts";
import { prisma } from "../src/db.ts";
import { hashPassword } from "../src/trpc/auth/password.ts";

const tenantId = "00000000-0000-4000-8000-000000000010";
const adminUserId = "00000000-0000-4000-8000-000000000011";

async function seedMachineClient(): Promise<void> {
	const { publicKey, privateKey } = await generateKeyPair("RS256", { extractable: true });
	const publicKeyJwk = await exportJWK(publicKey);
	publicKeyJwk.alg = "RS256";
	publicKeyJwk.use = "sig";

	await prisma.machineClient.upsert({
		where: { clientId: "nestjs-control-plane" },
		create: {
			clientId: "nestjs-control-plane",
			name: "NestJS control plane",
			publicKeyJwk: publicKeyJwk as object,
			allowedScopes: [SCOPES.read],
		},
		update: {
			publicKeyJwk: publicKeyJwk as object,
			allowedScopes: [SCOPES.read],
			revokedAt: null,
		},
	});

	void privateKey;
}

async function seedHuman(): Promise<void> {
	const passwordHash = await hashPassword(authConfig.seedAdminPassword);
	await prisma.user.upsert({
		where: { email: authConfig.seedAdminEmail },
		create: {
			id: adminUserId,
			email: authConfig.seedAdminEmail,
			passwordHash,
			emailVerifiedAt: new Date(),
		},
		update: { passwordHash },
	});

	await prisma.tenant.upsert({
		where: { slug: "demo" },
		create: { id: tenantId, name: "Demo Tenant", slug: "demo" },
		update: { name: "Demo Tenant" },
	});

	await prisma.tenantMember.upsert({
		where: { userId_tenantId: { userId: adminUserId, tenantId } },
		create: { userId: adminUserId, tenantId, role: "owner" },
		update: { role: "owner" },
	});
}

await seedHuman();
await seedMachineClient();
console.log(`Seeded admin ${authConfig.seedAdminEmail} and machine client nestjs-control-plane`);
