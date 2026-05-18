import { Client } from "pg";

const databaseUrl = process.env.AUTH_DATABASE_URL;
if (!databaseUrl) {
	console.error("AUTH_DATABASE_URL is required");
	process.exit(1);
}

const parsed = new URL(databaseUrl);
const dbName = parsed.pathname.replace(/^\//, "");
const adminUrl = new URL(databaseUrl);
adminUrl.pathname = "/postgres";

const client = new Client({ connectionString: adminUrl.toString() });
await client.connect();
const exists = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
if (exists.rowCount === 0) {
	await client.query(`CREATE DATABASE "${dbName}"`);
	console.log(`Created database ${dbName}`);
}
await client.end();
