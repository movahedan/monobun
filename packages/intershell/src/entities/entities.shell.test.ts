import { expect, mock, test } from "bun:test";
import type { EntitiesShell } from "./entities.shell.type";

export type EntitiesShellMock = {
	[key in keyof EntitiesShell]?: ReturnType<typeof mock>;
};

export function mockEntitiesShell(entitiesShell: EntitiesShellMock) {
	return mock.module("../entities.shell", () => ({
		entitiesShell,
	}));
}

test("entitiesShell should be defined", async () => {
	const { entitiesShell } = await import("./entities.shell");
	expect(entitiesShell).toBeDefined();
});
