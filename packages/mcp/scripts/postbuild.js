#!/usr/bin/env node
import { chmodSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const files = ["index.js", "server.js"];

for (const file of files) {
  const distFile = resolve(__dirname, "../dist", file);
  try {
    chmodSync(distFile, 0o755);
    console.log("✓ Made dist/%s executable", file);
  } catch (error) {
    console.error("Failed to make dist/%s executable: %s", file, error.message);
    process.exit(1);
  }
}
