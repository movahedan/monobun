import { createHash, generateKeyPairSync } from "node:crypto";
import { readFile } from "node:fs/promises";

import { exportJWK, importPKCS8, importSPKI } from "jose";

import { authConfig } from "../../config";

type SigningMaterial = {
	privateKey: CryptoKey;
	publicKey: CryptoKey;
	kid: string;
	publicJwk: JsonWebKey;
};

let cached: SigningMaterial | null = null;

async function readPem(pathOrPem: string): Promise<string> {
	if (pathOrPem.includes("BEGIN")) {
		return pathOrPem;
	}
	return readFile(pathOrPem, "utf8");
}

async function loadOrGenerateKeys(): Promise<SigningMaterial> {
	if (cached) {
		return cached;
	}

	let privatePem: string;
	let publicPem: string;

	try {
		privatePem = await readPem(authConfig.jwtPrivateKey());
		publicPem = await readPem(authConfig.jwtPublicKey());
	} catch {
		const pair = generateKeyPairSync("rsa", { modulusLength: 2048 });
		privatePem = pair.privateKey.export({ type: "pkcs8", format: "pem" }).toString();
		publicPem = pair.publicKey.export({ type: "spki", format: "pem" }).toString();
	}

	const privateKey = await importPKCS8(privatePem, "RS256");
	const publicKey = await importSPKI(publicPem, "RS256");
	const publicJwk = await exportJWK(publicKey);
	const kid = createHash("sha256").update(publicPem).digest("hex").slice(0, 16);
	publicJwk.kid = kid;
	publicJwk.alg = "RS256";
	publicJwk.use = "sig";

	cached = { privateKey, publicKey, kid, publicJwk };
	return cached;
}

export async function getSigningMaterial(): Promise<SigningMaterial> {
	return loadOrGenerateKeys();
}

export async function getJwks(): Promise<{ keys: JsonWebKey[] }> {
	const { publicJwk } = await getSigningMaterial();
	return { keys: [publicJwk] };
}
