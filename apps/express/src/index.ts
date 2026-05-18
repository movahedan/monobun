import { log } from "@packages/utils/logger";

import { createServer } from "./server";

const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.EXPRESS_PORT ?? process.env.PORT ?? 3003);

const server = createServer();
server.listen(port, host, () => {
	log(`api running on ${host}`);
	console.log(`api running on ${port}`);
});
