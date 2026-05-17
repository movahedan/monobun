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
				bun run nuke
			</Text>
			{errorMessage !== undefined ? <Text color="red">{errorMessage}</Text> : null}
			<Text> </Text>
			<Text dimColor>
				Full factory reset: wipe local artifacts and both compose stacks, bootstrap the workspace,
				then smoke-test dev and prod compose.
			</Text>
			<Text> </Text>
			<Text bold>Flags</Text>
			<Text>
				<Text color="green">--quiet</Text> / <Text color="green">-q</Text> — run steps without Ink
			</Text>
			<Text>
				<Text color="green">--skip-tests</Text> / <Text color="green">-t</Text> — skip tests during
				local setup
			</Text>
			<Text> </Text>
			<Text bold>Examples</Text>
			<Text dimColor>bun run nuke</Text>
			<Text dimColor>bun run nuke -- --skip-tests</Text>
			<Text dimColor>bun run nuke -- --quiet</Text>
		</Box>
	);
}

export async function printNukeHelpAndExit(errorMessage?: string): Promise<never> {
	const code = errorMessage === undefined ? 0 : 1;
	const { waitUntilExit, unmount } = render(<HelpApp errorMessage={errorMessage} />);
	await waitUntilExit();
	unmount();
	process.exit(code);
}
