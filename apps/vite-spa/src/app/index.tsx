import "./styles.css";

import { useAuth } from "@packages/auth/react";

import { ApiSdkProvider } from "../auth/api-sdk-provider";
import { DashboardPage } from "./dashboard";
import { LoginPage } from "./login";

function AppShell() {
	const { isAuthenticated, isReady } = useAuth();
	if (!isReady) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 text-sm text-gray-600">
				Restoring session…
			</div>
		);
	}
	return isAuthenticated ? <DashboardPage /> : <LoginPage />;
}

function App() {
	return (
		<ApiSdkProvider>
			<AppShell />
		</ApiSdkProvider>
	);
}

export default App;
