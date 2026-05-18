import { applyDecorators } from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiNotFoundResponse,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";

import { ApiErrorDto } from "./api-error.model";

/** Standard error responses referencing shared `ApiError` schema. */
export function ApiStandardErrors(): MethodDecorator {
	return applyDecorators(
		ApiBadRequestResponse({ description: "Invalid request", type: ApiErrorDto }),
		ApiUnauthorizedResponse({ description: "Missing or invalid credentials", type: ApiErrorDto }),
		ApiNotFoundResponse({ description: "Resource not found", type: ApiErrorDto }),
	);
}
