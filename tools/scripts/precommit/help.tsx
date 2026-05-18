import { Box, render, Text, useApp } from "ink";
import { useEffect } from "react";

function CommitCheckHelpApp() {
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
				bun run precommit
			</Text>
			<Text> </Text>
			<Text bold>Flags</Text>
			<Text>
				<Text color="green">-m, --message</Text> — validate a commit message string
			</Text>
			<Text>
				<Text color="green">-f, --message-file</Text> — read message from a file (e.g.
				.git/COMMIT_EDITMSG)
			</Text>
			<Text>
				<Text color="green">-b, --branch</Text> — validate current branch name
			</Text>
			<Text>
				<Text color="green">-s, --staged</Text> — validate staged files for policy violations
			</Text>
			<Text>
				<Text color="green">-q, --quiet</Text> — no Ink progress UI
			</Text>
			<Text>
				<Text color="green">-h, --help</Text> — show this help
			</Text>
			<Text> </Text>
			<Text dimColor>bun run precommit -- --message-file .git/COMMIT_EDITMSG</Text>
			<Text dimColor>bun run precommit -- --branch --staged</Text>
		</Box>
	);
}

export async function printCommitCheckHelpAndExit(): Promise<never> {
	const { waitUntilExit, unmount } = render(<CommitCheckHelpApp />);
	await waitUntilExit();
	unmount();
	process.exit(0);
}
