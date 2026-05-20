"use server";

import { createCaller } from "../caller";
import { createContext } from "../context";

/** Server action bridge — calls tRPC caller (noop spike retained for bundler). */
export async function loginAction(input: { email: string; password: string }) {
	const req = new Request("https://auth.internal/action", { method: "POST" });
	const caller = createCaller(await createContext(req));
	return caller.auth.login(input);
}

export async function registerAction(input: {
	email: string;
	password: string;
	tenantName?: string;
}) {
	const req = new Request("https://auth.internal/action", { method: "POST" });
	const caller = createCaller(await createContext(req));
	return caller.auth.register(input);
}

export async function requestOtpAction(input: { email: string }) {
	const req = new Request("https://auth.internal/action", { method: "POST" });
	const caller = createCaller(await createContext(req));
	return caller.auth.requestOtp(input);
}

export async function verifyOtpAction(input: { email: string; code: string }) {
	const req = new Request("https://auth.internal/action", { method: "POST" });
	const caller = createCaller(await createContext(req));
	return caller.auth.verifyOtp(input);
}

export async function logoutAction() {
	const req = new Request("https://auth.internal/action", { method: "POST" });
	const caller = createCaller(await createContext(req));
	return caller.auth.logout();
}

export async function noopAction(): Promise<{ ok: true }> {
	return { ok: true };
}
