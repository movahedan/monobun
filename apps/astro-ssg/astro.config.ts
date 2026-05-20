import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const port = Number(process.env.ASTRO_SSG_PORT ?? process.env.PORT ?? 3005);
const host = process.env.HOST ?? "127.0.0.1";
const site = process.env.NODE_ENV === "development" ? `http://${host}:${port}` : `http://${host}`;
const astroCommand = process.argv[2];
const quietViteLogs = astroCommand === "check" || astroCommand === "build";

if (quietViteLogs) {
	const warn = console.warn;
	console.warn = (message, ...rest) => {
		if (typeof message === "string" && message.includes("transformWithEsbuild")) return;
		warn(message, ...rest);
	};
}

export default defineConfig({
	output: "static",
	site,
	base: "",
	server: { port, host: host === "0.0.0.0" ? true : host },
	vite: {
		logLevel: quietViteLogs ? "error" : "warn",
		plugins: [tailwindcss()],
		server: {
			watch: {
				usePolling: process.env.CHOKIDAR_USEPOLLING === "true",
				interval: 1000,
			},
		},
	},
});
