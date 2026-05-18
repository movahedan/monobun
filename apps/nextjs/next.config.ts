import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
	typescript: { ignoreBuildErrors: true },
	transpilePackages: ["@packages/ui"],
	...(!isDev && { watchOptions: { pollIntervalMs: 1000 } }),
};

export default nextConfig;
