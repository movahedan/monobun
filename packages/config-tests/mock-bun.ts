import { mock } from "bun:test";
import type * as Bun from "bun";

const defaultMockPackageJson = () => ({
	name: "test-package",
	version: "1.0.0",
	description: "Test package",
});

export type MockBunOptions = {
	file?: {
		exists?: boolean | ((path: string) => boolean);
		content?: unknown | ((path: string) => unknown);
	};
	write?: {
		result?: number | ((path: string, content: string) => number);
	};
	command?: {
		text?: string | ((command: string, ...args: unknown[]) => string);
		exitCode?: number | ((command: string, ...args: unknown[]) => number);
	};
};

export const createBunMocks = (options: MockBunOptions = {}) => {
	const {
		file: { exists: fileExists = true, content: fileContent = defaultMockPackageJson() } = {},
		write: { result: writeResult = 0 } = {},
		command: { text: commandText = "mocked output", exitCode: commandExitCode = 0 } = {},
	} = options;

	const mockWrite = mock((path: string, content: string) => {
		if (typeof writeResult === "function") {
			return Promise.resolve(writeResult(path, content));
		}
		return Promise.resolve(writeResult);
	});

	const mockFile = mock((path: string) => ({
		exists: () => {
			if (typeof fileExists === "function") {
				return Promise.resolve(fileExists(path));
			}
			return Promise.resolve(fileExists);
		},
		json: () => {
			if (typeof fileContent === "function") {
				return Promise.resolve(fileContent(path));
			}
			return Promise.resolve(fileContent);
		},
		text: () => "",
		write: () => {
			if (typeof writeResult === "function") {
				return Promise.resolve(writeResult(path, ""));
			}
			return Promise.resolve(writeResult);
		},
	}));

	const mockCommand = mock((strings: TemplateStringsArray, ...values: unknown[]) => {
		const command = strings.join("").trim();

		const getText = () => {
			if (typeof commandText === "function") {
				return commandText(command, ...values);
			}
			return commandText;
		};

		const getExitCode = () => {
			if (typeof commandExitCode === "function") {
				return commandExitCode(command, ...values);
			}
			return commandExitCode;
		};

		return {
			text: () => getText(),
			exitCode: getExitCode(),
			nothrow: () => ({
				quiet: () => ({
					exitCode: getExitCode(),
					text: () => getText(),
				}),
			}),
			quiet: () => ({
				nothrow: () => ({
					exitCode: getExitCode(),
					text: () => getText(),
				}),
			}),
		};
	});

	return { mockWrite, mockFile, mockCommand };
};

let originalBun: Partial<typeof Bun> | undefined;

export const setupBunMocks = async (options?: MockBunOptions) => {
	const mocks = createBunMocks(options);

	if (!originalBun && !globalThis.Bun.$.toString().includes("Mock")) {
		originalBun = {
			write: globalThis.Bun.write,
			file: globalThis.Bun.file,
			$: globalThis.Bun.$,
		};
	}

	mock.module("bun", () => ({
		write: mocks.mockWrite,
		file: mocks.mockFile,
		$: mocks.mockCommand,
	}));

	return mocks;
};

export const restoreBunMocks = () => {
	mock.restore();

	if (typeof globalThis.Bun !== "undefined" && originalBun) {
		if (originalBun?.write) {
			(globalThis.Bun as typeof Bun).write = originalBun.write;
		}
		if (originalBun?.file) {
			(globalThis.Bun as typeof Bun).file = originalBun.file;
		}
		if (originalBun?.$) {
			(globalThis.Bun as typeof Bun).$ = originalBun.$;
		}
	}
};
