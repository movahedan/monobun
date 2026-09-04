import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useSyncExternalStore,
} from "react";

import {
	type AuthSession,
	type AuthSessionStatus,
	authSession as defaultAuthSession,
} from "../session";
import type { AuthUser } from "../types";

export type AuthContextValue = {
	readonly session: AuthSession;
	readonly user: AuthUser | null;
	readonly isAuthenticated: boolean;
	/** `false` while cold-start `restore()` is in flight — avoid flashing the login screen. */
	readonly isReady: boolean;
	readonly status: AuthSessionStatus;
	readonly login: (email: string, password: string) => Promise<void>;
	readonly logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export type AuthProviderProps = {
	readonly session?: AuthSession;
	/** When true (default), exchange cookies for access token + user on mount. */
	readonly restoreOnMount?: boolean;
	readonly children: ReactNode;
};

/**
 * React auth state only — does **not** wrap `FetcherSettingsProvider`.
 * Compose with `@packages/http/react` in the app (see {@link createAuthFetcherBindings}).
 */
export function AuthProvider({
	session = defaultAuthSession,
	restoreOnMount = true,
	children,
}: AuthProviderProps) {
	const snapshot = useSyncExternalStore(
		(onStoreChange) => session.subscribe(onStoreChange),
		() => session.getSnapshot(),
		() => session.getSnapshot(),
	);

	useEffect(() => {
		if (!restoreOnMount) {
			return;
		}
		void session.restore();
	}, [session, restoreOnMount]);

	const login = useCallback(
		async (email: string, password: string) => {
			await session.login(email, password);
		},
		[session],
	);

	const logout = useCallback(async () => {
		await session.logout();
	}, [session]);

	const value = useMemo<AuthContextValue>(
		() => ({
			session,
			user: snapshot.user,
			isAuthenticated: snapshot.isAuthenticated,
			isReady: snapshot.status === "ready",
			status: snapshot.status,
			login,
			logout,
		}),
		[session, snapshot.user, snapshot.isAuthenticated, snapshot.status, login, logout],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
	const value = useContext(AuthContext);
	if (!value) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return value;
}
