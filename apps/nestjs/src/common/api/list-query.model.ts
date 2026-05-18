import { ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";

import { BaseDto } from "../models/dto.model";
import { buildPageInfo, type PageInfo } from "./page-info.model";

export const ListQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
	search: z.string().optional(),
});

export type ListQuery = z.infer<typeof ListQuerySchema>;

export class ListQueryDto extends BaseDto {
	@ApiPropertyOptional({ default: 1, minimum: 1 })
	readonly page?: number;

	@ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
	readonly limit?: number;

	@ApiPropertyOptional()
	readonly search?: string;
}

export type ListSuccess<TItem> = {
	readonly list: readonly TItem[];
	readonly pageInfo: PageInfo;
};

export function paginateList<TItem>(items: readonly TItem[], query: ListQuery): ListSuccess<TItem> {
	const { page, limit } = query;
	const totalItems = items.length;
	const offset = (page - 1) * limit;
	const list = items.slice(offset, offset + limit);
	return {
		list,
		pageInfo: buildPageInfo(page, limit, totalItems),
	};
}
