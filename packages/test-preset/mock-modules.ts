const mockBunFile = (content: string | undefined) => ({
	exists: () => Promise.resolve(content !== undefined),
	json: () => Promise.resolve(content ? JSON.parse(content) : {}),
	text: () => content,
	write: () => Promise.resolve(0),
});

const mockBunCommand = (
	options: { text?: string; exitCode?: number; quietResolves?: boolean } = {},
) => ({
	text: () => options.text || "mocked output",
	stdout: {
		toString: () => options.text || "mocked output",
	},
	exitCode: () => options.exitCode || 0,
	nothrow: () => ({
		quiet: () => ({
			exitCode: () => options.exitCode || 0,
			text: () => options.text || "mocked output",
		}),
	}),
	quiet: () => (options.quietResolves ? Promise.resolve() : Promise.resolve()),
});

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

export const mockBunModule = (
	options: {
		file?: string | ((path: string) => string);
		write?:
			| Promise<number>
			| ((path: string, content: string, options?: { createPath?: boolean }) => Promise<number>);
		commandOptions?:
			| {
					text?: string;
					exitCode?: number;
					quietResolves?: boolean;
			  }
			| ((strings: TemplateStringsArray, ...values: unknown[]) => string);
	} = {},
) => {
	const file = options.file;
	const write = options.write;
	const commandOptions = options.commandOptions || {};

	return {
		file: (_path: string | URL) =>
			mockBunFile(typeof file === "function" ? file(_path.toString()) : file),
		write: (_path: string | URL, _content: string | Buffer, _options?: { createPath?: boolean }) =>
			typeof write === "function"
				? write(_path.toString(), _content.toString(), _options)
				: Promise.resolve(0),
		$: (_strings: TemplateStringsArray, ..._values: unknown[]) =>
			typeof commandOptions === "function"
				? commandOptions(_strings, ..._values)
				: mockBunCommand(commandOptions),
	};
};
