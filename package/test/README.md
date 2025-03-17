# Server Side
To use it, in the side of the server you must put this in your main file:
```ts
import { DatabaseServer } from "@vimn/webdb"

new DatabaseServer({
  auth: process.env['AUTH'],
  host: '0.0.0.0',
  port: 80,
  tables: ["main", "users", "guilds"],
  safe: true,
  path: './db'
}).begin();
```
Host must be the local IP of your network, in case you use a host that provides you with a url, you must set as host 0.0.0.0.0, and if you want to use a local machine you must use port forwarding.

# Client Side
```ts
import { DatabaseClient } from "@vimn/webdb"

const Client = new DatabaseClient({
  auth: process.env['AUTH'],
  host: 'http://0.0.0.0', // Here you must include the protocol
  port: 80
});

console.log(await Client.get({ table: 'main' }));
```