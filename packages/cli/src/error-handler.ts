/**
 * Centralized error handling for forge.
 */

import type { OutputFormatter } from "./output.ts";

import { ApiError, CliError, ConfigError, ValidationError, isCliError } from "./errors.ts";

/**
 * Exit codes for different error categories.
 */
export const ExitCode = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  AUTHENTICATION_ERROR: 2,
  VALIDATION_ERROR: 3,
  CONFIG_ERROR: 4,
  NOT_FOUND_ERROR: 5,
} as const;

export type ExitCode = (typeof ExitCode)[keyof typeof ExitCode];

/**
 * Determine the appropriate exit code for an error.
 */
export function getExitCode(error: unknown): ExitCode {
  if (error instanceof ValidationError) {
    return ExitCode.VALIDATION_ERROR;
  }
  if (error instanceof ApiError) {
    if (error.statusCode === 401) return ExitCode.AUTHENTICATION_ERROR;
    if (error.statusCode === 404) return ExitCode.NOT_FOUND_ERROR;
  }
  if (isCliError(error) && error.code === "CONFIG_ERROR") {
    return ExitCode.CONFIG_ERROR;
  }
  return ExitCode.GENERAL_ERROR;
}

/**
 * Central error handler for all commands.
 */
export function handleError(
  error: unknown,
  formatter: OutputFormatter,
  options?: { exit?: boolean },
): ExitCode {
  const shouldExit = options?.exit ?? true;

  let cliError: CliError;
  if (isCliError(error)) {
    cliError = error;
  } else {
    cliError = ApiError.fromForgeError(error);
  }

  // Output error in appropriate format
  const opts = formatter as unknown as { format?: string };
  if (opts.format === "json") {
    formatter.output(cliError.toJSON());
  } else {
    formatter.error(cliError.toFormattedMessage());
  }

  const exitCode = getExitCode(cliError);

  if (shouldExit) {
    process.exit(exitCode);
  }

  return exitCode;
}

/**
 * Wraps a command function with automatic error handling.
 */
export async function runCommand<T>(
  fn: () => Promise<T>,
  formatter: OutputFormatter,
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, formatter);
    return undefined; // unreachable due to process.exit
  }
}

/**
 * Exits with a validation error for a missing required argument.
 */
export function exitWithValidationError(
  field: string,
  usage: string,
  formatter: OutputFormatter,
): never {
  const error = ValidationError.required(field, [`Usage: ${usage}`]);
  handleError(error, formatter);
  // Unreachable in production
  throw error;
}

/**
 * Exits with a config error when token is missing.
 */
export function exitWithConfigError(formatter: OutputFormatter): never {
  const error = ConfigError.missingToken();
  handleError(error, formatter);
  throw error;
}
