/**
 * Read the content of an update command from a file, stdin or an inline option.
 */

import { readFileSync } from "node:fs";

import type { CommandOptions } from "../context.ts";
import type { OutputFormatter } from "../output.ts";
import type { OptionValue } from "./args.ts";

import { exitWithError } from "../error-handler.ts";
import { ValidationError } from "../errors.ts";

export interface ContentSource {
  /** What the content is, in lower case, e.g. "deployment script". */
  label: string;
  /** Usage line shown in validation errors. */
  usage: string;
  formatter: OutputFormatter;
}

/**
 * Exit when the content is empty, so Forge never gets a blank file.
 */
function assertNotEmpty(content: string, field: string, source: ContentSource): void {
  if (!content.trim()) {
    const label = source.label.charAt(0).toUpperCase() + source.label.slice(1);
    exitWithError(new ValidationError(`${label} is empty`, field), source.formatter);
  }
}

/**
 * Read content from a file path, or from stdin when the path is "-".
 * Exits with a validation error when the path is missing, the file cannot be read or it is empty.
 */
export function readContentFile(
  path: OptionValue | undefined,
  field: string,
  source: ContentSource,
): string {
  if (typeof path !== "string" || !path) {
    exitWithError(
      new ValidationError(`--${field} requires a path (use - for stdin)`, field, [
        `Usage: ${source.usage}`,
      ]),
      source.formatter,
    );
  }

  let content: string;
  try {
    content = readFileSync(path === "-" ? 0 : path, "utf8");
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    exitWithError(
      new ValidationError(`Cannot read ${source.label} from ${path}: ${reason}`, field),
      source.formatter,
    );
  }

  assertNotEmpty(content, field, source);
  return content;
}

/**
 * Read content from exactly one of `--file <path|->` or `--content <string>`.
 * Exits with a validation error when both or none are given, or when the content is empty.
 */
export function readContentOption(options: CommandOptions, source: ContentSource): string {
  const { file, content } = options;

  if (file !== undefined && content !== undefined) {
    exitWithError(
      new ValidationError("Use either --file or --content, not both", "file", [
        `Usage: ${source.usage}`,
      ]),
      source.formatter,
    );
  }

  if (file !== undefined) {
    return readContentFile(file, "file", source);
  }

  if (content === undefined) {
    exitWithError(
      new ValidationError(`Missing ${source.label}: use --file or --content`, "file", [
        `Usage: ${source.usage}`,
      ]),
      source.formatter,
    );
  }

  // `--content` without a value parses as `true`: treat it as empty content.
  const inline = typeof content === "string" ? content : "";
  assertNotEmpty(inline, "content", source);
  return inline;
}
