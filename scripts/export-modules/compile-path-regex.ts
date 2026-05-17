import safeRegex from "safe-regex";

const MAX_PATTERN_LENGTH = 500;

export function compilePathRegex(pattern: string, flags: string): RegExp {
	if (pattern.length > MAX_PATTERN_LENGTH) {
		throw new Error(`Pattern exceeds max length (${MAX_PATTERN_LENGTH})`);
	}
	const safeFlags = flags.replaceAll("g", "");
	let compiled: RegExp;
	try {
		compiled = new RegExp(pattern, safeFlags);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Invalid regular expression: ${message}`);
	}
	if (!safeRegex(compiled)) {
		throw new Error(
			"Pattern is rejected because it may cause catastrophic backtracking (ReDoS). Use a simpler regex without nested quantifiers such as (a+)+ or overlapping unbounded repetition.",
		);
	}
	return compiled;
}
