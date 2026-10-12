/**
 * Compare two .env files by variable name, without exposing any value.
 */

import type { Drift } from "../../utils/drift.ts";

export interface EnvDiff {
  /** Names only in the local file. */
  added: string[];
  /** Names only on Forge. */
  removed: string[];
  /** Names in both, with a different value. */
  changed: string[];
}

/**
 * Parse KEY=VALUE lines. Blank lines, comments and lines without a key are ignored.
 */
export function parseEnv(content: string): Map<string, string> {
  const variables = new Map<string, string>();
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    const separator = line.indexOf("=");
    if (line.startsWith("#") || separator < 1) {
      continue;
    }
    variables.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
  }
  return variables;
}

/**
 * Compare the variables of two .env files. Returns only variable names.
 */
export function diffEnv(remote: string, local: string): EnvDiff {
  const remoteVars = parseEnv(remote);
  const localVars = parseEnv(local);
  const result: EnvDiff = { added: [], removed: [], changed: [] };

  for (const [name, value] of localVars) {
    if (!remoteVars.has(name)) {
      result.added.push(name);
    } else if (remoteVars.get(name) !== value) {
      result.changed.push(name);
    }
  }

  for (const name of remoteVars.keys()) {
    if (!localVars.has(name)) {
      result.removed.push(name);
    }
  }

  return result;
}

/**
 * Turn an env diff into a drift report, or null when the variables are the same.
 * The report holds variable names only, never values, because CI logs are often shared.
 */
export function envDrift(remote: string, local: string): Drift | null {
  const result = diffEnv(remote, local);
  const lines = [
    ...result.added.map((name) => `+ ${name} (added)`),
    ...result.removed.map((name) => `- ${name} (removed)`),
    ...result.changed.map((name) => `~ ${name} (changed)`),
  ];
  return lines.length > 0 ? { text: lines.join("\n"), json: result } : null;
}
