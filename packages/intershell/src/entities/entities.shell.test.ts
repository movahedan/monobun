import { expect, mock, test } from "bun:test";
import type { $ } from "bun";

test("entitiesShell should be defined", async () => {
	const { entitiesShell } = await import("./entities.shell");
	expect(entitiesShell).toBeDefined();
});

test("entitiesShell methods can be mocked individually", async () => {
	const { entitiesShell } = await import("./entities.shell");

	// Mock individual methods directly
	entitiesShell.turboRunBuild = mock(
		() =>
			({
				exitCode: 0,
				json: () => Promise.resolve({ packages: ["test-package"] }),
			}) as unknown as $.ShellPromise,
	);

	entitiesShell.runBiomeCheck = mock(
		() =>
			({
				exitCode: 0,
				text: () => "biome check completed",
			}) as unknown as $.ShellPromise,
	);

	// Test that mocks work
	const result = await entitiesShell.turboRunBuild(["--filter=test"]).json();
	expect(result.packages).toEqual(["test-package"]);

	const biomeResult = await entitiesShell.runBiomeCheck("test-file.ts");
	expect(biomeResult.text()).toBe("biome check completed");
});
