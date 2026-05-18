import { authConfig } from "../config";
import { prisma } from "../db";
import { parseCookies, resolveSessionFromCookies } from "./auth/session";

export type AuthContext = {
	req: Request;
	userId?: string;
	sessionId?: string;
	activeTenantId?: string;
};

export async function createContext(req: Request): Promise<AuthContext> {
	const session = await resolveSessionFromCookies(req.headers.get("cookie"));
	if (!session) {
		return { req };
	}
	return {
		req,
		userId: session.userId,
		sessionId: session.id,
		activeTenantId: session.activeTenantId ?? undefined,
	};
}

export function getCsrfFromRequest(req: Request): string | undefined {
	return parseCookies(req.headers.get("cookie"))[authConfig.cookieCsrf];
}

export { prisma };
