import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

import { PageInfoDto } from "../common/api/page-info.model";
import { BaseDto } from "../common/models/dto.model";

export const TenantSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	slug: z.string(),
	createdAt: z.string().datetime(),
});

export type Tenant = z.infer<typeof TenantSchema>;

export class TenantDto extends BaseDto {
	@ApiProperty({ format: "uuid" })
	readonly id!: string;

	@ApiProperty()
	readonly name!: string;

	@ApiProperty()
	readonly slug!: string;

	@ApiProperty({ format: "date-time" })
	readonly createdAt!: string;
}

/** List success envelope — shared shape for all paginated collections. */
export class TenantListResponseDto extends BaseDto {
	@ApiProperty({ type: [TenantDto] })
	readonly list!: TenantDto[];

	@ApiProperty({ type: PageInfoDto })
	readonly pageInfo!: PageInfoDto;
}
