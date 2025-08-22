import { existsSync, statSync } from "node:fs";
import { colorify } from "./colorify";
import type {
	ArgOption,
	HookContext,
	HookSystem,
	InferArgs,
	ProgressBar,
	ProgressTracker,
	ScriptConfig,
	ScriptHandler,
	ScriptInstance,
	Spinner,
} from "./types";

const validators = {
	nonEmpty: (value: string): boolean | string => {
		if (value.trim().length === 0) {
			return "Value cannot be empty";
		}
		return true;
	},
	boolean: (value: string): boolean | string => {
		const lowerValue = value.toLowerCase();
		if (lowerValue === "true" || lowerValue === "1" || lowerValue === "yes") {
			return true;
		}
		if (lowerValue === "false" || lowerValue === "0" || lowerValue === "no") {
			return true;
		}
		return "Value must be a boolean (true/false, 1/0, yes/no)";
	},
	number: (value: string): boolean | string => {
		const num = Number(value);
		if (Number.isNaN(num) || !Number.isFinite(num)) {
			return "Value must be a valid number";
		}
		return true;
	},
	integer: (value: string): boolean | string => {
		const num = Number(value);
		if (Number.isNaN(num) || !Number.isFinite(num) || !Number.isInteger(num)) {
			return "Value must be an integer";
		}
		return true;
	},
	fileExists: (filePath: string): boolean | string => {
		try {
			const file = Bun.file(filePath);
			if (!file.size) {
				return `File "${filePath}" not found.`;
			}
			return true;
		} catch {
			return `File "${filePath}" not found.`;
		}
	},
	directoryExists: (path: string): boolean | string => {
		try {
			const exists = existsSync(path) && statSync(path).isDirectory();
			if (!exists) {
				return `Directory does not exist: ${path}`;
			}
			return true;
		} catch (error) {
			return `Error checking directory: ${error instanceof Error ? error.message : String(error)}`;
		}
	},
	enum:
		(allowedValues: string[]) =>
		(value: string): boolean | string => {
			if (!allowedValues.includes(value)) {
				return `Invalid value "${value}". Valid values: ${allowedValues.join(", ")}`;
			}
			return true;
		},
	regex:
		(pattern: RegExp, message?: string) =>
		(value: string): boolean | string => {
			if (!pattern.test(value)) {
				return message || `Value must match pattern: ${pattern}`;
			}
			return true;
		},
	custom:
		<T>(validator: (value: string) => T | string) =>
		(value: string): boolean | string => {
			try {
				const result = validator(value);
				if (typeof result === "string") {
					return result;
				}
				return true;
			} catch (error) {
				return error instanceof Error ? error.message : String(error);
			}
		},
	url: (value: string): boolean | string => {
		try {
			new URL(value);
			return true;
		} catch {
			return "Value must be a valid URL";
		}
	},
	email: (value: string): boolean | string => {
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		if (!emailRegex.test(value)) {
			return "Value must be a valid email address";
		}
		return true;
	},
	semver: (value: string): boolean | string => {
		const semverRegex =
			/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
		if (!semverRegex.test(value)) {
			return "Value must be a valid semantic version (e.g., 1.0.0)";
		}
		return true;
	},
} as const;

const defaultConfig = {
	name: "Script",
	description: "A CLI script",
	options: [
		{
			short: "-v",
			long: "--verbose",
			description: "Enable verbose logging",
			required: false,
			type: "boolean" as const,
			defaultValue: true,
			validator: validators.boolean,
		},
		{
			short: "-q",
			long: "--quiet",
			description: "Suppress output",
			required: false,
			type: "boolean" as const,
			defaultValue: false,
			validator: validators.boolean,
		},
		{
			short: "",
			long: "--dry-run",
			description: "Show what would happen without executing",
			required: false,
			type: "boolean" as const,
			defaultValue: false,
			validator: validators.boolean,
		},
		{
			short: "-h",
			long: "--help",
			description: "Show help information",
			required: false,
			type: "boolean" as const,
			defaultValue: false,
			validator: validators.boolean,
		},
	],
} as const satisfies ScriptConfig;

class SimpleProgressTracker implements ProgressTracker {
	current = 0;
	total: number;
	message?: string;

	constructor(total: number, message?: string) {
		this.total = total;
		this.message = message;
	}

	update(current: number, message?: string): void {
		this.current = current;
		if (message) this.message = message;
		this.render();
	}

	complete(): void {
		this.current = this.total;
		this.render();
		console.log();
	}

	render(): void {
		const percent = Math.round((this.current / this.total) * 100);
		const barLength = 30;
		const filled = Math.round((this.current / this.total) * barLength);
		const bar = "█".repeat(filled) + "░".repeat(barLength - filled);

		process.stdout.write(
			`\r${colorify.cyan("Progress:")} [${bar}] ${percent}% ${this.message || ""}`,
		);
	}
}

class SimpleSpinner implements Spinner {
	private interval?: NodeJS.Timeout;
	private frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
	private frameIndex = 0;
	text: string;

	constructor(text: string) {
		this.text = text;
	}

	start(): void {
		this.interval = setInterval(() => {
			process.stdout.write(`\r${this.frames[this.frameIndex]} ${this.text}`);
			this.frameIndex = (this.frameIndex + 1) % this.frames.length;
		}, 100);
	}

	stop(): void {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = undefined;
		}
		process.stdout.write(`\r${" ".repeat(this.text.length + 2)}\r`);
	}

	succeed(text?: string): void {
		this.stop();
		console.log(colorify.green("✓"), text || this.text);
	}

	fail(text?: string): void {
		this.stop();
		console.log(colorify.red("✗"), text || this.text);
	}

	warn(text?: string): void {
		this.stop();
		console.log(colorify.yellow("⚠"), text || this.text);
	}

	info(text?: string): void {
		this.stop();
		console.log(colorify.blue("ℹ"), text || this.text);
	}
}

class WrapShell<TConfig extends ScriptConfig> {
	private config: TConfig;
	private hooks: Partial<HookSystem<TConfig>> = {};

	constructor(config: TConfig) {
		this.config = config;
	}

	static createScript<TConfig extends ScriptConfig>(
		config: TConfig,
		handler: ScriptHandler<TConfig>,
	): ScriptInstance<TConfig> {
		const wrapShell = new WrapShell(config);

		return {
			config,
			handler,
			run: async (passedArgs?: InferArgs<TConfig>) => {
				const context: HookContext<TConfig> = {
					startTime: Date.now(),
					args:
						passedArgs ||
						(await wrapShell.parseArgs().catch((e) => {
							wrapShell.showHelp();
							console.error(e);
							process.exit(1);
						})),
					script: { config, handler, run: async () => {} },
				};

				try {
					if (wrapShell.hooks.beforeRun) {
						for (const hook of wrapShell.hooks.beforeRun) {
							await hook(context);
						}
					}

					const enhancedConsole = wrapShell.createEnhancedConsole(context.args);
					const result = await handler(context.args, enhancedConsole);

					if (wrapShell.hooks.afterRun) {
						for (const hook of wrapShell.hooks.afterRun) {
							await hook(context);
						}
					}

					return result;
				} catch (error) {
					if (wrapShell.hooks.onError) {
						for (const hook of wrapShell.hooks.onError) {
							await hook({ ...context, error: error as Error });
						}
					}
					throw error;
				}
			},
		};
	}

	private async parseArgs(): Promise<InferArgs<TConfig>> {
		const args = process.argv.slice(2);
		const result: Record<string, unknown> = {};
		const allOptions = [...defaultConfig.options, ...this.config.options];

		allOptions.forEach((option) => {
			const key = option.long.replace("--", "");
			if (
				option.required === false &&
				"defaultValue" in option &&
				option.defaultValue !== undefined
			) {
				result[key] = option.defaultValue;
			}
		});

		for (let i = 0; i < args.length; i++) {
			const arg = args[i];
			const nextArg = args[i + 1];

			if (arg === "-h" || arg === "--help") {
				this.showHelp();
				process.exit(0);
			}

			const option = allOptions.find((opt) => opt.short === arg || opt.long === arg);
			if (option) {
				const key = option.long.replace("--", "");

				if (option.type === "boolean") {
					result[key] = true;
				} else if (nextArg && !nextArg.startsWith("-")) {
					result[key] = nextArg;
					i++;
				}
			}
		}

		await this.validateParsedArgs(result, allOptions);

		return result as InferArgs<TConfig>;
	}

	private async validateParsedArgs(
		args: Record<string, unknown>,
		options: readonly ArgOption[],
	): Promise<void> {
		for (const option of options) {
			const key = option.long.replace("--", "");
			const value = args[key];

			if (option.required && (value === undefined || value === null || value === "")) {
				throw new Error(`Required option ${option.long} is missing`);
			}

			if (value !== undefined && option.validator) {
				let validation: boolean | string | Promise<boolean | string>;

				if (option.type === "string[]" || option.type === "number[]") {
					// For array types, pass the array directly
					if (Array.isArray(value)) {
						validation = await (
							option.validator as (value: string[]) => boolean | string | Promise<boolean | string>
						)(value);
					} else {
						throw new Error(`Expected array for ${option.long}, got ${typeof value}`);
					}
				} else {
					// For single value types, convert to string
					validation = await (
						option.validator as (value: string) => boolean | string | Promise<boolean | string>
					)(String(value));
				}

				if (typeof validation === "string") {
					throw new Error(`Invalid value for ${option.long}: ${validation}`);
				}
			}
		}
	}

	private createEnhancedConsole(args: InferArgs<TConfig>): Console {
		const originalConsole = console;

		return Object.assign({}, originalConsole, {
			log: (...props: Parameters<typeof console.log>) => {
				if (!("quiet" in args) || !args.quiet) {
					originalConsole.log(...props);
				}
			},
			info: (...props: Parameters<typeof console.info>) => {
				if (!("quiet" in args) || !args.quiet) {
					originalConsole.warn(...props);
				}
			},
			warn: (...props: Parameters<typeof console.warn>) => {
				if (!("quiet" in args) || !args.quiet) {
					originalConsole.warn(...props);
				}
			},
			error: (...props: Parameters<typeof console.error>) => {
				originalConsole.error(...props);
			},
		});
	}

	private showHelp(): void {
		console.log(colorify.blue(this.config.name));
		console.log(this.config.description);
		console.log();

		if (this.config.usage) {
			console.log("Usage:");
			console.log(`  ${this.config.usage}`);
			console.log();
		}

		const allOptions = [...defaultConfig.options, ...this.config.options];
		if (allOptions.length > 0) {
			console.log("Options:");
			allOptions.forEach((option) => {
				const shortFlag = option.short ? `${option.short}, ` : "    ";
				const required = option.required ? colorify.red(" (required)") : "";
				console.log(`  ${shortFlag}${option.long}${required}`);
				console.log(`      ${option.description}`);
			});
			console.log();
		}

		if (this.config.examples && this.config.examples.length > 0) {
			console.log("Examples:");
			this.config.examples.forEach((example) => {
				console.log(`  ${colorify.gray(example)}`);
			});
		}
	}

	static progress = {
		create: (total: number, message?: string): ProgressTracker =>
			new SimpleProgressTracker(total, message),

		spinner: (message: string): Spinner => new SimpleSpinner(message),

		bar: (total: number, message?: string): ProgressBar =>
			new SimpleProgressTracker(total, message),
	};

	static hooks = {
		beforeRun: <TConfig extends ScriptConfig>(
			hook: (context: HookContext<TConfig>) => Promise<void> | void,
		) => hook,
		afterRun: <TConfig extends ScriptConfig>(
			hook: (context: HookContext<TConfig>) => Promise<void> | void,
		) => hook,
		onError: <TConfig extends ScriptConfig>(
			hook: (context: HookContext<TConfig> & { error: Error }) => Promise<void> | void,
		) => hook,
		onValidation: <TConfig extends ScriptConfig>(
			hook: (context: HookContext<TConfig>) => Promise<void> | void,
		) => hook,
	};

	static validators = validators;
}

export function createScript<TConfig extends ScriptConfig>(
	config: TConfig,
	handler: ScriptHandler<TConfig>,
): ScriptInstance<TConfig> {
	return WrapShell.createScript(config, handler);
}
createScript.validators = validators;
