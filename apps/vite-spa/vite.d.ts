/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_NESTJS_API_URL?: string;
	readonly VITE_AUTH_PROXY_TARGET?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
