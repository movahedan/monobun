import { Module } from "@nestjs/common";

import { HealthModule } from "./health/health.module";
import { TenantsModule } from "./tenants/tenants.module";

@Module({
	imports: [HealthModule, TenantsModule],
})
export class AppModule {}
