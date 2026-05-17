import { describe, expect, it, spyOn } from "bun:test";

import { log } from "./logger";

describe("@repo/utils - logger", () => {
	it("prints a message", () => {
		const consoleSpy = spyOn(console, "log").mockImplementation(() => {});

		try {
			log("hello");
			expect(consoleSpy).toHaveBeenCalledWith("LOGGER: ", "hello");
		} finally {
			consoleSpy.mockRestore();
		}
	});
});
