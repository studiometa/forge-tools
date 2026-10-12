/**
 * Compare local content with the content on Forge for `--check`.
 */

import { diff } from "node:util";

import type { OutputFormatter } from "../output.ts";

import { ExitCode } from "../error-handler.ts";

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
 * A difference found by `--check`: `text` for human output, `json` for json output.
 */
export interface Drift {
  text: string;
  json: unknown;
}

/**
 * Print the result of a `--check` and exit 1 when the local content differs from Forge.
 * JSON output is `{ inSync: true }` or `{ inSync: false, diff }`.
 */
export function reportDrift(label: string, drift: Drift | null, formatter: OutputFormatter): void {
  const name = label.charAt(0).toUpperCase() + label.slice(1);

  if (formatter.isJson()) {
    console.log(JSON.stringify(drift ? { inSync: false, diff: drift.json } : { inSync: true }));
  } else if (drift) {
    console.log(drift.text);
    formatter.error(`${name} differs from Forge.`);
  } else {
    formatter.success(`${name} is in sync with Forge.`);
  }

  if (drift) {
    process.exit(ExitCode.GENERAL_ERROR);
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
  const text = unifiedDiff(remote, local);
  reportDrift(label, text ? { text, json: text } : null, formatter);
}
