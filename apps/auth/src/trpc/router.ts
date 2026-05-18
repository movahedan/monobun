import { authRouter } from "./auth/router";
import { router } from "./init";

export const appRouter = router({
	auth: authRouter,
});

export type AppRouter = typeof appRouter;
