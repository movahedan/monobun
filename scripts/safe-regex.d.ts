declare module "safe-regex" {
	function safeRegex(re: RegExp | string, opts?: { limit?: number }): boolean;
	export default safeRegex;
}
