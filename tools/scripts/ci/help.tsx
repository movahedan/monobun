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
				bun run ci …
			</Text>
			{errorMessage !== undefined ? <Text color="red">{errorMessage}</Text> : null}
			<Text> </Text>
			<Text bold>Commands</Text>
			<Text>
				<Text color="green">attach-affected</Text> — write affected prod compose services or turbo
				filters (matches @apps/* / @packages/* names to compose service keys) to GITHUB_OUTPUT
			</Text>
			<Text>
				<Text color="green">attach-service-ports</Text> — write docker-compose port mappings JSON to
				GITHUB_OUTPUT
			</Text>
			<Text> </Text>
			<Text bold>Examples</Text>
			<Text dimColor>bun run ci attach-affected --output-id affected-services --mode docker</Text>
			<Text dimColor>
				bun run ci attach-affected --output-id affected-packages --mode turbo --base-sha HEAD~1
			</Text>
			<Text dimColor>bun run ci attach-service-ports --output-id service-ports</Text>
			<Text dimColor>bun run ci attach-affected --quiet -o id -m turbo</Text>
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
