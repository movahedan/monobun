import { defineConfig } from "@kubb/core";
import { pluginClient } from "@kubb/plugin-client";
import { pluginOas } from "@kubb/plugin-oas";
import { pluginSwr } from "@kubb/plugin-swr";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginZod } from "@kubb/plugin-zod";

export default defineConfig({
	input: { path: "./src/openapi.yaml" },
	output: {
		path: "./src/gen",
		clean: true,
		lint: false,
		format: false,
		barrelType: false,
		extension: { ".ts": "" },
	},
	plugins: [
		pluginOas(),
		pluginTs({ output: { path: "./types" } }),
		pluginZod({
			output: { path: "./zod" },
			group: { type: "tag" },
		}),
		pluginClient({
			output: { path: "./server" },
			importPath: "../../mutator.server",
			client: "fetch",
			dataReturnType: "data",
		}),
		pluginSwr({
			output: { path: "./hooks" },
			group: { type: "tag" },
			client: {
				importPath: "../../../mutator.client",
				dataReturnType: "data",
			},
			parser: "client",
		}),
	],
});
