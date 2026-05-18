import type { ArgumentMetadata, PipeTransform } from "@nestjs/common";
import type { z } from "zod";

import { ApiException } from "../exceptions/api.exception";

export class ZodValidationPipe implements PipeTransform {
	constructor(private readonly schema: z.ZodType) {}

	transform(value: unknown, _metadata: ArgumentMetadata): unknown {
		const result = this.schema.safeParse(value);
		if (result.success) return result.data;

		throw new ApiException(400, {
			message: "Validation failed",
			fields: result.error.issues.map((issue) => ({
				field: issue.path.length > 0 ? issue.path.join(".") : "body",
				message: issue.message,
			})),
		});
	}
}
