"use server";

import { createCaller } from "../caller";
import { createContext } from "../context";

/** Server action bridge — calls tRPC caller (noop spike retained for bundler). */
export async function loginAction(input: { email: string; password: string }) {
	const req = new Request("https://auth.internal/action", { method: "POST" });
	const caller = createCaller(await createContext(req));
	return caller.auth.login(input);
}

export async function logoutAction() {
	const req = new Request("https://auth.internal/action", { method: "POST" });
	const caller = createCaller(await createContext(req));
	return caller.auth.logout();
}

export async function noopAction(): Promise<{ ok: true }> {
	return { ok: true };
}
