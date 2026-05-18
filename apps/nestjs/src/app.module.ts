import { Module } from "@nestjs/common";

import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { TenantsModule } from "./tenants/tenants.module";

@Module({
	imports: [PrismaModule, HealthModule, TenantsModule],
})
export class AppModule {}
