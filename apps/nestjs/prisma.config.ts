import { defineConfig } from "prisma/config";

/** Used for `prisma generate` when DATABASE_URL is unset (CI/typecheck); migrations need a real URL. */
const datasourceUrl = process.env.DATABASE_URL?.trim() || "postgresql://127.0.0.1:5432/monobun";

export default defineConfig({
	schema: "./prisma/schema.prisma",
	datasource: {
		url: datasourceUrl,
	},
	migrations: {
		path: "./prisma/migrations",
	},
});
