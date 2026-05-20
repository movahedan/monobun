import { TRPCError } from "@trpc/server";

const attempts = new Map<string, { count: number; resetAt: number }>();

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 60_000;

export function checkRateLimit(key: string): void {
	const now = Date.now();
	const entry = attempts.get(key);
	if (!entry || entry.resetAt < now) {
		attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
		return;
	}
	entry.count += 1;
	if (entry.count > MAX_ATTEMPTS) {
		throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many attempts" });
	}
}
