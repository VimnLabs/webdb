import type { Response as ESSC_RESPONSE } from 'express-serve-static-core';
import type { JSONValues } from './types';

export enum HTTP_METHOD {
	GET = 'GET',
	POST = 'POST',
	DELETE = 'DELETE'
}

export enum HTTP_STATUS_CODE {
	OK = 200,
	CREATED = 201,
	BAD_REQUEST = 400,
	UNAUTHORIZED = 401,
	NOT_FOUND = 404,
	WRONG_METHOD = 405
}

export interface BaseResponseOptions<STATUS extends HTTP_STATUS_CODE> {
	// biome-ignore lint/suspicious/noExplicitAny:
	res: ESSC_RESPONSE<any, Record<string, any>, number>;
	table: string;
	status: STATUS;
}

export interface BaseResponse<STATUS extends HTTP_STATUS_CODE> {
	table: string | null;
	status: STATUS;
	kind: HTTP_METHOD | 'ERROR';
}

export interface ErrorResponse {
	metadata: BaseResponse<
		| HTTP_STATUS_CODE.BAD_REQUEST
		| HTTP_STATUS_CODE.UNAUTHORIZED
		| HTTP_STATUS_CODE.NOT_FOUND
		| HTTP_STATUS_CODE.WRONG_METHOD
	>;
	message: string;
}

export interface SuccessResponseOptions
	extends BaseResponseOptions<HTTP_STATUS_CODE.OK | HTTP_STATUS_CODE.CREATED> {
	data: JSONValues;
	key: string | null;
}

export interface ErrorResponseOptions
	extends BaseResponseOptions<
		| HTTP_STATUS_CODE.BAD_REQUEST
		| HTTP_STATUS_CODE.UNAUTHORIZED
		| HTTP_STATUS_CODE.NOT_FOUND
		| HTTP_STATUS_CODE.WRONG_METHOD
	> {
	message: string;
}

export interface SuccessResponse {
	data: JSONValues;
	metadata: BaseResponse<HTTP_STATUS_CODE.OK | HTTP_STATUS_CODE.CREATED> & {
		key: string | null;
	};
}

export const Response = {
	Success: ({ res, table, data, key, status }: SuccessResponseOptions) =>
		res.status(status).json({
			metadata: { table, key, status, kind: res.req.method },
			data
		} as SuccessResponse),
	Error: ({ res, table, message, status }: ErrorResponseOptions) =>
		res.status(status).json({
			metadata: { table, status, kind: 'ERROR' },
			message
		} as ErrorResponse)
} as const;
