import { type CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";

import { hasScope, type Scope } from "@packages/auth-contract";

import { REQUIRED_SCOPES_KEY } from "../decorators/require-scopes.decorator";
import { ApiException } from "../exceptions/api.exception";

type AuthRequest = {
	scopes?: string[];
	tenantId?: string;
};

@Injectable()
export class ScopesGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const handler = context.getHandler();
		const required =
			(Reflect.getMetadata(REQUIRED_SCOPES_KEY, handler) as Scope[] | undefined) ??
			(Reflect.getMetadata(REQUIRED_SCOPES_KEY, context.getClass()) as Scope[] | undefined);

		if (!required?.length) {
			return true;
		}

		const request = context.switchToHttp().getRequest<AuthRequest>();
		const granted = request.scopes ?? [];
		const ok = required.every((scope) => hasScope(granted, scope));
		if (!ok) {
			throw new ApiException(403, { message: "Insufficient scope" });
		}
		if (!request.tenantId) {
			throw new ApiException(401, { message: "Missing tenant context" });
		}
		return true;
	}
}
