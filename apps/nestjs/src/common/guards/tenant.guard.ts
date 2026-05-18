import { type CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";
import { z } from "zod";

import { ApiException } from "../exceptions/api.exception";

const tenantIdSchema = z.uuid();

function firstHeaderValue(raw: string | string[] | undefined): string | undefined {
	if (typeof raw === "string") return raw;
	if (Array.isArray(raw)) return raw[0];
	return undefined;
}

@Injectable()
export class TenantGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<{
			headers: Record<string, string | string[] | undefined>;
			tenantId?: string;
		}>();

		const tenantId = firstHeaderValue(request.headers["x-tenant-id"]);

		if (!tenantId) {
			throw new ApiException(401, { message: "Missing x-tenant-id header" });
		}

		const parsed = tenantIdSchema.safeParse(tenantId);
		if (!parsed.success) {
			throw new ApiException(400, {
				message: "Invalid tenant id",
				fields: [{ field: "x-tenant-id", message: "Must be a valid UUID" }],
			});
		}

		request.tenantId = parsed.data;
		return true;
	}
}
