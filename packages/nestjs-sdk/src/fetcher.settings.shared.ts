/** Base URL for `@apps/nestjs` OpenAPI (used by SDK mutators). */
export function getNestjsApiBaseUrl(): string {
	const raw = (process.env.NESTJS_API_URL ?? process.env.API_BASE_URL ?? "").trim();
	if (/^https?:\/\//i.test(raw)) return raw.replace(/\/$/, "");
	return `http://localhost:${process.env.NESTJS_PORT ?? "3006"}`;
}
