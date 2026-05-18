import { Injectable } from "@nestjs/common";

import { type ListQuery, paginateList } from "../common/api/list-query.model";
import type { Tenant } from "./tenant.model";

@Injectable()
export class TenantsService {
	/** Phase 1 stub — replaced with Prisma in Phase 2+. */
	listTenants(_tenantId: string, query: ListQuery) {
		const seed: Tenant[] = [];
		return paginateList(seed, query);
	}
}
