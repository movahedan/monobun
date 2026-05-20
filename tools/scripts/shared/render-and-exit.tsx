import { type RenderOptions, render } from "ink";
import type { ReactElement } from "react";

import { INK_PROGRESS_ENV } from "./compose-plain-progress";
import { printCliError } from "./format-cli-error";
import { registerInkClearOutput, unregisterInkClearOutput } from "./subprocess-visible";

export async function renderAndExit(tree: ReactElement, inkOptions?: RenderOptions): Promise<void> {
	const previousInkProgress = process.env[INK_PROGRESS_ENV];
	process.env[INK_PROGRESS_ENV] = "1";

	const { waitUntilExit, unmount, clear } = render(tree, {
		stdout: process.stderr,
		...inkOptions,
	});
	registerInkClearOutput(clear);
	try {
		await waitUntilExit();
	} catch (error: unknown) {
		unmount();
		printCliError(error);
		process.exit(1);
	} finally {
		unregisterInkClearOutput();
		if (previousInkProgress === undefined) {
			delete process.env[INK_PROGRESS_ENV];
		} else {
			process.env[INK_PROGRESS_ENV] = previousInkProgress;
		}
	}
	unmount();
}
