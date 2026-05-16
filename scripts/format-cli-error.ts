/** Format CLI failures for stderr without Bun's stack trace. */
export function formatCliError(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	return String(error);
}

export function printCliError(error: unknown): void {
	console.error(formatCliError(error));
}

export function printCliErrorAndExit(error: unknown): never {
	printCliError(error);
	process.exit(1);
}
