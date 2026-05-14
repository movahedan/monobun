import { type RenderOptions, render } from "ink";
import type { ReactElement } from "react";

export async function renderAndExit(tree: ReactElement, inkOptions?: RenderOptions): Promise<void> {
	const { waitUntilExit, unmount } = render(tree, {
		stdout: process.stderr,
		...inkOptions,
	});
	try {
		await waitUntilExit();
	} catch (error: unknown) {
		unmount();
		console.error(error);
		process.exit(1);
	}
	unmount();
}
