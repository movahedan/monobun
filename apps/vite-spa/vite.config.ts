import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const port = Number(process.env.VITE_SPA_PORT ?? process.env.PORT ?? 3001);
const host = process.env.HOST ?? "127.0.0.1";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	server: {
		port,
		host,
		allowedHosts: ["localhost", "vite-spa"],
		watch: {
			usePolling: true,
			interval: 1000,
		},
	},
});
