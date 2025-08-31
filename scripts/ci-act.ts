#!/usr/bin/env bun
import { createScript, type ScriptConfig } from "@repo/intershell/core";
import { $ } from "bun";

const ciActConfig = {
	name: "GitHub Actions Local Testing",
	description: "Uses catthehacker/ubuntu:act-latest image which has unzip available for Bun setup",
	usage: "bun run ci:check -e <event> -w <workflow> [-v | --verbose]",
	examples: [
		"bun run ci:check -v --verbose -e pull_request -w .github/workflows/Check.yml",
		"bun run ci:check --event push --workflow .github/workflows/Build.yml",
		"bun run ci:check --event release --workflow .github/workflows/Deploy.yml",
		"bun run ci:check --event workflow_run --workflow .github/workflows/Check.yml",
	],
	options: [
		{
			short: "-e",
			long: "--event",
			description: "GitHub event to simulate (e.g., pull_request, push)",
			required: true,
			type: "string",
			validator: createScript.validators.enum([
				"pull_request",
				"push",
				"release",
				"workflow_dispatch",
				"workflow_run",
			]),
		},
		{
			short: "-w",
			long: "--workflow",
			description: "Workflow file to test (e.g., .github/workflows/Check.yml)",
			required: true,
			type: "string",
			validator: createScript.validators.fileExists,
		},
	],
} as const satisfies ScriptConfig;

export const ciAct = createScript(ciActConfig, async function main(args, xConsole) {
	xConsole.log(`📋 on: ${args.event} at: ${args.workflow} \n`);

	try {
		await $`act ${args.event} -W ${args.workflow} -P ubuntu-latest=catthehacker/ubuntu:act-latest --quiet`;
		if (args.verbose) {
			xConsole.log("✅ Success with catthehacker/ubuntu:act-latest image!");
		}
	} catch (error) {
		xConsole.error("❌ Act test failed:", error);
		throw error;
	} finally {
		await cleanupActContainers(xConsole);
	}

	xConsole.log("✅ GitHub Actions test completed!");
});

if (import.meta.main) {
	ciAct.run();
}

// Cleanup function to stop and remove act containers
async function cleanupActContainers(xConsole: typeof console) {
	try {
		xConsole.log("\n🧹 Cleaning up act containers...");

		try {
			// Check if any act containers exist before trying to stop them
			const runningContainers = await $`docker ps -q --filter "label=com.act.container"`.text();
			if (runningContainers.trim()) {
				await $`docker ps -q --filter "label=com.act.container" | xargs -r docker stop`;
				xConsole.log("✅ Stopped running act containers");
			}
		} catch (error) {
			console.warn("⚠️  Warning: act containers do not exist:", error);
		}

		try {
			// Remove all act containers (including stopped ones)
			const allContainers = await $`docker ps -aq --filter "label=com.act.container"`.text();
			if (allContainers.trim()) {
				await $`docker ps -aq --filter "label=com.act.container" | xargs -r docker rm`;
				xConsole.log("✅ Removed act containers");
			}
		} catch (error) {
			console.warn("⚠️  Warning: act containers may not have been cleaned up:", error);
		}

		try {
			// Remove act networks
			const networks = await $`docker network ls -q --filter "label=com.act.network"`.text();
			if (networks.trim()) {
				await $`docker network ls -q --filter "label=com.act.network" | xargs -r docker network rm`;
				xConsole.log("✅ Removed act networks");
			}
		} catch (error) {
			console.warn("⚠️  Warning: act networks do not exist:", error);
		}

		xConsole.log("✅ Act containers cleaned up successfully!");
	} catch (error) {
		console.warn("⚠️  Warning: Some containers may not have been cleaned up:", error);
	}
}
