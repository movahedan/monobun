#!/usr/bin/env bun
import { createScript, type ScriptConfig } from "@repo/intershell/core";
import { EntityAffected, EntityCompose } from "@repo/intershell/entities";

const ciAttachAffectedConfig = {
	name: "GitHub Attach Affected",
	description: "Attach affected services to GitHub Actions",
	usage: "bun run scripts/ci-attach-affected.ts",
	examples: ["bun run scripts/ci-attach-affected.ts"],
	options: [
		{
			short: "-o",
			long: "--output-id",
			description: "The ID of the output to attach the affected packages to",
			required: true,
			type: "string",
			validator: createScript.validators.nonEmpty,
		},
		{
			short: "-m",
			long: "--mode",
			description: "The mode to use for the affected services",
			required: true,
			type: "string",
			validator: createScript.validators.enum(["docker", "turbo"]),
		},
		{
			short: "-b",
			long: "--base-sha",
			description: "The base SHA to compare against (defaults to latest tag)",
			required: false,
			type: "string",
			validator: createScript.validators.nonEmpty,
		},
	],
} as const satisfies ScriptConfig;

export const ciAttachAffected = createScript(
	ciAttachAffectedConfig,
	async function main(options, xConsole) {
		const mode = options.mode;
		const outputId = options["output-id"];

		if (mode === "docker") {
			xConsole.log("🐳 Using docker output mode");
		} else {
			xConsole.log("🚀 Using turbo output mode");
		}

		let baseSha = options["base-sha"];
		if (!baseSha) {
			const eventName = process.env.GITHUB_EVENT_NAME;
			const isPR = eventName === "pull_request";

			if (isPR) {
				// Try multiple sources for base SHA
				baseSha = process.env.GITHUB_BASE_SHA;

				// If GITHUB_BASE_SHA is not available, try to get it from GitHub context
				if (!baseSha && process.env.GITHUB_EVENT_PATH) {
					try {
						const eventData = JSON.parse(await Bun.file(process.env.GITHUB_EVENT_PATH).text());
						baseSha = eventData.pull_request?.base?.sha;
						xConsole.log(`🔍 Got base SHA from GitHub context: ${baseSha}`);
					} catch (error) {
						xConsole.log(`🔍 Failed to read GitHub context: ${error}`);
					}
				}

				if (baseSha) {
					xConsole.log(`🔍 PR detected, using base branch: ${baseSha}`);
				} else {
					xConsole.log("🔍 PR detected, but base SHA not available from any source, using HEAD~1");
					baseSha = "HEAD~1";
				}
			} else {
				baseSha = process.env.GITHUB_BEFORE_SHA || "HEAD~1";
				xConsole.log(`🔍 Push detected, using base SHA: ${baseSha}`);
			}
		} else {
			xConsole.log(`🔍 Using provided base SHA: ${baseSha}`);
		}

		xConsole.log(`🔍 Comparing changes from ${baseSha} to HEAD`);
		const affectedList =
			mode === "docker"
				? await new EntityCompose("docker-compose.yml").getAffectedServices(baseSha)
				: await EntityAffected.getAffectedPackages(baseSha);
		xConsole.log(`🔍 Found ${affectedList.length} affected items`);

		const affectedServicesNames = affectedList
			.map((i) => (mode === "docker" ? (typeof i !== "string" ? i.name : i) : `--filter="${i}"`))
			.join(" ");

		// Output in GitHub Actions format
		if (process.env.GITHUB_OUTPUT) {
			const output = `${outputId}<<EOF\n${affectedServicesNames}\nEOF\n`;
			await Bun.write(process.env.GITHUB_OUTPUT, output);
			xConsole.log(`\nAttached: ${outputId}=${affectedServicesNames}\n`);
		}
	},
);

if (import.meta.main) {
	ciAttachAffected.run();
}
