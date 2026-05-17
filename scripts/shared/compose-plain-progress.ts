export const INK_PROGRESS_ENV = "MONOBUN_INK_PROGRESS";

export function isInkProgressActive(): boolean {
	return process.env[INK_PROGRESS_ENV] === "1";
}

export function getPlainComposeSpawnEnv(base: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
	if (!isInkProgressActive()) {
		return base;
	}
	return {
		...base,
		COMPOSE_ANSI: "never",
		BUILDKIT_PROGRESS: "plain",
	};
}

export function applyPlainComposeArgv(argv: readonly string[]): string[] {
	if (!isInkProgressActive() || argv.includes("--progress")) {
		return [...argv];
	}
	const composeIndex = argv.indexOf("compose");
	if (composeIndex === -1) {
		return [...argv];
	}
	const result = [...argv];
	result.splice(composeIndex + 1, 0, "--progress", "plain");
	return result;
}
