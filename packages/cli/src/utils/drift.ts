/**
 * Print the result of a `--check` that compares local content with the content on Forge.
 * The comparison itself lives in `@studiometa/forge-core`.
 */

import { compareText } from "@studiometa/forge-core";

import type { OutputFormatter } from "../output.ts";

import { ExitCode } from "../error-handler.ts";

/**
 * A difference found by `--check`: `text` for human output, `json` for json output.
 */
export interface Drift {
  text: string;
  json: unknown;
}

/**
 * Print the result of a `--check` and set exit code 1 when the local content differs from Forge.
 * It sets `process.exitCode` and does not call `process.exit`, so a long diff
 * written to a pipe is not cut. JSON output is `{ inSync: true }` or `{ inSync: false, diff }`.
 */
export function reportDrift(label: string, drift: Drift | null, formatter: OutputFormatter): void {
  const name = label.charAt(0).toUpperCase() + label.slice(1);

  if (formatter.isJson()) {
    formatter.output(drift ? { inSync: false, diff: drift.json } : { inSync: true });
  } else if (drift) {
    console.log(drift.text);
    formatter.error(`${name} differs from Forge.`);
  } else {
    formatter.success(`${name} is in sync with Forge.`);
  }

  if (drift) {
    process.exitCode = ExitCode.GENERAL_ERROR;
  }
}

/**
 * Check `local` against `remote` as text and report a line diff.
 */
export function reportTextDrift(
  label: string,
  remote: string,
  local: string,
  formatter: OutputFormatter,
): void {
  const result = compareText(remote, local);
  reportDrift(label, result.inSync ? null : { text: result.diff, json: result.diff }, formatter);
}
