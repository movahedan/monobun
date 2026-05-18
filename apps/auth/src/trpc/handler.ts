import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { createContext } from "./context";
import { appRouter } from "./router";

export async function handleTrpcRequest(req: Request): Promise<Response> {
	return fetchRequestHandler({
		endpoint: "/api",
		req,
		router: appRouter,
		createContext: () => createContext(req),
	});
}
