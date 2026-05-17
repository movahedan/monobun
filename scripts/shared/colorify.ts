/**
 * Custom console coloring utility to replace chalk
 * Provides ANSI color codes for terminal output
 */

// ANSI color codes
const colors = {
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
	gray: "\x1b[90m",
	bold: "\x1b[1m",
	reset: "\x1b[0m",
} as const;

const createColorFunction = (colorCode: string) => {
	return (text: string): string => {
		return `${colorCode}${text}${colors.reset}`;
	};
};

/**
 * Console color utility that mimics chalk's API
 */
export const colorify = {
	red: createColorFunction(colors.red),
	green: createColorFunction(colors.green),
	yellow: createColorFunction(colors.yellow),
	blue: createColorFunction(colors.blue),
	cyan: createColorFunction(colors.cyan),
	gray: createColorFunction(colors.gray),
	bold: createColorFunction(colors.bold),
	reset: colors.reset,

	supportsColor: (): boolean => {
		// Check if we're in a terminal that supports colors
		return process.stdout.isTTY && process.env.NO_COLOR !== "1";
	},
	disable: () => {
		Object.keys(colorify).forEach((key) => {
			if (typeof colorify[key as keyof typeof colorify] === "function") {
				(colorify as unknown as Record<string, (text: string) => string>)[key] = (text: string) =>
					text;
			}
		});
	},
	enable: () => {
		Object.keys(colors).forEach((key) => {
			if (key !== "reset") {
				(colorify as unknown as Record<string, (text: string) => string>)[key] =
					createColorFunction(colors[key as keyof typeof colors]);
			}
		});
	},
} as const;

if (!colorify.supportsColor()) {
	colorify.disable();
}
