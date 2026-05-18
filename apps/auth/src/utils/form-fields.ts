export function getFormField(form: FormData, name: string): string {
	const value = form.get(name);
	if (typeof value === "string") {
		return value;
	}
	if (value instanceof File) {
		return value.name;
	}
	return "";
}
