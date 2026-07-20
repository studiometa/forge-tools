import {
  getServer,
  listServices,
  restartService,
  RESTARTABLE_SERVICES,
} from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { ValidationError } from "../../errors.ts";
import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId } from "../../utils/resolve.ts";

/**
 * List services on a server with a derived availability flag.
 */
export async function servicesList(args: string[], ctx: CommandContext): Promise<void> {
  const [server] = args;

  if (!server) {
    exitWithValidationError("server", "forge services list <server>", ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await listServices({ server_id }, execCtx);
    ctx.formatter.outputList(
      result.data,
      ["service", "available", "detail"],
      "No services.",
      (row) => {
        const status = row.available ? "yes" : "no";
        const detail = row.detail ? ` (${row.detail})` : "";
        return `${row.service.padEnd(12)}${status}${detail}`;
      },
    );
  }, ctx.formatter);
}

/**
 * Restart a service on a server.
 */
export async function servicesRestart(args: string[], ctx: CommandContext): Promise<void> {
  const [server, service] = args;

  if (!server) {
    exitWithValidationError("server", "forge services restart <server> <service>", ctx.formatter);
  }

  if (!service) {
    exitWithValidationError("service", "forge services restart <server> <service>", ctx.formatter);
  }

  const version = ctx.options.version ? String(ctx.options.version) : undefined;

  await runCommand(async () => {
    if (!(RESTARTABLE_SERVICES as readonly string[]).includes(service)) {
      throw new ValidationError(`Invalid service "${service}"`, "service", [
        `Valid services: ${RESTARTABLE_SERVICES.join(", ")}`,
      ]);
    }

    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);

    let resolvedVersion = version;
    if (service === "php" && !resolvedVersion) {
      const { data: srv } = await getServer({ server_id }, execCtx);
      if (!srv.php_version) {
        throw new ValidationError("The php service requires a version", "version", [
          "Pass --version <php_version> (e.g. --version php83)",
        ]);
      }
      resolvedVersion = srv.php_version;
    }

    await restartService({ server_id, service, version: resolvedVersion }, execCtx);
    ctx.formatter.success(`${service} restart initiated on server ${server_id}.`);
  }, ctx.formatter);
}
