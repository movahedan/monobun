import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
	// Addons seem to be causing issues with the new version of storybook
	addons: [],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
	core: {
		disableTelemetry: true,
	},
	typescript: {
		check: false,
		reactDocgen: "react-docgen-typescript",
		reactDocgenTypescriptOptions: {
			shouldExtractLiteralValuesFromEnum: true,
			propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
		},
	},
	async viteFinal(config) {
		const port = Number(process.env.UI_PORT ?? process.env.PORT ?? 3004);
		const host = process.env.HOST ?? "127.0.0.1";
		config.server = {
			...config.server,
			port,
			host: host === "0.0.0.0" ? true : host,
			allowedHosts: ["localhost", "ui"],
		};
		return config;
	},
};

export default config;
