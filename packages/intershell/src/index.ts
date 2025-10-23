#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import { run } from "@oclif/core";

const __filename = fileURLToPath(import.meta.url);
await run(process.argv.slice(2), __filename);
