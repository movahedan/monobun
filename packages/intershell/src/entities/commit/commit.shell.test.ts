import { describe, expect, it } from "bun:test";
import { setupBunMocks } from "@repo/test-preset/mock-bun";
import { commitShell } from "./commit.shell";

describe.skip("commitShell", () => {
	it("should return the correct result", async () => {
		setupBunMocks({
			command: {
				text: "abc123",
				exitCode: 0,
			},
		});
		const gitShowResults = await commitShell.gitShow("abc123");
		expect(gitShowResults.exitCode).toBe(0);
		expect(gitShowResults.text()).toBe("abc123");

		const gitShowNameOnlyResults = await commitShell.gitShowNameOnly("abc123");
		expect(gitShowNameOnlyResults.exitCode).toBe(0);
		expect(gitShowNameOnlyResults.text()).toBe("abc123");
	});
});
