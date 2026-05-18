export type QueryPrimitive = string | number | boolean | null | undefined;

export type QueryArrayValue = ReadonlyArray<string | number | boolean>;

export type ParsedUrlQueryInput = Record<string, QueryPrimitive | QueryArrayValue>;
