import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const port = Number(process.env.VITE_SPA_PORT ?? process.env.PORT ?? 3001);
const host = process.env.HOST ?? "127.0.0.1";
const authTarget = process.env.VITE_AUTH_PROXY_TARGET ?? "http://127.0.0.1:3007";
const nestTarget = process.env.VITE_NESTJS_PROXY_TARGET ?? "http://127.0.0.1:3006";

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
		proxy: {
			"/auth": {
				target: authTarget,
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/auth/, ""),
			},
			// Same-origin Nest OpenAPI paths (`/api/v1/...`) — avoids CORS from 127.0.0.1 vs localhost.
			"/api": {
				target: nestTarget,
				changeOrigin: true,
			},
		},
	},
});
