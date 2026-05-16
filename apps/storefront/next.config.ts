import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},

	// Enable hot reload in Docker containers
	webpack: (
		config: { watchOptions: { poll: number; aggregateTimeout: number } },
		{ dev }: { dev: boolean },
	) => {
		if (dev) {
			config.watchOptions = {
				poll: 1000,
				aggregateTimeout: 300,
			};
		}
		return config;
	},
};

export default nextConfig;
