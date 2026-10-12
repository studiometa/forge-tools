import { readFileSync } from "node:fs";

import type { OutputFormatter } from "../output.ts";
import type { OptionValue } from "./args.ts";

import { exitWithError } from "../error-handler.ts";
import { ValidationError } from "../errors.ts";

export interface ReadInputFileOptions {
  /** Option name without dashes, e.g. "file". */
  field: string;
  /** Command usage shown as a hint when the path is missing. */
  usage: string;
  /** What the file holds, for error messages, e.g. "deployment script". */
  label: string;
}

/**
 * Read a file given as an option value, or stdin when the value is "-".
 * Exits with a validation error when the value is not a path or the file cannot be read.
 */
export function readInputFile(
  path: OptionValue | undefined,
  { field, usage, label }: ReadInputFileOptions,
  formatter: OutputFormatter,
): string {
  if (typeof path !== "string" || !path) {
    exitWithError(
      new ValidationError(`--${field} requires a path (use - for stdin)`, field, [
        `Usage: ${usage}`,
      ]),
      formatter,
    );
  }

  try {
    return readFileSync(path === "-" ? 0 : path, "utf8");
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    exitWithError(
      new ValidationError(`Cannot read ${label} from ${path}: ${reason}`, field),
      formatter,
    );
  }
}
