/**
 * Compare local content with the content on Forge.
 *
 * Pure functions shared by the CLI `--check` option and the MCP `check` action.
 */

import { diff } from "node:util";

/**
 * Result of a comparison: `{ inSync: true }`, or `{ inSync: false, diff }` when the content differs.
 */
export type DriftResult<T> = { inSync: true } | { inSync: false; diff: T };

/**
 * Normalize CRLF to LF and drop a single trailing newline,
 * so editor and platform differences do not count as drift.
 */
export function normalizeContent(text: string): string {
  const lf = text.replaceAll("\r\n", "\n");
  return lf.endsWith("\n") ? lf.slice(0, -1) : lf;
}

function toLines(normalized: string): string[] {
  return normalized === "" ? [] : normalized.split("\n");
}

interface DiffLine {
  op: " " | "-" | "+";
  text: string;
  /** Number of remote lines before this line. */
  remoteBefore: number;
  /** Number of local lines before this line. */
  localBefore: number;
}

/**
 * Build a unified-style line diff from `remote` to `local`, with `context`
 * unchanged lines around each change. Returns an empty string when both
 * are equal after normalization.
 */
export function unifiedDiff(remote: string, local: string, context = 3): string {
  const remoteText = normalizeContent(remote);
  const localText = normalizeContent(local);
  // Return early: util.diff also throws on two empty arrays (Node 24).
  if (remoteText === localText) {
    return "";
  }

  // util.diff marks lines only in its first argument with 1 and lines only in its second with -1.
  const entries = diff(toLines(remoteText), toLines(localText));

  let remoteCount = 0;
  let localCount = 0;
  const lines: DiffLine[] = entries.map(([op, text]) => {
    const line: DiffLine = {
      op: op === 0 ? " " : op === 1 ? "-" : "+",
      text,
      remoteBefore: remoteCount,
      localBefore: localCount,
    };
    if (op !== -1) remoteCount++;
    if (op !== 1) localCount++;
    return line;
  });

  // Group changes into hunks: a gap of more than 2 × context unchanged lines starts a new hunk.
  const changes = lines.flatMap((line, index) => (line.op === " " ? [] : [index]));
  const groups: number[][] = [];
  for (const index of changes) {
    const group = groups.at(-1);
    if (group && index - group[group.length - 1] - 1 <= 2 * context) {
      group.push(index);
    } else {
      groups.push([index]);
    }
  }

  const output = ["--- remote", "+++ local"];
  for (const group of groups) {
    const start = Math.max(0, group[0] - context);
    const end = Math.min(lines.length, group[group.length - 1] + context + 1);
    const hunk = lines.slice(start, end);
    const remoteLength = hunk.filter((line) => line.op !== "+").length;
    const localLength = hunk.filter((line) => line.op !== "-").length;
    // An empty side points at the line before the hunk, as in GNU diff.
    const remoteStart = hunk[0].remoteBefore + (remoteLength > 0 ? 1 : 0);
    const localStart = hunk[0].localBefore + (localLength > 0 ? 1 : 0);
    output.push(`@@ -${remoteStart},${remoteLength} +${localStart},${localLength} @@`);
    for (const line of hunk) {
      output.push(`${line.op}${line.text}`);
    }
  }

  return output.join("\n");
}

/**
 * Compare two text files (nginx configuration, deployment script, PHP configuration).
 * The diff is a unified line diff from `remote` to `local`.
 */
export function compareText(remote: string, local: string): DriftResult<string> {
  const text = unifiedDiff(remote, local);
  return text ? { inSync: false, diff: text } : { inSync: true };
}

/**
 * Difference between two .env files, by variable name only.
 */
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
 *
 * The map holds values: keep it internal and never return it to a caller that prints.
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
 * Compare the variables of two .env files. Returns only variable names, never values.
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
 * Compare two .env files by variable name. The result holds names only, never values,
 * because CI logs and agent transcripts are often shared.
 */
export function compareEnv(remote: string, local: string): DriftResult<EnvDiff> {
  const result = diffEnv(remote, local);
  const count = result.added.length + result.removed.length + result.changed.length;
  return count > 0 ? { inSync: false, diff: result } : { inSync: true };
}

/**
 * Format an env diff as one line per name: `+ NAME (added)`, `- NAME (removed)`, `~ NAME (changed)`.
 */
export function formatEnvDiff(result: EnvDiff): string {
  return [
    ...result.added.map((name) => `+ ${name} (added)`),
    ...result.removed.map((name) => `- ${name} (removed)`),
    ...result.changed.map((name) => `~ ${name} (changed)`),
  ].join("\n");
}
