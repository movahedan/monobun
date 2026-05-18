import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { ApiStandardErrors } from "../common/api/openapi-responses";
import { type HealthStatus, HealthStatusDto } from "./health.model";

@ApiTags("Health")
@Controller()
export class HealthController {
	@Get("status")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Health check (infra alias without /api prefix)" })
	@ApiOkResponse({ description: "Service is healthy", type: HealthStatusDto })
	@ApiStandardErrors()
	getStatusAlias(): HealthStatus {
		return this.buildStatus();
	}

	@Get("v1/health")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Health check" })
	@ApiOkResponse({ description: "Service is healthy", type: HealthStatusDto })
	@ApiStandardErrors()
	getStatus(): HealthStatus {
		return this.buildStatus();
	}

	private buildStatus(): HealthStatus {
		return { ok: true, timestamp: new Date().toISOString() };
	}
}
