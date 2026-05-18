import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
	HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";

import { log } from "@packages/utils/logger";

import type { ApiError } from "../api/api-error.model";
import { isApiError } from "../api/api-error.model";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const { status, body } = this.toApiError(exception, request.url);

		log(`HTTP ${status} ${request.method} ${request.url}`);

		response.status(status).json(body);
	}

	private toApiError(exception: unknown, path: string): { status: number; body: ApiError } {
		if (exception instanceof HttpException) {
			const status = exception.getStatus();
			const payload = exception.getResponse();

			if (isApiError(payload)) {
				return { status, body: payload };
			}

			if (typeof payload === "object" && payload !== null && "message" in payload) {
				const message = payload.message;
				if (Array.isArray(message)) {
					return {
						status,
						body: {
							message: "Validation failed",
							fields: message.map((entry, index) => ({
								field: String(index),
								message: String(entry),
							})),
						},
					};
				}
				return { status, body: { message: String(message) } };
			}

			if (typeof payload === "string") {
				return { status, body: { message: payload } };
			}
		}

		if (exception instanceof Error) {
			log(`Unhandled error on ${path}: ${exception.message}`);
		}

		return {
			status: HttpStatus.INTERNAL_SERVER_ERROR,
			body: { message: "Internal server error" },
		};
	}
}
