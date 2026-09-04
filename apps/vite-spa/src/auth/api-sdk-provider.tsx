import type { ReactNode } from "react";

import { authSession, createAuthFetcherBindings } from "@packages/auth";
import { AuthProvider } from "@packages/auth/react";
import { FetcherSettingsProvider } from "@packages/http/react";

/**
 * Empty baseURL → same-origin Vite proxy `/api` → Nest (:3006).
 * Override with absolute `VITE_NESTJS_API_URL` when not using the proxy.
 */
const nestBaseUrl =
	(import.meta.env.VITE_NESTJS_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

const authFetch = createAuthFetcherBindings(authSession);

/**
 * App-level composition: auth provider + Nest HTTP fetcher settings.
 * Auth itself lives in `@packages/auth` (no fetcher coupling).
 */
export function ApiSdkProvider({ children }: { readonly children: ReactNode }) {
	return (
		<AuthProvider session={authSession}>
			<FetcherSettingsProvider
				initialSettings={{
					config: {
						baseRequestConfig: {
							...(nestBaseUrl ? { baseURL: nestBaseUrl } : {}),
						},
						...authFetch,
					},
				}}
			>
				{children}
			</FetcherSettingsProvider>
		</AuthProvider>
	);
}
