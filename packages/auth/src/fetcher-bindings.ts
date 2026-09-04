import type { AuthSession } from "./session";

type HeaderBagable = {
	readonly headers?: Record<string, string>;
};

/**
 * Helpers to plug {@link AuthSession} into `@packages/http` `FetcherSettings`
 * without depending on that package (structural typing).
 */
export function createAuthFetcherBindings(session: AuthSession) {
	return {
		refreshConfig: {
			shouldRefresh: () => session.isAuthenticated(),
			refresh: () => session.refreshToken(),
			refreshCoordination: session.refreshCoordination,
		},
		attachAccessToken: async <T extends HeaderBagable>(options: T): Promise<T> => {
			await session.refreshAccessTokenIfExpiringSoon();
			const token = session.getAccessToken();
			const tenantId = session.getTenantId();
			return {
				...options,
				headers: {
					...options.headers,
					...(token ? { Authorization: `Bearer ${token}` } : {}),
					...(tenantId ? { "x-tenant-id": tenantId } : {}),
				},
			};
		},
	};
}
