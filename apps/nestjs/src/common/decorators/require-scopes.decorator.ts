import { SetMetadata } from "@nestjs/common";

import type { Scope } from "@packages/auth-contract";

export const REQUIRED_SCOPES_KEY = "requiredScopes";

export const RequireScopes = (...scopes: Scope[]) => SetMetadata(REQUIRED_SCOPES_KEY, scopes);
