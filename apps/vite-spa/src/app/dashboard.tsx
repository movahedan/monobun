import { useAuth } from "@packages/auth/react";
import { useTenantsControllerListTenants } from "@packages/nestjs-sdk/hooks";

export function DashboardPage() {
	const { user, logout } = useAuth();
	const tenantId = user?.tenantId ?? "";

	const { data, error, isLoading } = useTenantsControllerListTenants(
		{ "x-tenant-id": tenantId },
		{ page: 1, limit: 20 },
		{ shouldFetch: Boolean(tenantId) },
	);

	return (
		<div className="min-h-screen bg-gray-50 py-10 px-4">
			<div className="mx-auto max-w-3xl space-y-6">
				<header className="flex items-start justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Admin dashboard</h1>
						<p className="mt-1 text-sm text-gray-600">
							Signed in as {user?.email} · tenant {user?.tenantId}
						</p>
					</div>
					<button
						type="button"
						className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
						onClick={() => {
							void logout();
						}}
					>
						Sign out
					</button>
				</header>

				<section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-gray-900">Tenants (Nest API)</h2>
					<p className="mt-1 text-sm text-gray-500">
						Bearer JWT from `@apps/auth` → `@apps/nestjs` via `@packages/nestjs-sdk`
					</p>

					{isLoading ? <p className="mt-4 text-sm text-gray-600">Loading…</p> : null}
					{error ? (
						<p className="mt-4 text-sm text-red-600">
							{typeof error === "object" && error && "message" in error
								? String((error as { message?: string }).message)
								: "Failed to load tenants"}
						</p>
					) : null}
					{data ? (
						<ul className="mt-4 divide-y divide-gray-100">
							{data.list.map((tenant) => (
								<li key={tenant.id} className="py-3 text-sm">
									<span className="font-medium text-gray-900">{tenant.name}</span>
									<span className="ml-2 text-gray-500">{tenant.slug}</span>
									<span className="ml-2 font-mono text-xs text-gray-400">{tenant.id}</span>
								</li>
							))}
							{data.list.length === 0 ? (
								<li className="py-3 text-sm text-gray-500">No tenants visible for this JWT.</li>
							) : null}
						</ul>
					) : null}
				</section>
			</div>
		</div>
	);
}
