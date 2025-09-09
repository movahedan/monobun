type Validator = (tag: ParsedTag) => true | string;

export interface TagConfig {
	readonly format: {
		readonly list: readonly string[];
		readonly validator?: Validator;
	};
	readonly prefix: {
		readonly list: readonly string[];
		readonly validator?: Validator;
	};
	readonly name: {
		readonly minLength: number;
		readonly maxLength: number;
		readonly allowedCharacters: RegExp;
		readonly noSpaces: boolean;
		readonly noSpecialChars: boolean;
	};
}

export interface ParsedTag {
	readonly name: string;
	readonly prefix?: string;
	readonly format?: string;
}

export interface TagValidationResult {
	readonly isValid: boolean;
	readonly errors: string[];
}

export interface TagRule {
	readonly section: string;
	readonly question: string;
	readonly validator: Validator;
	readonly list?: readonly string[];
}
