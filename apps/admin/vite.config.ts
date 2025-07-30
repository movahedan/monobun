import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const port = process.env.PORT ? Number(process.env.PORT) : undefined;
const host = process.env.HOST;

export default defineConfig({
	plugins: [react()],
	server: {
		port,
		host,
		allowedHosts: ["localhost", "admin"],
		watch: {
			usePolling: true,
			interval: 1000,
		},
	},
});
