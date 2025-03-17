//.,,,,,...........,,,,,..,,,,,....,,,,,.............,,,,....,,,,,.........,,,,,..//
//.,S@@@+.........,S@@@?..+@@@@:...*@@@#:...........?@@@*....+@@@#+........;%%%*..//
//..;@@@@:........%@@@#,..+@@@@;...*@@@@S,.........+@@@%.....+@@@@@?,......+%%%?..//
//...*@@@S,......+@@@@;...+@@@@:...*@@@@@S,.......;@@@S,.....+@@@@@@S:.....+%%%?..//
//...,S@@@*.....:@@@@?....+@@@@:...*@@@@@@%,.....:@@@#,......+@@@@@@@#;....+%%%?..//
//....:@@@@;...,S@@@#,....+@@@@:...*@@@#@@@?....,#@@@:..+,...+@@@%;#@@@*...+S%%?..//
//.....*@@@#,..*@@@@:.....+@@@@:...*@@@?+@@@?..,S@@@;..+#,...+@@@%.:S@@@%,.,*%%?..//
//......%@@@?..;@@@*......+@@@@:...*@@@?.?@@@*.?@@@*..;@#,...+@@@%..,?@@@S:..;%?..//
//......,#@@@+..*@S.......+@@@@:...*@@@?..?@@@%@@@?..:#@#,...+@@@%....+@@@@+..:*..//
//.......+@@@#,.,%:.......+@@@@:...*@@@?...%@@@@@%,.,S@@#,...+@@@%.....;#@@@*..,..//
//........?@@@%...........+@@@@;...*@@@?...,%###S,..,@@@#,...+@@@%......,%@@@%,...//
//........,S###+..........+####:...*@@@?............,###S,...+###?........*@@@S:..//
//.........,,,,,..........,,,,,....,,,,,.............,,,,....,,,,,.........,,,,,..//

import type {
	Request as ESSC_Request,
	Response as ESSC_Response
} from 'express-serve-static-core';
import type { ParsedQs } from 'qs';

export type JSONValues =
	| string
	| number
	| boolean
	| null
	| JSONValues[]
	| JSObjectN;
export type JSObjectN = { [k: string]: JSONValues };

export interface ServerConfig<T extends string[]> {
	/** Authentication key for requests. I recommend using secure keys, e.g. UUID */
	auth: string;
	/** Host to use */
	host: string;
	/** Port to use */
	port: number;
	/** Database tables */
	tables: T;
	/** Disables actions that could be risky. Ex: Delete an entire table or delete several tables. */
	safe: boolean;
	/** Path to save all data */
	path: string;
}

export interface ClientConfig {
	/** The URL of the database server */
	host: string;
	/** The port of the database server */
	port: number;
	/** The authorization token */
	auth: string;
}

export type ExpressReq = ESSC_Request<
	Record<string, string>,
	// biome-ignore lint/suspicious/noExplicitAny:
	any,
	// biome-ignore lint/suspicious/noExplicitAny:
	any,
	ParsedQs,
	// biome-ignore lint/suspicious/noExplicitAny:
	Record<string, any>
>;

// biome-ignore lint/suspicious/noExplicitAny:
export type ExpressRes = ESSC_Response<any, Record<string, any>, number>;
