import { parseArgs } from "node:util";

import { EntityAffected } from "intershell";

import { getAffectedComposeServices } from "./get-affected-compose-services";

const MODES = ["docker", "turbo"] as const;
type AffectedMode = (typeof MODES)[number];

function isAffectedMode(value: string | undefined): value is AffectedMode {
	return value !== undefined && (MODES as readonly string[]).includes(value);
}

function logVerbose(message: string, quiet: boolean): void {
	if (!quiet) {
		console.log(message);
	}
}

async function resolveBaseSha(flagBaseSha: string | undefined, quiet: boolean): Promise<string> {
	if (flagBaseSha !== undefined && flagBaseSha !== "") {
		logVerbose(`Using provided base SHA: ${flagBaseSha}`, quiet);
		return flagBaseSha;
	}

	const eventName = process.env.GITHUB_EVENT_NAME;
	const isPR = eventName === "pull_request";

	if (isPR) {
		let baseSha = process.env.GITHUB_BASE_SHA;

		if (!baseSha && process.env.GITHUB_EVENT_PATH) {
			try {
				const eventData = JSON.parse(await Bun.file(process.env.GITHUB_EVENT_PATH).text()) as {
					pull_request?: { base?: { sha?: string } };
				};
				baseSha = eventData.pull_request?.base?.sha;
				logVerbose(`Got base SHA from GitHub context: ${baseSha ?? "(empty)"}`, quiet);
			} catch (error: unknown) {
				logVerbose(`Failed to read GitHub context: ${String(error)}`, quiet);
			}
		}

		if (baseSha) {
			logVerbose(`PR detected, using base branch: ${baseSha}`, quiet);
			return baseSha;
		}

		logVerbose("PR detected, but base SHA not available from any source, using HEAD~1", quiet);
		return "HEAD~1";
	}

	const pushBase = process.env.GITHUB_BEFORE_SHA || "HEAD~1";
	logVerbose(`Push detected, using base SHA: ${pushBase}`, quiet);
	return pushBase;
}

export async function runCiAttachAffected(rest: readonly string[]): Promise<void> {
	const { values } = parseArgs({
		args: [...rest],
		options: {
			"output-id": { type: "string", short: "o" },
			mode: { type: "string", short: "m" },
			"base-sha": { type: "string", short: "b" },
			quiet: { type: "boolean", short: "q", default: false },
		},
		strict: true,
	});

	const outputId = values["output-id"];
	if (outputId === undefined || outputId === "") {
		console.error("Missing required flag: --output-id (-o)");
		process.exit(1);
	}

	const modeRaw = values.mode;
	if (!isAffectedMode(modeRaw)) {
		console.error(`Missing or invalid --mode (-m); expected one of: ${MODES.join(", ")}`);
		process.exit(1);
	}

	const quiet = values.quiet === true;
	const mode = modeRaw;

	if (mode === "docker") {
		logVerbose("Using docker output mode", quiet);
	} else {
		logVerbose("Using turbo output mode", quiet);
	}

	const baseSha = await resolveBaseSha(values["base-sha"], quiet);
	logVerbose(`Comparing changes from ${baseSha} to HEAD`, quiet);

	const affectedList =
		mode === "docker"
			? await getAffectedComposeServices(baseSha)
			: await EntityAffected.getAffectedPackages(baseSha);

	logVerbose(`Found ${affectedList.length} affected items`, quiet);

	const affectedOutput =
		mode === "docker"
			? affectedList.join(" ")
			: affectedList.map((pkg) => `--filter="${pkg}"`).join(" ");

	if (!quiet && affectedOutput.length > 0) {
		console.log(affectedOutput);
	}

	const githubOutput = process.env.GITHUB_OUTPUT;
	if (githubOutput) {
		const output = `${outputId}<<EOF\n${affectedOutput}\nEOF\n`;
		await Bun.write(githubOutput, output);
		logVerbose(`Attached: ${outputId}=${affectedOutput}`, quiet);
	}
}
