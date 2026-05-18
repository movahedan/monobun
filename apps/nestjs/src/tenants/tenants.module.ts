import { Module } from "@nestjs/common";

import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { ScopesGuard } from "../common/guards/scopes.guard";
import { TenantsController } from "./tenants.controller";
import { TenantsService } from "./tenants.service";

@Module({
	controllers: [TenantsController],
	providers: [TenantsService, JwtAuthGuard, ScopesGuard],
})
export class TenantsModule {}
