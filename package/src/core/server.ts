import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import App, { type Express } from 'express';
import {
	AUTH_HEADER,
	KEYWORDS,
	MESSAGE_CONTENT,
	MESSAGE_HEADER
} from '../constants';
import { HTTP_METHOD, HTTP_STATUS_CODE, Response } from '../response';
import type { ServerConfig } from '../types.ts';
import { ANSICodes, FillString, LogWebDB, Write, stylize } from '../utils';
import { ServerDelete, ServerGet, ServerPost } from './shared.functions';

const MainHTML = `<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebDB</title>
  <style>
    body,
    html {
      margin: 0;
      background-color: #000;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-family: 'Roboto', sans-serif;
		}
    main h1 {
      margin-bottom: 20px;
      align-self: center;
    }
    .card {
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      width: 275px;
      text-align: center;
      color: #fff;
      border: 1px solid #fff;
      margin-top: 10px;
      display: block;
      text-decoration: none;
      opacity: 0.5;
      transition: 0.5s;
      & span {
        font-size: 20px;
        font-weight: bold;
      }
    }
    .card:hover {
      opacity: 1;
    }
    #card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <main>
    <h1>Welcome to WebDB!</h1>
    <section>
      <p>WebDB is a simple web database that allows you to manage a database of any you want, like users! You can add,
        edit, and delete
        users.</p>
    </section>
    <section id="card-grid">
      <a href="https://vimnlabs.github.io/webdb/" class="card"><span>Documentation</span></a><a
        href="https://github.com/VimnLabs/webdb" class="card"><span>Github</span></a><a
        href="https://discord.gg/NUUW9ZMcKT" class="card"><span>Discord</span></a>
    </section>
  </main>
</body>
</html>`;

/** Database Server */
export class DatabaseServer<T extends string[]> {
	/** Express server */
	public server: Express;

	constructor(public config: ServerConfig<T>) {
		this.server = App();
		this.server.use(App.json());
	}

	/** Starts the database */
	public begin(): Promise<void> {
		return new Promise((res, rej) => {
			try {
				const ROOT = join(process.cwd(), this.config.path);
				if (!existsSync(ROOT)) mkdirSync(ROOT, { recursive: true });
				for (const TABLE of this.config.tables) {
					const TABLE_PATH = join(ROOT, `${TABLE}.json`);
					if (!existsSync(TABLE_PATH))
						Write({
							path: TABLE_PATH,
							json: {}
						});
				}

				this.server.all('/', (_req, res) => {
					res.send(MainHTML);
				});

				this.server.all('/table/:table', (req, res) => {
					const table = req.params.table;

					if (this.config.auth === req.headers[AUTH_HEADER]) {
						switch (req.method as HTTP_METHOD) {
							case HTTP_METHOD.GET:
								ServerGet(this.config, table, req, res);
								break;
							case HTTP_METHOD.DELETE:
								ServerDelete(this.config, table, req, res);
								break;
							case HTTP_METHOD.POST:
								ServerPost(this.config, table, req, res);
								break;
							default:
								Response.Error({
									res,
									table,
									message: MESSAGE_CONTENT.INVALID_METHOD,
									status: HTTP_STATUS_CODE.WRONG_METHOD
								});
						}
					} else
						Response.Error({
							res,
							table,
							message: MESSAGE_CONTENT.INVALID_AUTH,
							status: HTTP_STATUS_CODE.UNAUTHORIZED
						});
				});

				this.server.use((_req, res, _next) => {
					res.status(404).send(MainHTML);
				});

				this.server.listen(this.config.port);
				LogWebDB.trace(
					MESSAGE_HEADER.STARTED,
					FillString({
						text: MESSAGE_CONTENT.STARTED,
						keywords: {
							[KEYWORDS.URL]: stylize(
								`${this.config.host}:${this.config.port}`,
								ANSICodes.Underline,
								ANSICodes.BrightCyan
							)
						}
					})
				);
				res();
			} catch (err) {
				LogWebDB.panic(MESSAGE_HEADER.UNEXPECTED, String(err));
				rej(err);
			}
		});
	}
}
