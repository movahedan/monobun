import { readFileSync } from "node:fs";
import { $, file, write } from "bun";
import type { PackageJson } from "./types";

export const packagesShell = {
	/**
	 * Reads a JSON file synchronously
	 */
	readJsonFile: (filePath: string): PackageJson => {
		try {
			const json = readFileSync(filePath, "utf8");
			return JSON.parse(json);
		} catch (error) {
			throw new Error(`Failed to read JSON file ${filePath}: ${error}`);
		}
	},

	/**
	 * Writes JSON data to a file
	 */
	writeJsonFile: async (filePath: string, data: PackageJson): Promise<void> => {
		await write(filePath, JSON.stringify(data, null, 2));
	},

	/**
	 * Reads a changelog file
	 */
	readChangelogFile: (filePath: string): string => {
		try {
			const changelog = readFileSync(filePath, "utf8");
			return changelog || "";
		} catch {
			return "";
		}
	},

	/**
	 * Writes content to a changelog file
	 */
	writeChangelogFile: async (filePath: string, content: string): Promise<void> => {
		try {
			await file(filePath).exists();
		} catch {
			await $`touch ${filePath}`.quiet();
		}
		await write(filePath, content);
	},

	/**
	 * Runs biome check on a file
	 */
	runBiomeCheck: async (filePath: string): Promise<void> => {
		await $`bun biome check --write --no-errors-on-unmatched ${filePath}`.quiet();
	},

	/**
	 * Checks if a file exists
	 */
	fileExists: async (filePath: string): Promise<boolean> => {
		try {
			await file(filePath).exists();
			return true;
		} catch {
			return false;
		}
	},

	/**
	 * Reads directory contents
	 */
	readDirectory: async (dirPath: string): Promise<string[]> => {
		const fs = await import("node:fs/promises");
		const entries = await fs.readdir(dirPath, { withFileTypes: true });
		return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
	},

	/**
	 * Checks if a file can be accessed
	 */
	canAccessFile: async (filePath: string): Promise<boolean> => {
		const fs = await import("node:fs/promises");
		try {
			await fs.access(filePath);
			return true;
		} catch {
			return false;
		}
	},

	/**
	 * Reads a file as text
	 */
	readFileAsText: async (filePath: string): Promise<string> => {
		const fs = await import("node:fs/promises");
		return await fs.readFile(filePath, "utf-8");
	},

	/**
	 * Gets the workspace root directory
	 */
	getWorkspaceRoot: async (): Promise<string> => {
		const fs = await import("node:fs/promises");
		const path = await import("node:path");

		let workspaceRoot = process.cwd();
		while (workspaceRoot !== path.dirname(workspaceRoot)) {
			try {
				await fs.access(path.join(workspaceRoot, "package.json"));
				break; // Found package.json, this is the workspace root
			} catch {
				workspaceRoot = path.dirname(workspaceRoot);
			}
		}
		return workspaceRoot;
	},
};
