export enum KEYWORDS {
	TABLE = 'table',
	URL = 'url',
	DATA_KEY = 'data_key'
}

export enum MESSAGE_HEADER {
	STARTED = 'Started',
	UNEXPECTED = 'Unexpected'
}

export enum MESSAGE_CONTENT {
	STARTED = 'The database server was started on: {url}',
	NONEXISTENT_TABLE = 'The table “{table}” does not exist',
	INVALID_AUTH = 'The authorization code is not correct',
	INVALID_METHOD = 'The API only accepts the following methods: “GET”, “POST” and “DELETE”',
	NO_BODY = 'In the “POST” requests you must give a value to set, the key to write is put by query as “?key=”, and the value is given by the “body” as: "{ "{data_key}" : "YOUR-VALUE" }"',
	SAFE_MODE = 'The database is in safe mode, this means that you cannot overwrite or delete an entire table',
	INVALID_BODY = 'If you are going to overwrite an entire database you must give a JSON',
	TABLE_UNGIVED = 'You must give a table'
}

export const AUTH_HEADER = 'wdb-api-key';
export const DATA_KEY = 'value';
