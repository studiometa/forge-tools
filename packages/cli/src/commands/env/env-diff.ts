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

const NAME = /^[A-Za-z_][A-Za-z0-9_.]*$/;

/**
 * Find the closing quote of a quoted value. `\` escapes a character in double quotes only.
 * Returns -1 when the value is not closed.
 */
function closingQuote(value: string, quote: string): number {
  for (let index = 1; index < value.length; index++) {
    if (quote === '"' && value[index] === "\\") {
      index++;
    } else if (value[index] === quote) {
      return index;
    }
  }
  return -1;
}

/**
 * Parse a .env file into a map of name to value, with the dotenv rules used by Laravel:
 * an optional `export ` prefix, quoted values that can span lines, and ` #` inline comments
 * after unquoted values. Blank lines, comments and lines without a valid name are ignored,
 * so a part of a value can never show as a name.
 */
export function parseEnv(content: string): Map<string, string> {
  const variables = new Map<string, string>();
  const lines = content.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index].trim();
    const separator = line.indexOf("=");
    const name = line
      .slice(0, Math.max(separator, 0))
      .trim()
      .replace(/^export\s+/, "");
    if (!NAME.test(name)) {
      continue;
    }

    let value = line.slice(separator + 1).trim();
    const quote = value[0];
    if (quote === '"' || quote === "'") {
      let end = closingQuote(value, quote);
      while (end === -1 && index + 1 < lines.length) {
        index++;
        value += `\n${lines[index]}`;
        end = closingQuote(value, quote);
      }
      value = value.slice(1, end === -1 ? undefined : end);
    } else {
      value = value.replace(/\s+#.*$/, "");
    }
    variables.set(name, value);
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
