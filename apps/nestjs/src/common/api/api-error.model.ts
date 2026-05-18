import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { z } from "zod";

import { BaseDto } from "../models/dto.model";

export const FieldErrorSchema = z.object({
	field: z.string(),
	message: z.string(),
});

export type FieldError = z.infer<typeof FieldErrorSchema>;

export class FieldErrorDto extends BaseDto {
	@ApiProperty({ example: "key" })
	readonly field!: string;

	@ApiProperty({ example: "Key is required" })
	readonly message!: string;
}

export const ApiErrorSchema = z.object({
	message: z.string().optional(),
	fields: z.array(FieldErrorSchema).optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

export class ApiErrorDto extends BaseDto {
	@ApiPropertyOptional({ example: "Validation failed" })
	readonly message?: string;

	@ApiPropertyOptional({ type: [FieldErrorDto] })
	readonly fields?: FieldErrorDto[];
}

export function isApiError(value: unknown): value is ApiError {
	if (typeof value !== "object" || value === null) return false;
	if ("success" in value) return false;
	return "message" in value || "fields" in value;
}
