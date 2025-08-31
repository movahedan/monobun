/**
 * Core type definitions for the InterShell CLI framework
 */

// Basic CLI types
export interface KeyPress {
	sequence: string;
	name?: string;
	ctrl: boolean;
	meta: boolean;
	shift: boolean;
}

export interface ValidationResult<T = unknown> {
	isValid: boolean;
	value?: T;
	error?: string;
	warnings?: string[];
}

export interface ValidationError {
	message: string;
	field?: string;
	code?: string;
}

// Event system types
export type EventHandler<T = unknown> = (data: T) => void | Promise<void>;

export interface EventEmitter<TEvents extends Record<string, unknown> = Record<string, unknown>> {
	on<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void;
	off<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void;
	emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void;
}

// State management types
export type StateListener<TState> = (state: TState, prevState: TState) => void;

export interface StateManager<TState> {
	getState(): TState;
	setState(newState: TState): void;
	subscribe(listener: StateListener<TState>): () => void;
}

// Script configuration types
export type ArgOption = {
	short?: string; // pay attention, this turned optional! in affects the logic
	long: string;
	description: string;
	examples?: string[];
} & (
	| {
			required: true;
			type: "string" | "boolean" | "number";
			validator: (value: string) => boolean | string | Promise<boolean | string>;
	  }
	| {
			required: false;
			type: "string" | "boolean" | "number";
			defaultValue?: string | boolean | number;
			validator: (value: string) => boolean | string | Promise<boolean | string>;
	  }
	| {
			required: true;
			type: "string[]" | "number[]"; // there is no multi boolean anymore, we must use type conditionals
			validator: (value: string[]) => boolean | string | Promise<boolean | string>;
	  }
	| {
			required: false;
			type: "string[]" | "number[]";
			defaultValue?: string[] | number[];
			validator: (value: string[]) => boolean | string | Promise<boolean | string>;
	  }
);

export interface ScriptConfig {
	name: string;
	description: string;
	usage?: string;
	examples?: string[];
	options: ArgOption[];
}

export type ScriptHandler<TConfig extends ScriptConfig> = (
	args: InferArgs<TConfig>,
	console: Console,
) => Promise<void> | void;

export interface ScriptInstance<TConfig extends ScriptConfig> {
	config: TConfig;
	handler: ScriptHandler<TConfig>;
	run(args?: Partial<InferArgs<TConfig>>): Promise<void>;
}

// Utility type to infer argument types from config
export type InferArgs<TConfig extends ScriptConfig> = {
	[K in TConfig["options"][number] as K["long"] extends `--${infer Name}`
		? Name
		: never]: K extends { required: true; type: infer T }
		? T extends "string[]" | "number[]"
			? string[] | number[]
			: T extends "string"
				? string
				: T extends "boolean"
					? boolean
					: T extends "number"
						? number
						: never
		: K extends { required: false; type: infer T; defaultValue: infer D }
			? T extends "string[]" | "number[]"
				? (string[] | number[]) | D
				: T extends "string"
					? string | D
					: T extends "boolean"
						? boolean | D
						: T extends "number"
							? number | D
							: never
			: K extends { required: false; type: infer T }
				? T extends "string[]" | "number[]"
					? (string[] | number[]) | undefined
					: T extends "string"
						? string | undefined
						: T extends "boolean"
							? boolean | undefined
							: T extends "number"
								? number | undefined
								: never
				: never;
} & {
	verbose?: boolean;
	quiet?: boolean;
	"dry-run"?: boolean;
	help?: boolean;
	debug?: boolean;
};

// Hook system types
export interface HookContext<TConfig extends ScriptConfig> {
	script: ScriptInstance<TConfig>;
	args: InferArgs<TConfig>;
	startTime: number;
	error?: Error;
}

export type Hook<TConfig extends ScriptConfig, TReturn = void> = (
	context: HookContext<TConfig>,
) => Promise<TReturn> | TReturn;

export interface HookSystem<TConfig extends ScriptConfig> {
	beforeRun: Hook<TConfig>[];
	afterRun: Hook<TConfig, unknown>[];
	onError: Hook<TConfig>[];
	onValidation: Hook<TConfig, ValidationResult>[];
}

// Color system types
export type ColorFunction = (text: string) => string;

export interface ColorSystem {
	// Basic colors
	red: ColorFunction;
	green: ColorFunction;
	blue: ColorFunction;
	yellow: ColorFunction;
	cyan: ColorFunction;
	magenta: ColorFunction;
	white: ColorFunction;
	black: ColorFunction;
	gray: ColorFunction;
	grey: ColorFunction;

	// Styles
	bold: ColorFunction;
	italic: ColorFunction;
	underline: ColorFunction;
	strikethrough: ColorFunction;

	// Advanced colors
	rgb(r: number, g: number, b: number): ColorFunction;
	hsl(h: number, s: number, l: number): ColorFunction;
	hex(color: string): ColorFunction;

	// Effects
	gradient(colors: string[]): ColorFunction;
	rainbow: ColorFunction;

	// Utilities
	strip(text: string): string;
	supportsColor(): boolean;
	enable(): void;
	disable(): void;
}

// CLI Tools types
export interface QuickAction {
	key: string;
	label: string;
	description: string;
	shortcut?: string;
	action: () => void | Promise<void>;
}

export interface SelectConfig {
	multiple?: boolean;
	clearScreen?: boolean;
	showCursor?: boolean;
	exitOnCtrlC?: boolean;
	quickActions?: QuickAction[];
}

export interface PromptConfig {
	clearScreen?: boolean;
	allowEmpty?: boolean;
	showCursor?: boolean;
	exitOnCtrlC?: boolean;
	quickActions?: QuickAction[];
	onLeft?: () => void;
}

export interface ConfirmConfig {
	clearScreen?: boolean;
	defaultValue?: boolean;
	exitOnCtrlC?: boolean;
}

// Interactive CLI types
export interface InteractiveCLIOptions {
	enableRawMode?: boolean;
	exitOnCtrlC?: boolean;
	clearOnExit?: boolean;
}

export interface InteractiveCLI {
	// Core methods
	select(question: string, options: string[], config?: SelectConfig): Promise<string[]>;
	prompt(question: string, config?: PromptConfig): Promise<string>;
	confirm(question: string, config?: ConfirmConfig): Promise<boolean>;

	// Screen management
	clearScreen(): void;
	showCursor(): void;
	hideCursor(): void;

	// Event handling
	onKeyPress(callback: (key: KeyPress) => void): void;
	offKeyPress(callback: (key: KeyPress) => void): void;

	// Lifecycle
	cleanup(): void;
}

// Framework-specific types (will be extended by interactive package)
export interface FrameworkOptions {
	debug?: boolean;
	logLevel?: "error" | "warn" | "info" | "debug";
	enableHotkeys?: boolean;
	enableHistory?: boolean;
	maxHistorySize?: number;
	renderMode?: "immediate" | "debounced" | "throttled";
	renderDelay?: number;
}
