import tailwindcss from "@tailwindcss/vite";
import { type AstroUserConfig, defineConfig } from "astro/config";

const port = process.env.PORT ? Number(process.env.PORT) : 4321;
const host = process.env.HOST || "localhost";
const site = process.env.NODE_ENV === "development" ? `http://${host}:${port}` : `http://${host}`;

const config: AstroUserConfig = defineConfig({
	output: "static",
	site,
	base: "",
	vite: {
		plugins: [tailwindcss()],
	},
});

export default config;
