import { Controller, Get, HttpCode, HttpStatus, Inject, Query, UseGuards } from "@nestjs/common";
import { ApiHeader, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

import { SCOPES } from "@packages/auth-contract";

import { type ListQuery, ListQuerySchema } from "../common/api/list-query.model";
import { ApiStandardErrors } from "../common/api/openapi-responses";
import { RequireScopes } from "../common/decorators/require-scopes.decorator";
import { TenantId } from "../common/decorators/tenant-id.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { ScopesGuard } from "../common/guards/scopes.guard";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { TenantListResponseDto } from "./tenant.model";
import { TenantsService } from "./tenants.service";

@ApiTags("Tenants")
@Controller("v1/tenants")
@UseGuards(JwtAuthGuard, ScopesGuard)
@RequireScopes(SCOPES.read)
@ApiHeader({
	name: "x-tenant-id",
	description: "Active tenant scope (UUID)",
	required: true,
})
export class TenantsController {
	constructor(@Inject(TenantsService) private readonly tenantsService: TenantsService) {}

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
