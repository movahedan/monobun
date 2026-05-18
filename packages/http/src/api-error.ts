export type ApiFieldErrorRow = { readonly field: string; readonly message: string };

/** Flat Nest-style API error body (no `{ ok: false, error }` envelope). */
export type ApiError = {
	readonly message?: string;
	readonly fields?: readonly ApiFieldErrorRow[];
	readonly details?: Readonly<Record<string, unknown>>;
};
