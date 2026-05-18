import { log } from "@packages/utils/logger";

import { authConfig } from "./config";
import { LoginPage } from "./pages/login";
import { LogoutPage } from "./pages/logout";
import { createCsrfToken, csrfCookieHeader, validateCsrf } from "./trpc/auth/csrf";
import { getJwks } from "./trpc/auth/keys";
import { handleTokenRequest } from "./trpc/auth/m2m";
import { handleRefreshRequest } from "./trpc/auth/refresh";
import { clearCookieHeader, refreshCookieHeader, sessionCookieHeader } from "./trpc/auth/session";
import { createCaller } from "./trpc/caller";
import { createContext, getCsrfFromRequest } from "./trpc/context";
import { handleTrpcRequest } from "./trpc/handler";
import { getFormField } from "./utils/form-fields";
import { renderPage } from "./utils/render-page";

const maxAge = authConfig.refreshTtlDays * 24 * 60 * 60;

function loginHtmlResponse(
	csrfToken: string,
	options: { status?: number; error?: string; email?: string } = {},
): Response {
	const headers = new Headers({ "content-type": "text/html; charset=utf-8" });
	headers.append("set-cookie", csrfCookieHeader(csrfToken, maxAge));
	return new Response(
		renderPage(<LoginPage csrfToken={csrfToken} error={options.error} email={options.email} />),
		{ status: options.status ?? 200, headers },
	);
}

async function handleLoginGet(_req: Request): Promise<Response> {
	return loginHtmlResponse(createCsrfToken());
}

async function handleLoginPost(req: Request): Promise<Response> {
	const form = await req.formData();
	const email = getFormField(form, "email");
	const password = getFormField(form, "password");
	const csrf = getFormField(form, "csrf");
	if (!validateCsrf(getCsrfFromRequest(req), csrf)) {
		return loginHtmlResponse(createCsrfToken(), {
			status: 403,
			error: "Invalid CSRF token",
			email,
		});
	}

	try {
		const ctx = await createContext(req);
		const result = await createCaller(ctx).auth.login({ email, password });
		const headers = new Headers({ location: "/" });
		headers.append("set-cookie", sessionCookieHeader(result.sessionId, maxAge));
		headers.append("set-cookie", refreshCookieHeader(result.refreshToken, maxAge));
		return new Response(null, { status: 302, headers });
	} catch {
		return loginHtmlResponse(createCsrfToken(), {
			status: 401,
			error: "Invalid email or password",
			email,
		});
	}
}

async function handleLogoutGet(req: Request): Promise<Response> {
	const ctx = await createContext(req);
	if (ctx.sessionId) {
		await createCaller(ctx).auth.logout();
	}
	const headers = new Headers({ "content-type": "text/html; charset=utf-8" });
	headers.append("set-cookie", clearCookieHeader(authConfig.cookieSession));
	headers.append("set-cookie", clearCookieHeader(authConfig.cookieRefresh));
	headers.append("set-cookie", clearCookieHeader(authConfig.cookieCsrf));
	return new Response(renderPage(<LogoutPage />), { headers });
}

type RouteHandler = (req: Request) => Response | Promise<Response>;

const routes: Array<{ method: string; path: string; handle: RouteHandler }> = [
	{
		method: "GET",
		path: "/status",
		handle: () => Response.json({ ok: true, timestamp: new Date().toISOString() }),
	},
	{
		method: "GET",
		path: "/.well-known/jwks.json",
		handle: async () => Response.json(await getJwks()),
	},
	{ method: "POST", path: "/api/refresh", handle: handleRefreshRequest },
	{ method: "POST", path: "/api/token", handle: handleTokenRequest },
	{ method: "GET", path: "/login", handle: handleLoginGet },
	{ method: "POST", path: "/login", handle: handleLoginPost },
	{ method: "GET", path: "/logout", handle: handleLogoutGet },
	{
		method: "GET",
		path: "/",
		handle: () => Response.json({ service: "@apps/auth", docs: "/login" }),
	},
];

const server = Bun.serve({
	hostname: authConfig.host,
	port: authConfig.port,
	async fetch(req) {
		const url = new URL(req.url);
		const route = routes.find((r) => r.path === url.pathname && r.method === req.method);
		if (route) {
			return route.handle(req);
		}

		if (url.pathname.startsWith("/api")) {
			return handleTrpcRequest(req);
		}

		return new Response("Not Found", { status: 404 });
	},
});

log(`@apps/auth listening on http://${server.hostname}:${server.port}`);
