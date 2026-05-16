import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const port = process.env.PORT ? Number(process.env.PORT) : 4321;
const host = process.env.HOST || "localhost";
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
	vite: {
		logLevel: quietViteLogs ? "error" : "warn",
		plugins: [tailwindcss()],
	},
});
