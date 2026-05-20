import { log } from "@packages/utils/logger";

import { authConfig } from "./config";
import { LoginPage } from "./pages/login";
import { LogoutPage } from "./pages/logout";
import { OtpPage } from "./pages/otp";
import { RegisterPage } from "./pages/register";
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

type AuthSessionResult = Readonly<{
	sessionId: string;
	refreshToken: string;
}>;

function htmlResponse(
	body: string,
	options: { status?: number; csrfToken?: string } = {},
): Response {
	const headers = new Headers({ "content-type": "text/html; charset=utf-8" });
	if (options.csrfToken) {
		headers.append("set-cookie", csrfCookieHeader(options.csrfToken, maxAge));
	}
	return new Response(body, { status: options.status ?? 200, headers });
}

function redirectWithSession(result: AuthSessionResult): Response {
	const headers = new Headers({ location: "/" });
	headers.append("set-cookie", sessionCookieHeader(result.sessionId, maxAge));
	headers.append("set-cookie", refreshCookieHeader(result.refreshToken, maxAge));
	return new Response(null, { status: 302, headers });
}

function validateFormCsrf(req: Request, csrf: string): boolean {
	return validateCsrf(getCsrfFromRequest(req), csrf);
}

async function handleLoginGet(_req: Request): Promise<Response> {
	const csrfToken = createCsrfToken();
	return htmlResponse(renderPage(<LoginPage csrfToken={csrfToken} />), { csrfToken });
}

async function handleLoginPost(req: Request): Promise<Response> {
	const form = await req.formData();
	const email = getFormField(form, "email");
	const password = getFormField(form, "password");
	const csrf = getFormField(form, "csrf");
	const csrfToken = createCsrfToken();
	if (!validateFormCsrf(req, csrf)) {
		return htmlResponse(
			renderPage(<LoginPage csrfToken={csrfToken} error="Invalid CSRF token" email={email} />),
			{
				status: 403,
				csrfToken,
			},
		);
	}

	try {
		const ctx = await createContext(req);
		const result = await createCaller(ctx).auth.login({ email, password });
		return redirectWithSession(result);
	} catch {
		return htmlResponse(
			renderPage(
				<LoginPage csrfToken={csrfToken} error="Invalid email or password" email={email} />,
			),
			{ status: 401, csrfToken },
		);
	}
}

async function handleRegisterGet(_req: Request): Promise<Response> {
	const csrfToken = createCsrfToken();
	return htmlResponse(renderPage(<RegisterPage csrfToken={csrfToken} />), { csrfToken });
}

async function handleRegisterPost(req: Request): Promise<Response> {
	const form = await req.formData();
	const email = getFormField(form, "email");
	const password = getFormField(form, "password");
	const tenantName = getFormField(form, "tenantName");
	const csrf = getFormField(form, "csrf");
	const csrfToken = createCsrfToken();
	if (!validateFormCsrf(req, csrf)) {
		return htmlResponse(
			renderPage(
				<RegisterPage
					csrfToken={csrfToken}
					error="Invalid CSRF token"
					email={email}
					tenantName={tenantName}
				/>,
			),
			{ status: 403, csrfToken },
		);
	}

	try {
		const ctx = await createContext(req);
		const result = await createCaller(ctx).auth.register({
			email,
			password,
			tenantName: tenantName || undefined,
		});
		return redirectWithSession(result);
	} catch (error) {
		const message =
			error instanceof Error && error.message.includes("already registered")
				? "Email already registered"
				: "Could not create account";
		return htmlResponse(
			renderPage(
				<RegisterPage
					csrfToken={csrfToken}
					error={message}
					email={email}
					tenantName={tenantName}
				/>,
			),
			{ status: 400, csrfToken },
		);
	}
}

async function handleOtpGet(_req: Request): Promise<Response> {
	const csrfToken = createCsrfToken();
	return htmlResponse(renderPage(<OtpPage csrfToken={csrfToken} step="request" />), { csrfToken });
}

async function handleOtpPost(req: Request): Promise<Response> {
	const form = await req.formData();
	const email = getFormField(form, "email");
	const csrf = getFormField(form, "csrf");
	const csrfToken = createCsrfToken();
	if (!validateFormCsrf(req, csrf)) {
		return htmlResponse(
			renderPage(
				<OtpPage csrfToken={csrfToken} step="request" error="Invalid CSRF token" email={email} />,
			),
			{
				status: 403,
				csrfToken,
			},
		);
	}

	try {
		const ctx = await createContext(req);
		await createCaller(ctx).auth.requestOtp({ email });
		const info = authConfig.otpLogToConsole
			? "Code sent. Check the auth server logs (AUTH_OTP_LOG=true)."
			: "If this email is valid, a code was sent.";
		return htmlResponse(
			renderPage(<OtpPage csrfToken={csrfToken} step="verify" email={email} info={info} />),
			{ csrfToken },
		);
	} catch {
		return htmlResponse(
			renderPage(
				<OtpPage csrfToken={csrfToken} step="request" error="Could not send code" email={email} />,
			),
			{
				status: 400,
				csrfToken,
			},
		);
	}
}

async function handleOtpVerifyPost(req: Request): Promise<Response> {
	const form = await req.formData();
	const email = getFormField(form, "email");
	const code = getFormField(form, "code");
	const csrf = getFormField(form, "csrf");
	const csrfToken = createCsrfToken();
	if (!validateFormCsrf(req, csrf)) {
		return htmlResponse(
			renderPage(
				<OtpPage csrfToken={csrfToken} step="verify" error="Invalid CSRF token" email={email} />,
			),
			{ status: 403, csrfToken },
		);
	}

	try {
		const ctx = await createContext(req);
		const result = await createCaller(ctx).auth.verifyOtp({ email, code });
		return redirectWithSession(result);
	} catch {
		return htmlResponse(
			renderPage(
				<OtpPage
					csrfToken={csrfToken}
					step="verify"
					error="Invalid or expired code"
					email={email}
				/>,
			),
			{ status: 401, csrfToken },
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
	{ method: "GET", path: "/register", handle: handleRegisterGet },
	{ method: "POST", path: "/register", handle: handleRegisterPost },
	{ method: "GET", path: "/otp", handle: handleOtpGet },
	{ method: "POST", path: "/otp", handle: handleOtpPost },
	{ method: "POST", path: "/otp/verify", handle: handleOtpVerifyPost },
	{ method: "GET", path: "/logout", handle: handleLogoutGet },
	{
		method: "GET",
		path: "/",
		handle: () =>
			Response.json({
				service: "@apps/auth",
				docs: "/login",
				register: "/register",
				otp: "/otp",
			}),
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
