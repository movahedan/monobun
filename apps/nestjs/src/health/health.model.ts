import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

import { BaseDto } from "../common/models/dto.model";

export const HealthStatusSchema = z.object({
	ok: z.boolean(),
	timestamp: z.string().datetime(),
});

export type HealthStatus = z.infer<typeof HealthStatusSchema>;

/** Non-list success body — returned directly as JSON (no `list` / `pageInfo`). */
export class HealthStatusDto extends BaseDto {
	@ApiProperty({ example: true })
	readonly ok!: boolean;

	@ApiProperty({ format: "date-time" })
	readonly timestamp!: string;
}
