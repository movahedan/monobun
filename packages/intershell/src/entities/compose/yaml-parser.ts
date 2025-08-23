/**
 * Simple YAML parser for docker-compose files
 * Handles basic YAML structures: key-value pairs, arrays, nested objects
 */

import type { ComposeData, NetworkDefinition, ServiceDefinition, VolumeDefinition } from "./types";

export function parseYAML(input: string): Record<string, unknown> {
	const lines = input.split("\n");
	const result: Record<string, unknown> = {};
	const stack: Array<{ obj: Record<string, unknown>; indent: number }> = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Skip empty lines and comments
		if (!line.trim() || line.trim().startsWith("#")) continue;

		const indent = line.search(/\S/);
		const trimmedLine = line.trim();

		// Handle array items (lines starting with -)
		if (trimmedLine.startsWith("-")) {
			handleArrayItem(trimmedLine, indent, stack, result, i, lines);
			continue;
		}

		// Handle key-value pairs
		const colonIndex = trimmedLine.indexOf(":");
		if (colonIndex === -1) continue;

		const key = trimmedLine.substring(0, colonIndex).trim();
		const value = trimmedLine.substring(colonIndex + 1).trim();

		// Navigate to the correct nesting level
		while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
			stack.pop();
		}

		const currentObj = stack.length > 0 ? stack[stack.length - 1].obj : result;

		if (value === "") {
			// Check if the next non-empty line is an array item
			let isArrayNext = false;
			for (let j = i + 1; j < lines.length; j++) {
				const nextLine = lines[j];
				if (!nextLine.trim() || nextLine.trim().startsWith("#")) continue;

				const nextIndent = nextLine.search(/\S/);
				if (nextIndent > indent && nextLine.trim().startsWith("-")) {
					isArrayNext = true;
				}
				break;
			}

			if (isArrayNext) {
				// This key will contain an array, so don't create an object
				currentObj[key] = [];
			} else {
				// Start new nested object
				currentObj[key] = {};
				stack.push({ obj: currentObj[key] as Record<string, unknown>, indent });
			}
		} else {
			// Simple key-value pair
			currentObj[key] = parseValue(value);
		}
	}

	return result;
}

function handleArrayItem(
	line: string,
	indent: number,
	stack: Array<{ obj: Record<string, unknown>; indent: number }>,
	result: Record<string, unknown>,
	lineIndex: number,
	allLines: string[],
): void {
	// Navigate to the correct nesting level
	while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
		stack.pop();
	}

	const currentObj = stack.length > 0 ? stack[stack.length - 1].obj : result;

	// Find the array key by looking backwards for the most recent key at a lower indent level
	let arrayKey = "";

	// Look backwards to find the key that should contain this array
	for (let i = lineIndex - 1; i >= 0; i--) {
		const prevLine = allLines[i];
		if (!prevLine.trim() || prevLine.trim().startsWith("#")) continue;

		const prevIndent = prevLine.search(/\S/);
		if (prevIndent < indent) {
			// Found a line at a lower indent level
			const colonIndex = prevLine.indexOf(":");
			if (colonIndex !== -1) {
				const key = prevLine.substring(0, colonIndex).trim();
				const value = prevLine.substring(colonIndex + 1).trim();

				// If this line has no value, it's an object definition
				if (value === "") {
					arrayKey = key;
					break;
				}
			}
		}
	}

	if (!arrayKey) {
		// Fallback: look for any key in current object that might be an array
		for (const [key, value] of Object.entries(currentObj)) {
			if (Array.isArray(value)) {
				arrayKey = key;
				break;
			}
		}
	}

	if (!arrayKey) {
		// Create a new array if none exists - this shouldn't happen in valid YAML
		return;
	}

	// Ensure the array exists in the current object
	if (!Array.isArray(currentObj[arrayKey])) {
		currentObj[arrayKey] = [];
	}

	const value = line.substring(1).trim();
	if (value === "") {
		// Empty array item, start new object
		const newItem: Record<string, unknown> = {};
		(currentObj[arrayKey] as unknown[]).push(newItem);
		stack.push({ obj: newItem, indent });
	} else if (value.includes(":")) {
		// Check if this looks like a key-value pair vs a quoted string with a colon
		const colonIndex = value.indexOf(":");
		const beforeColon = value.substring(0, colonIndex).trim();
		const afterColon = value.substring(colonIndex + 1).trim();

		// If it looks like a key-value pair (key is not quoted, value might be)
		if (!beforeColon.startsWith('"') && !beforeColon.endsWith('"')) {
			const newItem: Record<string, unknown> = {};
			newItem[beforeColon] = parseValue(afterColon);
			(currentObj[arrayKey] as unknown[]).push(newItem);
		} else {
			// It's a quoted string with a colon, treat as literal
			(currentObj[arrayKey] as unknown[]).push(parseValue(value));
		}
	} else {
		// Simple array item
		(currentObj[arrayKey] as unknown[]).push(parseValue(value));
	}
}

function parseValue(value: string): string | number | boolean | unknown[] {
	// Try to parse as number
	if (!Number.isNaN(Number(value)) && value.trim() !== "") {
		return Number(value);
	}

	// Try to parse as boolean
	if (value === "true") return true;
	if (value === "false") return false;

	// Try to parse as array
	if (value === "[]") return [];

	// Return as string (remove quotes if present)
	return value.replace(/^["']|["']$/g, "");
}

/**
 * Parse docker-compose specific structures
 */
export function parseDockerCompose(input: string): ComposeData {
	const parsed = parseYAML(input);

	// Post-process for docker-compose specific needs
	if (parsed.services) {
		for (const [, service] of Object.entries(parsed.services)) {
			// Ensure ports are properly parsed as arrays
			if (service.ports && Array.isArray(service.ports)) {
				(service as Record<string, unknown>).ports = service.ports.map((port: unknown) =>
					typeof port === "string" ? port : String(port),
				);
			}

			// Ensure environment variables are properly parsed
			if (service.environment && Array.isArray(service.environment)) {
				const envObj: Record<string, string> = {};
				for (const env of service.environment) {
					if (typeof env === "string" && env.includes("=")) {
						const [key, ...valueParts] = env.split("=");
						envObj[key] = valueParts.join("=");
					}
				}
				(service as Record<string, unknown>).environment = envObj;
			}
		}
	}

	// Ensure required fields exist with defaults
	const result: ComposeData = {
		version: (parsed.version as string) || "3.8",
		services: (parsed.services as Record<string, ServiceDefinition>) || {},
		networks: (parsed.networks as Record<string, NetworkDefinition>) || {},
		volumes: (parsed.volumes as Record<string, VolumeDefinition>) || {},
		validation: {
			isValid: true,
			errors: [],
		},
	};

	return result;
}
