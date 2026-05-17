import path from "node:path";

import { defineConfig } from "vite";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "../src"),
		},
	},
	css: {
		postcss: {
			plugins: [require("tailwindcss"), require("autoprefixer")],
		},
	},
});
