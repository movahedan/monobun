import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

import { BaseDto } from "../models/dto.model";

export const PageInfoSchema = z.object({
	currentPage: z.number().int().min(1),
	totalPages: z.number().int().min(0),
	totalItems: z.number().int().min(0),
	pageSize: z.number().int().min(1),
});

export type PageInfo = z.infer<typeof PageInfoSchema>;

export class PageInfoDto extends BaseDto {
	@ApiProperty({ example: 1, minimum: 1 })
	readonly currentPage!: number;

	@ApiProperty({ example: 3, minimum: 0 })
	readonly totalPages!: number;

	@ApiProperty({ example: 25, minimum: 0 })
	readonly totalItems!: number;

	@ApiProperty({ example: 10, minimum: 1 })
	readonly pageSize!: number;
}

export function buildPageInfo(page: number, pageSize: number, totalItems: number): PageInfo {
	const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
	return {
		currentPage: page,
		totalPages,
		totalItems,
		pageSize,
	};
}
