import { generateKeyPairSync } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const dir = join(import.meta.dir, "..", "dev-keys");
await mkdir(dir, { recursive: true });

const pair = generateKeyPairSync("rsa", { modulusLength: 2048 });
const privatePem = pair.privateKey.export({ type: "pkcs8", format: "pem" });
const publicPem = pair.publicKey.export({ type: "spki", format: "pem" });

await writeFile(join(dir, "private.pem"), privatePem);
await writeFile(join(dir, "public.pem"), publicPem);
console.log(`Wrote ${dir}/private.pem and public.pem`);
