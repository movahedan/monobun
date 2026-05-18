import { Box, render, Text, useApp } from "ink";
import { useEffect } from "react";

import { getContainerStack, PROD_COMPOSE_PROJECT_NAME } from "./stack";

function HelpApp({ errorMessage }: { readonly errorMessage?: string }) {
	const { exit, waitUntilRenderFlush } = useApp();
	const stack = getContainerStack();

	useEffect(() => {
		void (async () => {
			await waitUntilRenderFlush();
			exit();
		})();
	}, [exit, waitUntilRenderFlush]);

	const stackLabel =
		stack === "prod"
			? `production compose (${PROD_COMPOSE_PROJECT_NAME})`
			: "development compose (docker-compose.dev.yml, profile all)";

	return (
		<Box flexDirection="column" padding={1}>
			<Text bold color="cyan">
				bun run container — {stackLabel}
			</Text>
			<Text dimColor>
				Use --prod before the subcommand for docker-compose.yml (e.g. bun run container --prod up)
			</Text>
			{errorMessage !== undefined ? <Text color="red">{errorMessage}</Text> : null}
			<Text> </Text>
			<Text bold>Commands</Text>
			<Text>
				<Text color="green">setup</Text> — env files, container install, up, optional health check
			</Text>
			<Text>
				<Text color="green">check</Text> — bring stack up, wait for health, optionally tear down
			</Text>
			<Text>
				<Text color="green">cleanup</Text> — stop compose services for this stack and remove volumes
			</Text>
			<Text>
				<Text color="green">rm</Text> — stop dev, production, and root compose stacks (host only)
			</Text>
			<Text>
				<Text color="green">install</Text> — bun install into the dev stack node_modules volume
			</Text>
			<Text dimColor>
				{" "}
				install flags: --quiet, --with-scripts; extra args forwarded to bun install
			</Text>
			<Text>
				<Text color="green">up</Text> — compose up -d; forwards extra args
			</Text>
			<Text>
				<Text color="green">down</Text> — compose down --remove-orphans; forwards extra args
			</Text>
			<Text>
				<Text color="green">build</Text> — compose build; forwards extra args
			</Text>
			<Text>
				<Text color="green">compose</Text> — forwards args to docker compose -f …
			</Text>
			<Text>
				<Text color="green">logs</Text> — compose logs; forwards extra args
			</Text>
			<Text>
				<Text color="green">health</Text> — ps table
			</Text>
			<Text> </Text>
			<Text bold>Examples</Text>
			<Text dimColor>bun run container setup</Text>
			<Text dimColor>bun run container setup -- --skip-health-check</Text>
			<Text dimColor>bun run container check -- --keep-alive</Text>
			<Text dimColor>bun run container cleanup -- --quiet</Text>
			<Text dimColor>bun run container rm -- --force</Text>
			<Text dimColor>bun run container install</Text>
			<Text dimColor>bun run container up -- --build</Text>
			<Text dimColor>bun run container --prod up -- --build</Text>
			<Text dimColor>bun run container down -- --volumes</Text>
			<Text dimColor>bun run container build -- --parallel</Text>
			<Text dimColor>bun run container compose -- ps</Text>
			<Text dimColor>bun run container health</Text>
			<Text dimColor>bun run container logs -- -f nextjs</Text>
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
