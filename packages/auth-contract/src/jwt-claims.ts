import type { Scope } from "./scopes.ts";

export type HumanAccessClaims = {
	sub: string;
	iss: string;
	aud: string | string[];
	exp: number;
	iat: number;
	scopes: Scope[];
	tid: string;
};

export type MachineAccessClaims = {
	sub: string;
	iss: string;
	aud: string | string[];
	exp: number;
	iat: number;
	scopes: Scope[];
};
