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
import { renderPage } from "./utils/render-page";

const maxAge = authConfig.refreshTtlDays * 24 * 60 * 60;

async function handleLoginGet(_req: Request): Promise<Response> {
	const csrfToken = createCsrfToken();
	const headers = new Headers({ "content-type": "text/html; charset=utf-8" });
	headers.append("set-cookie", csrfCookieHeader(csrfToken, maxAge));
	const html = renderPage(<LoginPage csrfToken={csrfToken} />);
	return new Response(html, { headers });
}

async function handleLoginPost(req: Request): Promise<Response> {
	const form = await req.formData();
	const email = String(form.get("email") ?? "");
	const password = String(form.get("password") ?? "");
	const csrf = String(form.get("csrf") ?? "");
	if (!validateCsrf(getCsrfFromRequest(req), csrf)) {
		const csrfToken = createCsrfToken();
		const headers = new Headers({ "content-type": "text/html; charset=utf-8" });
		headers.append("set-cookie", csrfCookieHeader(csrfToken, maxAge));
		return new Response(
			renderPage(<LoginPage csrfToken={csrfToken} error="Invalid CSRF token" email={email} />),
			{ status: 403, headers },
		);
	}

	try {
		const ctx = await createContext(req);
		const result = await createCaller(ctx).auth.login({ email, password });
		const headers = new Headers({ location: "/" });
		headers.append("set-cookie", sessionCookieHeader(result.sessionId, maxAge));
		headers.append("set-cookie", refreshCookieHeader(result.refreshToken, maxAge));
		return new Response(null, { status: 302, headers });
	} catch {
		const csrfToken = createCsrfToken();
		const headers = new Headers({ "content-type": "text/html; charset=utf-8" });
		headers.append("set-cookie", csrfCookieHeader(csrfToken, maxAge));
		return new Response(
			renderPage(
				<LoginPage csrfToken={csrfToken} error="Invalid email or password" email={email} />,
			),
			{ status: 401, headers },
		);
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

const server = Bun.serve({
	hostname: authConfig.host,
	port: authConfig.port,
	async fetch(req) {
		const url = new URL(req.url);
		const { pathname } = url;

		if (pathname === "/status" && req.method === "GET") {
			return Response.json({ ok: true, timestamp: new Date().toISOString() });
		}

		if (pathname === "/.well-known/jwks.json" && req.method === "GET") {
			return Response.json(await getJwks());
		}

		if (pathname === "/api/refresh" && req.method === "POST") {
			return handleRefreshRequest(req);
		}

		if (pathname === "/api/token" && req.method === "POST") {
			return handleTokenRequest(req);
		}

		if (pathname === "/login" && req.method === "GET") {
			return handleLoginGet(req);
		}

		if (pathname === "/login" && req.method === "POST") {
			return handleLoginPost(req);
		}

		if (pathname === "/logout" && req.method === "GET") {
			return handleLogoutGet(req);
		}

		if (pathname.startsWith("/api")) {
			return handleTrpcRequest(req);
		}

		if (pathname === "/" && req.method === "GET") {
			return Response.json({ service: "@apps/auth", docs: "/login" });
		}

		return new Response("Not Found", { status: 404 });
	},
});

log(`@apps/auth listening on http://${server.hostname}:${server.port}`);
