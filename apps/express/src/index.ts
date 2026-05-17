import { log } from "@repo/utils/logger";
import { createServer } from "./server";

const host = process.env.HOST || "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const server = createServer();
server.listen(port, host, () => {
	log(`api running on ${host}`);
	console.log(`api running on ${port}`);
});
