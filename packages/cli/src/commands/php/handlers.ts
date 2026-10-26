import type { ExecutorContext } from "@studiometa/forge-core";
import {
  disablePhpOpcache,
  enablePhpOpcache,
  getPhpConfig,
  getPhpMaxExecutionTime,
  getPhpMaxUploadSize,
  getPhpOpcache,
  listPhpVersions,
  PHP_CONFIG_TYPES,
  updatePhpConfig,
  updatePhpMaxExecutionTime,
  updatePhpMaxUploadSize,
} from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { ValidationError } from "../../errors.ts";
import { exitWithError, exitWithValidationError, runCommand } from "../../error-handler.ts";
import { readContentOption } from "../../utils/content-source.ts";
import { reportTextDrift } from "../../utils/drift.ts";
import { printContent } from "../../utils/print-content.ts";
import { resolveServerId } from "../../utils/resolve.ts";

const CONFIG_USAGE =
  "forge php config --server <server_id> --version <version> --type <cli|fpm|pool> [--user <user>]";
const UPDATE_CONFIG_USAGE =
  "forge php update-config --server <server_id> --version <version> --type <cli|fpm|pool> (--file <path|-> | --content <content>) [--user <user>] [--check]";

/**
 * Return the --server option, or exit with a validation error when it is missing.
 */
function requireServer(ctx: CommandContext, usage: string): string {
  const server = String(ctx.options.server ?? "");
  if (!server) {
    exitWithValidationError("server_id", usage, ctx.formatter);
  }
  return server;
}

/**
 * Resolve the server and run `fn` with its ID, with the CLI error handling.
 */
async function withServer(
  ctx: CommandContext,
  server: string,
  fn: (server_id: string, execCtx: ExecutorContext) => Promise<void>,
): Promise<void> {
  await runCommand(async () => {
    const execCtx = ctx.createExecutorContext(ctx.getToken());
    const server_id = await resolveServerId(server, execCtx);
    await fn(server_id, execCtx);
  }, ctx.formatter);
}

interface ConfigTarget {
  version: string;
  type: string;
  user?: string;
}

/**
 * Read --version, --type and --user for the config commands.
 * Exits with a validation error when --version is missing, --type is not cli, fpm or pool,
 * or --user is given for a type other than pool.
 */
function requireConfigTarget(ctx: CommandContext, usage: string): ConfigTarget {
  const { version, type, user } = ctx.options;

  if (typeof version !== "string" || !version) {
    exitWithValidationError("version", usage, ctx.formatter);
  }

  if (typeof type !== "string" || !(PHP_CONFIG_TYPES as readonly string[]).includes(type)) {
    const message = typeof type === "string" ? `Invalid --type "${type}"` : "type is required";
    exitWithError(
      new ValidationError(message, "type", [
        `Valid types: ${PHP_CONFIG_TYPES.join(", ")}`,
        `Usage: ${usage}`,
      ]),
      ctx.formatter,
    );
  }

  if (typeof user === "string" && user && type !== "pool") {
    exitWithError(
      new ValidationError(`--user applies to --type pool only, not "${type}"`, "user", [
        `Usage: ${usage}`,
      ]),
      ctx.formatter,
    );
  }

  return { version, type, user: typeof user === "string" ? user : undefined };
}

/**
 * Parse a whole number argument, or exit with a validation error.
 */
function requireWholeNumber(
  value: string | undefined,
  field: string,
  usage: string,
  ctx: CommandContext,
): number {
  if (value === undefined || !/^\d+$/.test(value)) {
    const message =
      value === undefined ? `${field} is required` : `${field} must be a whole number: "${value}"`;
    exitWithError(new ValidationError(message, field, [`Usage: ${usage}`]), ctx.formatter);
  }
  return Number(value);
}

/**
 * List the PHP versions installed on a server.
 */
export async function phpList(ctx: CommandContext): Promise<void> {
  const server = requireServer(ctx, "forge php list --server <server_id>");

  await withServer(ctx, server, async (server_id, execCtx) => {
    const result = await listPhpVersions({ server_id }, execCtx);
    ctx.formatter.outputList(
      result.data,
      ["id", "version", "binary_name", "status"],
      "No PHP versions installed.",
      (v) =>
        `${String(v.id).padEnd(8)} ${v.version.padEnd(6)} ${v.binary_name.padEnd(10)} ${v.status}`,
    );
  });
}

/**
 * Print a PHP configuration file (cli, fpm or pool).
 */
export async function phpConfig(ctx: CommandContext): Promise<void> {
  const server = requireServer(ctx, CONFIG_USAGE);
  const target = requireConfigTarget(ctx, CONFIG_USAGE);

  await withServer(ctx, server, async (server_id, execCtx) => {
    const result = await getPhpConfig({ server_id, ...target }, execCtx);
    if (ctx.formatter.isJson()) {
      console.log(JSON.stringify({ content: result.data }));
    } else {
      printContent(result.data);
    }
  });
}

/**
 * Replace a PHP configuration file, or compare it with Forge when --check is set.
 */
export async function phpUpdateConfig(ctx: CommandContext): Promise<void> {
  const server = requireServer(ctx, UPDATE_CONFIG_USAGE);
  const target = requireConfigTarget(ctx, UPDATE_CONFIG_USAGE);
  const label = `PHP ${target.type} configuration`;
  const content = readContentOption(ctx.options, {
    label,
    usage: UPDATE_CONFIG_USAGE,
    formatter: ctx.formatter,
  });

  await withServer(ctx, server, async (server_id, execCtx) => {
    if (ctx.options.check) {
      const remote = await getPhpConfig({ server_id, ...target }, execCtx);
      reportTextDrift(label, remote.data, content, ctx.formatter);
      return;
    }

    await updatePhpConfig({ server_id, ...target, content }, execCtx);
    ctx.formatter.success(`${label} updated.`);
  });
}

/**
 * Print the PHP max upload size, in megabytes.
 */
export async function phpMaxUploadSize(ctx: CommandContext): Promise<void> {
  const server = requireServer(ctx, "forge php max-upload-size --server <server_id>");

  await withServer(ctx, server, async (server_id, execCtx) => {
    const { data } = await getPhpMaxUploadSize({ server_id }, execCtx);
    if (ctx.formatter.isJson()) {
      ctx.formatter.output({ max_upload_size: data });
    } else {
      console.log(`${data} MB`);
    }
  });
}

/**
 * Set the PHP max upload size, in megabytes.
 */
export async function phpSetMaxUploadSize(args: string[], ctx: CommandContext): Promise<void> {
  const usage = "forge php set-max-upload-size <megabytes> --server <server_id>";
  const size = requireWholeNumber(args[0], "megabytes", usage, ctx);
  const server = requireServer(ctx, usage);

  await withServer(ctx, server, async (server_id, execCtx) => {
    await updatePhpMaxUploadSize({ server_id, size }, execCtx);
    ctx.formatter.success(`PHP max upload size set to ${size} MB.`);
  });
}

/**
 * Print the PHP max execution time, in seconds.
 */
export async function phpMaxExecutionTime(ctx: CommandContext): Promise<void> {
  const server = requireServer(ctx, "forge php max-execution-time --server <server_id>");

  await withServer(ctx, server, async (server_id, execCtx) => {
    const { data } = await getPhpMaxExecutionTime({ server_id }, execCtx);
    if (ctx.formatter.isJson()) {
      ctx.formatter.output({ max_execution_time: data });
    } else {
      console.log(`${data} seconds`);
    }
  });
}

/**
 * Set the PHP max execution time, in seconds.
 */
export async function phpSetMaxExecutionTime(args: string[], ctx: CommandContext): Promise<void> {
  const usage = "forge php set-max-execution-time <seconds> --server <server_id>";
  const seconds = requireWholeNumber(args[0], "seconds", usage, ctx);
  const server = requireServer(ctx, usage);

  await withServer(ctx, server, async (server_id, execCtx) => {
    await updatePhpMaxExecutionTime({ server_id, seconds }, execCtx);
    ctx.formatter.success(`PHP max execution time set to ${seconds} seconds.`);
  });
}

/**
 * Print whether OPcache is enabled.
 */
export async function phpOpcache(ctx: CommandContext): Promise<void> {
  const server = requireServer(ctx, "forge php opcache --server <server_id>");

  await withServer(ctx, server, async (server_id, execCtx) => {
    const { data } = await getPhpOpcache({ server_id }, execCtx);
    if (ctx.formatter.isJson()) {
      ctx.formatter.output({ opcache_enabled: data });
    } else {
      console.log(`OPcache is ${data ? "enabled" : "disabled"}.`);
    }
  });
}

/**
 * Enable OPcache.
 */
export async function phpEnableOpcache(ctx: CommandContext): Promise<void> {
  const server = requireServer(ctx, "forge php enable-opcache --server <server_id>");

  await withServer(ctx, server, async (server_id, execCtx) => {
    await enablePhpOpcache({ server_id }, execCtx);
    ctx.formatter.success("OPcache enabled.");
  });
}

/**
 * Disable OPcache.
 */
export async function phpDisableOpcache(ctx: CommandContext): Promise<void> {
  const server = requireServer(ctx, "forge php disable-opcache --server <server_id>");

  await withServer(ctx, server, async (server_id, execCtx) => {
    await disablePhpOpcache({ server_id }, execCtx);
    ctx.formatter.success("OPcache disabled.");
  });
}
