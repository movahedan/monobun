import { createBunMocks, type MockBunOptions } from "./mock-bun";

export const mockFsModule = (content?: string | ((path: string) => string)) => ({
	readFileSync: (_path: string, _encoding: string) =>
		typeof content === "function" ? content(_path) : content || "",
	writeFileSync: () => {},
	existsSync: (_path: string) =>
		typeof content === "function" ? !!content(_path) : content !== undefined,
});

export const mockFsPromisesModule = (content?: string | ((path: string) => string)) => ({
	readFile: async (_path: string, _encoding?: string) =>
		typeof content === "function" ? content(_path) : content || "",
	readdir: async (_path: string, _options?: { withFileTypes?: boolean }) => {
		if (_path.includes("/apps")) {
			return [
				{ name: "test-app", isDirectory: () => true },
				{ name: "another-app", isDirectory: () => true },
			];
		}
		if (_path.includes("/packages")) {
			return [
				{ name: "ui", isDirectory: () => true },
				{ name: "utils", isDirectory: () => true },
			];
		}
		return [];
	},
	access: async (_path: string) => {
		if (_path.includes("package.json") || _path.includes("/apps") || _path.includes("/packages")) {
			return Promise.resolve();
		}
		return Promise.reject(new Error("ENOENT: no such file or directory"));
	},
});

export const mockBunModule = (options: MockBunOptions = {}) => {
	return { $: createBunMocks(options).mockCommand };
};
