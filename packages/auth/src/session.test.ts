import { afterEach, describe, expect, it, mock } from "bun:test";

import { AuthSession } from "./session";

const originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");

function stubDocumentCookie(value: string): void {
	Object.defineProperty(document, "cookie", {
		configurable: true,
		enumerable: true,
		get: () => value,
		set: () => {
			/* ignore writes in unit tests */
		},
	});
}

function restoreDocumentCookie(): void {
	if (originalCookieDescriptor) {
		Object.defineProperty(Document.prototype, "cookie", originalCookieDescriptor);
	}
	Reflect.deleteProperty(document, "cookie");
}

describe("AuthSession", () => {
	afterEach(() => {
		mock.restore();
		restoreDocumentCookie();
	});

	it("applyLogin stores token and user", () => {
		const session = new AuthSession();
		session.applyLogin({
			accessToken: "access",
			sessionId: "sess",
			refreshToken: "refresh",
			user: {
				id: "u1",
				email: "a@example.com",
				tenantId: "t1",
				role: "owner",
			},
		});

		expect(session.isAuthenticated()).toBe(true);
		expect(session.getAccessToken()).toBe("access");
		expect(session.getTenantId()).toBe("t1");
		expect(session.getUser()?.email).toBe("a@example.com");
		expect(session.getStatus()).toBe("ready");
	});

	it("refreshToken updates access token", async () => {
		const session = new AuthSession({ refreshUrl: "/auth/api/refresh" });
		session.applyLogin({
			accessToken: "old",
			sessionId: "sess",
			refreshToken: "refresh",
			user: { id: "u1", email: "a@example.com", tenantId: "t1", role: "owner" },
		});

		globalThis.fetch = mock(async () =>
			Promise.resolve(
				new Response(JSON.stringify({ access_token: "new", expires_in: 900 }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
			),
		) as unknown as typeof fetch;

		await session.refreshToken();
		expect(session.getAccessToken()).toBe("new");
	});

	it("clear drops auth state", () => {
		const session = new AuthSession();
		session.applyLogin({
			accessToken: "access",
			sessionId: "sess",
			refreshToken: "refresh",
			user: { id: "u1", email: "a@example.com", tenantId: "t1", role: "owner" },
		});
		session.clear();
		expect(session.isAuthenticated()).toBe(false);
		expect(session.getAccessToken()).toBeUndefined();
		expect(session.getStatus()).toBe("ready");
	});

	it("getSnapshot is referentially stable until user/auth/status changes", () => {
		const session = new AuthSession();
		const a = session.getSnapshot();
		expect(session.getSnapshot()).toBe(a);

		session.applyLogin({
			accessToken: "access",
			sessionId: "sess",
			refreshToken: "refresh",
			user: { id: "u1", email: "a@example.com", tenantId: "t1", role: "owner" },
		});
		const afterLogin = session.getSnapshot();
		expect(afterLogin).not.toBe(a);
		expect(session.getSnapshot()).toBe(afterLogin);
	});

	it("restore hydrates from refresh + auth.me when session cookie exists", async () => {
		const session = new AuthSession({
			refreshUrl: "/auth/api/refresh",
			trpcBaseUrl: "/auth/api",
			sessionCookieName: "auth_session",
		});

		stubDocumentCookie("auth_session=sess-id");

		globalThis.fetch = mock(async (input: RequestInfo | URL) => {
			const url = String(input);
			if (url.includes("/refresh")) {
				return new Response(JSON.stringify({ access_token: "restored", expires_in: 900 }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			}
			if (url.includes("auth.me")) {
				return new Response(
					JSON.stringify({
						result: {
							data: {
								id: "u1",
								email: "a@example.com",
								activeTenantId: "t1",
								memberships: [{ tenantId: "t1", role: "owner" }],
							},
						},
					}),
					{ status: 200, headers: { "Content-Type": "application/json" } },
				);
			}
			return new Response("not found", { status: 404 });
		}) as unknown as typeof fetch;

		const ok = await session.restore();
		expect(ok).toBe(true);
		expect(session.isAuthenticated()).toBe(true);
		expect(session.getAccessToken()).toBe("restored");
		expect(session.getUser()?.email).toBe("a@example.com");
		expect(session.getStatus()).toBe("ready");
	});

	it("restore becomes ready without auth when no session cookie", async () => {
		const session = new AuthSession();
		stubDocumentCookie("");
		const ok = await session.restore();
		expect(ok).toBe(false);
		expect(session.getStatus()).toBe("ready");
		expect(session.isAuthenticated()).toBe(false);
	});
});
