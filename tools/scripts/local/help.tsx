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
				bun run local
			</Text>
			{errorMessage !== undefined ? <Text color="red">{errorMessage}</Text> : null}
			<Text> </Text>
			<Text bold>Commands</Text>
			<Text>
				<Text color="green">setup</Text> — install deps, check, test, build
			</Text>
			<Text dimColor> setup flags: --skip-tests, --quiet</Text>
			<Text>
				<Text color="green">cleanup</Text> — remove build artifacts and node_modules
			</Text>
			<Text dimColor> cleanup flags: --quiet</Text>
			<Text>
				<Text color="green">vscode</Text> — sync .vscode settings and extensions from the workspace
			</Text>
			<Text> </Text>
			<Text bold>Examples</Text>
			<Text dimColor>bun run local setup</Text>
			<Text dimColor>bun run local setup --skip-tests</Text>
			<Text dimColor>bun run local cleanup</Text>
			<Text dimColor>bun run local vscode --quiet</Text>
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
