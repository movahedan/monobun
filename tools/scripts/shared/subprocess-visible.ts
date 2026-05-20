/** Clears the active Ink frame before subprocess output (registered by renderAndExit). */
let clearInkOutput: (() => void) | undefined;

export function registerInkClearOutput(clear: () => void): void {
	clearInkOutput = clear;
}

export function unregisterInkClearOutput(): void {
	clearInkOutput = undefined;
}

/** Free stderr/stdout for child tools while Ink step UI is mounted. */
export function prepareForSubprocessOutput(): void {
	clearInkOutput?.();
	if (process.stderr.isTTY) {
		process.stderr.write("\n");
	}
}

export interface SpawnWithVisibleOutputOptions {
	readonly argv: readonly string[];
	readonly cwd?: string;
	readonly env?: NodeJS.ProcessEnv;
}

async function drainStreamToHost(
	stream: ReadableStream<Uint8Array> | null | undefined,
	target: NodeJS.WriteStream,
): Promise<string> {
	if (stream === null || stream === undefined) {
		return "";
	}

	const reader = stream.getReader();
	const parts: Buffer[] = [];

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				break;
			}
			if (value === undefined) {
				continue;
			}
			const buffer = Buffer.from(value);
			parts.push(buffer);
			target.write(buffer);
		}
	} finally {
		reader.releaseLock();
	}

	return Buffer.concat(parts).toString("utf8");
}

export async function spawnWithVisibleOutput(
	options: SpawnWithVisibleOutputOptions,
): Promise<void> {
	prepareForSubprocessOutput();

	const proc = Bun.spawn([...options.argv], {
		cwd: options.cwd ?? process.cwd(),
		env: options.env ?? process.env,
		stdin: "inherit",
		stdout: "pipe",
		stderr: "pipe",
	});

	const [stderr, stdout, exitCode] = await Promise.all([
		drainStreamToHost(proc.stderr, process.stderr),
		drainStreamToHost(proc.stdout, process.stdout),
		proc.exited,
	]);

	if (exitCode === 0) {
		return;
	}

	const streamedToTerminal = process.stderr.isTTY === true || process.stdout.isTTY === true;
	const chunks: string[] = [];
	if (stderr.length > 0) {
		chunks.push(stderr);
	}
	if (stdout.length > 0) {
		chunks.push(stdout);
	}
	const detail = streamedToTerminal || chunks.length === 0 ? "" : `\n${chunks.join("\n\n")}`;
	throw new Error(`Command failed (exit ${exitCode}): ${options.argv.join(" ")}${detail}`);
}
