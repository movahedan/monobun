import { esbuildDecorators } from "@anatine/esbuild-decorators";
import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	target: "es2022",
	outDir: "dist",
	clean: true,
	sourcemap: true,
	splitting: false,
	bundle: true,
	treeshake: true,
	platform: "node",
	noExternal: [/^@packages\//],
	esbuildPlugins: [esbuildDecorators({ tsconfig: "./tsconfig.json" })],
	esbuildOptions(options) {
		options.keepNames = true;
		options.platform = "node";
	},
	external: [
		"@nestjs/core",
		"@nestjs/common",
		"@nestjs/platform-express",
		"@nestjs/swagger",
		"@prisma/client",
		"@prisma/adapter-pg",
		"pg",
		"reflect-metadata",
		"rxjs",
	],
});
