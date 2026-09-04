import { useState } from "react";

import { useAuth } from "@packages/auth/react";
import { LoginForm, type LoginFormData } from "@packages/ui/molecules";

export function LoginPage() {
	const { login } = useAuth();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | undefined>();
	const [success, setSuccess] = useState<string | undefined>();

	const handleLogin = async (data: LoginFormData) => {
		setLoading(true);
		setError(undefined);
		setSuccess(undefined);

		try {
			await login(data.email, data.password);
			setSuccess("Login successful");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Login failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
					<p className="mt-2 text-sm text-gray-600">Sign in with `@apps/auth`</p>
				</div>

				<LoginForm
					onSubmit={handleLogin}
					loading={loading}
					error={error}
					success={success}
					title="Welcome back"
					description="Sign in to your admin account"
					submitText="Sign In"
				/>

				<div className="text-center">
					<p className="text-xs text-gray-500">
						Seed credentials: admin@example.com / changeme (auth `.env`)
					</p>
				</div>
			</div>
		</div>
	);
}
