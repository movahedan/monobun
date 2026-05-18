import { type CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";
import { z } from "zod";

import { ApiException } from "../exceptions/api.exception";

const tenantIdSchema = z.uuid();

@Injectable()
export class TenantGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<{
			headers: Record<string, string | string[] | undefined>;
			tenantId?: string;
		}>();

		const raw = request.headers["x-tenant-id"];
		const tenantId = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;

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
