import { type CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { ApiException } from "../exceptions/api.exception";

type AuthRequest = {
	headers: Record<string, string | string[] | undefined>;
	tenantId?: string;
	actorId?: string;
	scopes?: string[];
};

function bearerToken(authorization: string | undefined): string | undefined {
	if (!authorization?.startsWith("Bearer ")) {
		return undefined;
	}
	return authorization.slice("Bearer ".length).trim();
}

function jwksUrl(): string {
	const url = process.env.AUTH_JWKS_URL;
	if (!url) {
		throw new Error("AUTH_JWKS_URL is required");
	}
	return url;
}

function issuer(): string {
	const value = process.env.AUTH_ISSUER;
	if (!value) {
		throw new Error("AUTH_ISSUER is required");
	}
	return value;
}

function audience(): string {
	return process.env.AUTH_AUDIENCE ?? "monobun-api";
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
	private jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

	private getJwks(): ReturnType<typeof createRemoteJWKSet> {
		this.jwks ??= createRemoteJWKSet(new URL(jwksUrl()));
		return this.jwks;
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<AuthRequest>();
		const token = bearerToken(
			typeof request.headers.authorization === "string" ? request.headers.authorization : undefined,
		);

		if (!token) {
			if (this.allowHeaderTenant(request)) {
				return true;
			}
			throw new ApiException(401, { message: "Missing Bearer token" });
		}

		try {
			const verified = await jwtVerify(token, this.getJwks(), {
				issuer: issuer(),
				audience: audience(),
			});
			const payload = verified.payload as {
				sub?: string;
				tid?: string;
				scopes?: string[];
			};
			if (!payload.sub) {
				throw new ApiException(401, { message: "Invalid token" });
			}
			request.actorId = payload.sub;
			request.scopes = Array.isArray(payload.scopes) ? payload.scopes : [];
			if (payload.tid) {
				request.tenantId = payload.tid;
			}
			return true;
		} catch {
			throw new ApiException(401, { message: "Invalid or expired token" });
		}
	}

	private allowHeaderTenant(request: AuthRequest): boolean {
		const allow =
			process.env.NODE_ENV === "development" && process.env.AUTH_ALLOW_HEADER_TENANT === "true";
		if (!allow) {
			return false;
		}
		const tenantId = request.headers["x-tenant-id"];
		if (typeof tenantId === "string" && tenantId.length > 0) {
			request.tenantId = tenantId;
			request.actorId = request.actorId ?? "dev-actor";
			request.scopes = request.scopes ?? [
				"feature-flags:admin",
				"feature-flags:write",
				"feature-flags:read",
			];
			return true;
		}
		return false;
	}
}
