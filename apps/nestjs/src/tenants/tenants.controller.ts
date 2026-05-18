import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from "@nestjs/common";
import { ApiHeader, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { type ListQuery, ListQuerySchema } from "../common/api/list-query.model";
import { ApiStandardErrors } from "../common/api/openapi-responses";
import { TenantId } from "../common/decorators/tenant-id.decorator";
import { TenantGuard } from "../common/guards/tenant.guard";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { TenantListResponseDto } from "./tenant.model";
import type { TenantsService } from "./tenants.service";

@ApiTags("Tenants")
@Controller("v1/tenants")
@UseGuards(TenantGuard)
@ApiHeader({
	name: "x-tenant-id",
	description: "Active tenant scope (UUID)",
	required: true,
})
export class TenantsController {
	constructor(private readonly tenantsService: TenantsService) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "List tenants visible to the current tenant context" })
	@ApiOkResponse({ description: "Paginated tenant list", type: TenantListResponseDto })
	@ApiStandardErrors()
	@ApiQuery({ name: "page", required: false, type: Number })
	@ApiQuery({ name: "limit", required: false, type: Number })
	@ApiQuery({ name: "search", required: false, type: String })
	listTenants(
		@TenantId() tenantId: string,
		@Query(new ZodValidationPipe(ListQuerySchema)) query: ListQuery,
	) {
		return this.tenantsService.listTenants(tenantId, query);
	}
}
