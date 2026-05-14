import { Box, render, Text, useApp } from "ink";
import { useEffect } from "react";

function HelpApp({ errorMessage }: { readonly errorMessage?: string }) {
	const { exit, waitUntilRenderFlush } = useApp();

	useEffect(() => {
		void (async () => {
			await waitUntilRenderFlush();
			exit();
		})();
	}, [exit, waitUntilRenderFlush]);

	return (
		<Box flexDirection="column" padding={1}>
			<Text bold color="cyan">
				bun run export-modules
			</Text>
			{errorMessage !== undefined ? <Text color="red">{errorMessage}</Text> : null}
			<Text> </Text>
			<Text bold>Commands</Text>
			<Text>
				<Text color="green">update</Text> — set package.json exports from src (or package root)
			</Text>
			<Text> </Text>
			<Text bold>Flags</Text>
			<Text>
				<Text color="green">{"--pattern <regex>"}</Text> — match file paths (posix, relative to
				package.json) and build exports from all .ts/.tsx under ./src recursively; first capture
				sets the export key when present. Patterns are checked for catastrophic backtracking and
				rejected if unsafe.
			</Text>
			<Text>
				<Text color="green">{"--regex-flags <flags>"}</Text> — RegExp flags (global g is ignored)
			</Text>
			<Text>
				<Text color="green">--no-src</Text> — scan package root instead of ./src
			</Text>
			<Text>
				<Text color="green">--dry-run, -d</Text> — print exports map without writing
			</Text>
			<Text>
				<Text color="green">--quiet</Text> — run without Ink progress
			</Text>
			<Text>
				<Text color="green">--help, -h</Text> — show this help
			</Text>
			<Text> </Text>
			<Text bold>Examples</Text>
			<Text dimColor>bun run export-modules update</Text>
			<Text dimColor>bun run export-modules update --dry-run</Text>
			<Text dimColor>bun run export-modules update --quiet</Text>
			<Text dimColor>
				{`bun run export-modules update --pattern 'src/([^/]+)/\\1\\.tsx$' --dry-run`}
			</Text>
		</Box>
	);
}

export async function printHelpAndExit(errorMessage?: string): Promise<never> {
	const code = errorMessage === undefined ? 0 : 1;
	const { waitUntilExit, unmount } = render(<HelpApp errorMessage={errorMessage} />);
	await waitUntilExit();
	unmount();
	process.exit(code);
}
