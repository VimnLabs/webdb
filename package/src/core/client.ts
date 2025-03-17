import {
	type ErrorResponse,
	HTTP_METHOD,
	type SuccessResponse
} from '../response';
import type { ClientConfig, JSONValues } from '../types';
import { ClientFetch } from './shared.functions';

export interface SimpleOptions {
	/**
	 * The table to get data from
	 */
	table: string;
	/**
	 * The key to get data from
	 */
	key?: string;
}

export interface OptionsWithValue extends SimpleOptions {
	/**
	 * The value to set
	 */
	value: JSONValues;
}

export interface DatabaseGet {
	/** Get data from the database */
	({ table, key }: SimpleOptions): Promise<JSONValues | undefined>;
	/**
	 * Get raw data from the database
	 * @param table The table to get data from
	 * @param key The key to get data from
	 */
	raw({ table, key }: SimpleOptions): Promise<SuccessResponse | ErrorResponse>;
}

export interface DatabaseDelete {
	/** Delete data and get the new data from the database */
	({ table, key }: SimpleOptions): Promise<JSONValues | undefined>;
	/** Delete data and get the new raw data from the database */
	raw({ table, key }: SimpleOptions): Promise<SuccessResponse | ErrorResponse>;
}

export interface DatabaseSet {
	/** Set data and get the new data from the database */
	({ table, key, value }: OptionsWithValue): Promise<JSONValues | undefined>;
	/** Set data and get the new raw data from the database */
	raw({
		table,
		key,
		value
	}: OptionsWithValue): Promise<SuccessResponse | ErrorResponse>;
}

export class DatabaseClient {
	/**
	 * The URL of the database server
	 */
	public url: string;
	/**
	 * The authorization token
	 */
	public auth: string;
	/**
	 * The cache of the database
	 */
	public cache: Map<string, JSONValues> = new Map();
	/**
	 * Get data from the database
	 */
	public get: DatabaseGet;
	/**
	 * Delete data from the database
	 */
	public delete: DatabaseDelete;
	/**
	 * Set data in the database
	 */
	public set: DatabaseSet;
	constructor(public config: ClientConfig) {
		this.url = `${config.host}:${config.port}/`;
		this.auth = config.auth;
		this.get = this.Get.bind(this) as unknown as DatabaseGet;
		this.get.raw = this.GetRaw.bind(this);
		this.delete = this.Delete.bind(this) as unknown as DatabaseGet;
		this.delete.raw = this.DeleteRaw.bind(this);
		this.set = this.Set.bind(this) as unknown as DatabaseSet;
		this.set.raw = this.SetRaw.bind(this);
	}

	private async Get({ table, key }: SimpleOptions) {
		return await this.GetRaw({ table, key }).then(
			(data) => (data as SuccessResponse).data ?? undefined
		);
	}
	private async GetRaw({ table, key }: SimpleOptions) {
		return await ClientFetch({
			table: table,
			url: this.url,
			auth: this.auth,
			method: HTTP_METHOD.GET,
			key
		});
	}
	private async Delete({ table, key }: SimpleOptions) {
		return await this.DeleteRaw({ table, key }).then(
			(data) => (data as SuccessResponse).data ?? undefined
		);
	}
	private async DeleteRaw({ table, key }: SimpleOptions) {
		return await ClientFetch({
			table: table,
			url: this.url,
			auth: this.auth,
			method: HTTP_METHOD.DELETE,
			key
		});
	}
	private async Set({ table, key, value }: OptionsWithValue) {
		return await this.SetRaw({ table, key, value }).then(
			(data) => (data as SuccessResponse).data ?? undefined
		);
	}
	private async SetRaw({ table, key, value }: OptionsWithValue) {
		return await ClientFetch({
			table: table,
			url: this.url,
			auth: this.auth,
			method: HTTP_METHOD.POST,
			key,
			value
		});
	}
}
