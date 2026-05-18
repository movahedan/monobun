import { HttpException } from "@nestjs/common";

import type { ApiError } from "../api/api-error.model";

export class ApiException extends HttpException {
	constructor(statusCode: number, body: ApiError) {
		super(body, statusCode);
	}
}
