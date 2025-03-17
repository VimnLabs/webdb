import { DatabaseClient, DatabaseServer } from 'dist/index.mjs';

(async () => {
	const AUTH = 'MY_AUTH_CODE';
	const HOST = '0.0.0.0';
	const PORT = 3000;

	const Server = new DatabaseServer({
		auth: AUTH,
		host: HOST,
		port: PORT,
		tables: ['main'],
		safe: false,
		path: './db'
	});

	await Server.begin();

	const Client = new DatabaseClient({
		auth: AUTH,
		host: `http://${HOST}`,
		port: PORT
	});

	console.log(await Client.get({ table: 'main' }));
})();
