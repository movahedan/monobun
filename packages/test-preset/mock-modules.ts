const mockBunFile = (content: string | undefined) => ({
	exists: () => Promise.resolve(content !== undefined),
	json: () => Promise.resolve(content ? JSON.parse(content) : {}),
	text: () => content,
	write: () => Promise.resolve(0),
});

const mockBunWrite = () => Promise.resolve(0);

const mockBunCommand = (
	options: { text?: string; exitCode?: number; quietResolves?: boolean } = {},
) => ({
	text: () => options.text || "mocked output",
	exitCode: () => options.exitCode || 0,
	nothrow: () => ({
		quiet: () => ({
			exitCode: () => options.exitCode || 0,
			text: () => options.text || "mocked output",
		}),
	}),
	quiet: () => (options.quietResolves ? Promise.resolve() : Promise.resolve()),
});

export const mockFsModule = (content?: string) => ({
	readFileSync: (_path: string, _encoding: string) => content || "",
	writeFileSync: () => {},
	existsSync: () => content !== undefined,
});

export const mockBunModule = (
	options: {
		file?: string;
		commandOptions?: {
			text?: string;
			exitCode?: number;
			quietResolves?: boolean;
		};
	} = {},
) => {
	const file = options.file;
	const commandOptions = options.commandOptions || {};

	return {
		file: (_path: string | URL) => mockBunFile(file),
		write: mockBunWrite,
		$: (_strings: TemplateStringsArray, ..._values: unknown[]) => mockBunCommand(commandOptions),
	};
};
