/**
 * Turn the comparison of two .env files into a `--check` report, without exposing any value.
 */

import { compareEnv, formatEnvDiff } from "@studiometa/forge-core";

import type { Drift } from "../../utils/drift.ts";

/**
 * Turn an env diff into a drift report, or null when the variables are the same.
 * The report holds variable names only, never values, because CI logs are often shared.
 */
export function envDrift(remote: string, local: string): Drift | null {
  const result = compareEnv(remote, local);
  return result.inSync ? null : { text: formatEnvDiff(result.diff), json: result.diff };
}
