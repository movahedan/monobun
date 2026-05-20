import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const usePolling =
	process.env.CHOKIDAR_USEPOLLING === "true" || process.env.WATCHPACK_POLLING === "true";

const nextConfig: NextConfig = {
	typescript: { ignoreBuildErrors: true },
	transpilePackages: ["@packages/ui"],
	...(isDev && usePolling ? { watchOptions: { pollIntervalMs: 1000 } } : {}),
};

export default nextConfig;
