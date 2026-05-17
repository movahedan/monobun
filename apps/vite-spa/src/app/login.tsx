import { LoginForm, type LoginFormData } from "@repo/ui/login-form";
import { useState } from "react";

export function LoginPage() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | undefined>();
	const [success, setSuccess] = useState<string | undefined>();

	const handleLogin = async (data: LoginFormData) => {
		setLoading(true);
		setError(undefined);
		setSuccess(undefined);

		try {
			// Simulate API call
			await new Promise((resolve, reject) => {
				setTimeout(() => {
					// Mock authentication logic
					if (data.email === "admin@example.com" && data.password === "password123") {
						resolve({ success: true });
					} else {
						reject(new Error("Invalid credentials"));
					}
				}, 1000);
			});

			setSuccess("Login successful! Redirecting...");

			// In a real app, you would:
			// 1. Store the authentication token
			// 2. Redirect to the dashboard
			// 3. Update the app state

			setTimeout(() => {
				// Simulate redirect
				console.log("Redirecting to dashboard...");
			}, 2000);
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
					<p className="mt-2 text-sm text-gray-600">Sign in to access your admin panel</p>
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
					<p className="text-xs text-gray-500">Demo credentials: admin@example.com / password123</p>
				</div>
			</div>
		</div>
	);
}
