import { Box, render, Text, useApp } from "ink";
import { useEffect } from "react";

const VERSION_SUBCOMMANDS = ["prepare", "apply", "ci"] as const;
export type VersionSubcommand = (typeof VERSION_SUBCOMMANDS)[number];

export function isVersionSubcommand(value: string | undefined): value is VersionSubcommand {
	return value !== undefined && (VERSION_SUBCOMMANDS as readonly string[]).includes(value);
}

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
				bun run release prepare | apply | ci
			</Text>
			{errorMessage !== undefined ? <Text color="red">{errorMessage}</Text> : null}
			<Text> </Text>
			<Text bold>Commands</Text>
			<Text>
				<Text color="green">prepare</Text> — bump version, changelog, COMMIT_EDITMSG
			</Text>
			<Text>
				<Text color="green">apply</Text> — commit, tag, optional push
			</Text>
			<Text>
				<Text color="green">ci</Text> — Git auth (Actions), prepare, apply
			</Text>
			<Text> </Text>
			<Text bold>Examples</Text>
			<Text dimColor>bun run release prepare --package root</Text>
			<Text dimColor>bun run release prepare -p root --bump-type major</Text>
			<Text dimColor>bun run release apply --no-push</Text>
			<Text dimColor>bun run release ci --dry-run</Text>
		</Box>
	);
}

export async function printVersionHelpAndExit(errorMessage?: string): Promise<never> {
	const code = errorMessage === undefined ? 0 : 1;
	const { waitUntilExit, unmount } = render(<HelpApp errorMessage={errorMessage} />);
	await waitUntilExit();
	unmount();
	process.exit(code);
}
