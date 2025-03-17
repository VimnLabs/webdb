import { join } from 'node:path';
import { deleteProperty, getProperty, setProperty } from 'dot-prop';
import type { ParsedQs } from 'qs';
import { AUTH_HEADER, DATA_KEY, KEYWORDS, MESSAGE_CONTENT } from '../constants';
import {
	type ErrorResponse,
	type HTTP_METHOD,
	HTTP_STATUS_CODE,
	Response,
	type SuccessResponse
} from '../response';
import type {
	ExpressReq,
	ExpressRes,
	JSONValues,
	JSObjectN,
	ServerConfig
} from '../types';
import { FillString, Read, Write } from '../utils';

// --- Server Oriented Functions ---

function ReadData(
	config: ServerConfig<string[]>,
	table: string
): [JSObjectN | null, string] {
	const path = join(process.cwd(), config.path, `${table}.json`);
	return [Read({ path }), path];
}

const NoData = (res: ExpressRes, table: string) =>
	Response.Error({
		res,
		table,
		message: FillString({
			text: MESSAGE_CONTENT.NONEXISTENT_TABLE,
			keywords: {
				[KEYWORDS.TABLE]: table
			}
		}),
		status: HTTP_STATUS_CODE.NOT_FOUND
	});

export function ServerGet<T extends string[]>(
	config: ServerConfig<T>,
	table: string,
	req: ExpressReq,
	res: ExpressRes
) {
	const [DATA, _] = ReadData(config, table);

	if (!DATA) return NoData(res, table);

	const { key } = req.query;

	if (key)
		return Response.Success({
			res,
			table,
			data: getProperty(DATA, key as string) ?? null,
			key: key as string,
			status: HTTP_STATUS_CODE.OK
		});
	return Response.Success({
		res,
		table,
		data: DATA,
		key: null,
		status: HTTP_STATUS_CODE.OK
	});
}

export function ServerPost<T extends string[]>(
	config: ServerConfig<T>,
	table: string,
	req: ExpressReq,
	res: ExpressRes
) {
	// Reads a table
	const [DATA, DATA_PATH] = ReadData(config, table);

	// Checks if exists
	if (!DATA) return NoData(res, table);

	// Get the key to write
	const { key } = req.query as ParsedQs & { key: string | null | undefined };
	// Get the new value
	const NEW: JSONValues | null | undefined = req.body[DATA_KEY];

	// Checks if the new value was given
	if (!NEW)
		return Response.Error({
			res,
			table,
			message: FillString({
				text: MESSAGE_CONTENT.NO_BODY,
				keywords: {
					[KEYWORDS.DATA_KEY]: DATA_KEY
				}
			}),
			status: HTTP_STATUS_CODE.BAD_REQUEST
		});

	// If key was given, writes the key with the new value
	if (key) {
		const TO_WRITE = setProperty(DATA, key, NEW);
		Write({ path: DATA_PATH, json: TO_WRITE });
		return Response.Success({
			res,
			table,
			data: TO_WRITE,
			key: key,
			status: HTTP_STATUS_CODE.OK
		});
	}

	// Checks if the database is in safe mode
	if (config.safe)
		return Response.Error({
			res,
			table,
			message: MESSAGE_CONTENT.SAFE_MODE,
			status: HTTP_STATUS_CODE.UNAUTHORIZED
		});

	// This writes a full table

	//Checks if the new value was a JSON or not
	if (typeof NEW !== 'object' || Array.isArray(NEW))
		return Response.Error({
			res,
			table,
			message: MESSAGE_CONTENT.INVALID_BODY,
			status: HTTP_STATUS_CODE.BAD_REQUEST
		});

	Write({ path: DATA_PATH, json: NEW });
	return Response.Success({
		res,
		table,
		data: NEW,
		key: null,
		status: HTTP_STATUS_CODE.OK
	});
}

export function ServerDelete<T extends string[]>(
	config: ServerConfig<T>,
	table: string,
	req: ExpressReq,
	res: ExpressRes
) {
	// Reads a table
	const [DATA, DATA_PATH] = ReadData(config, table);

	// Checks if exists
	if (!DATA) return NoData(res, table);

	// Get the key to delete
	const { key } = req.query as ParsedQs & { key: string | null | undefined };

	// If key was given, deletes the key with the new value
	if (key) {
		deleteProperty(DATA, key);
		Write({ path: DATA_PATH, json: DATA });
		return Response.Success({
			res,
			table,
			data: DATA,
			key: key,
			status: HTTP_STATUS_CODE.OK
		});
	}

	// Checks if the database is in safe mode
	if (config.safe)
		return Response.Error({
			res,
			table,
			message: MESSAGE_CONTENT.SAFE_MODE,
			status: HTTP_STATUS_CODE.UNAUTHORIZED
		});

	// This overwrites a full table

	Write({ path: DATA_PATH, json: {} });
	return Response.Success({
		res,
		table,
		data: {},
		key: null,
		status: HTTP_STATUS_CODE.OK
	});
}

// --- Client Oriented Functions ---

export interface SimpleClientFetchOptions<M extends HTTP_METHOD> {
	table: string;
	key?: string;
	method: M;
	url: string;
	auth: string;
}

export interface PostClientFetchOptions
	extends SimpleClientFetchOptions<HTTP_METHOD.POST> {
	value: JSONValues;
}

/** Makes a request to a database */
export async function ClientFetch(
	options:
		| SimpleClientFetchOptions<HTTP_METHOD.GET | HTTP_METHOD.DELETE>
		| PostClientFetchOptions
): Promise<SuccessResponse | ErrorResponse> {
	// Creates the init request
	const RequestInit: RequestInit = {
		// Sets the headers
		headers: {
			// Sets the authorization header
			[AUTH_HEADER]: options.auth,
			// Sets the content type
			'Content-Type': 'application/json'
		},
		// Sets the method
		method: options.method
	};
	// If it is a post request
	if (DATA_KEY in options)
		// Sets the body
		RequestInit.body = JSON.stringify({
			// Sets the data key
			[DATA_KEY]: options.value
		});

	if (!options.table || typeof options.table !== 'string') {
		return {
			metadata: {
				table: null,
				status: HTTP_STATUS_CODE.NOT_FOUND,
				kind: 'ERROR'
			},
			message: MESSAGE_CONTENT.TABLE_UNGIVED
		} as ErrorResponse;
	}

	// Fetches the data
	return await fetch(
		`${options.url}table/${options.table}${options.key ? `?key=${options.key}` : '/'}`,
		RequestInit
	).then(async (res) => await res.json());
}
