import { authConfig } from "../config";

process.env.AUTH_ISSUER ??= authConfig.issuer;
process.env.AUTH_AUDIENCE ??= authConfig.audience;
process.env.AUTH_AUDIENCE_EVAL ??= authConfig.audienceEval;
process.env.NODE_ENV ??= "test";
