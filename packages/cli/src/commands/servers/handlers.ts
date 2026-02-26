/**
 * CLI handlers for servers commands.
 * Delegates all HTTP logic to forge-core executors.
 */

import { listServers, getServer, rebootServer } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId } from "../../utils/resolve.ts";

/**
 * List all servers.
 */
export async function serversList(ctx: CommandContext): Promise<void> {
  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await listServers({}, execCtx);

    const format = String(ctx.options.format ?? ctx.options.f ?? "human");

    if (format === "table" || format === "json") {
      ctx.formatter.output(result.data);
    } else {
      if (result.data.length === 0) {
        ctx.formatter.info("No servers found.");
        return;
      }
      for (const server of result.data) {
        console.log(
          `${String(server.id).padEnd(8)} ${server.name.padEnd(30)} ${server.ip_address.padEnd(16)} ${server.is_ready ? "ready" : "provisioning"}`,
        );
      }
    }
  }, ctx.formatter);
}

/**
 * Get a single server by ID or name.
 */
export async function serversGet(args: string[], ctx: CommandContext): Promise<void> {
  const [server] = args;

  if (!server) {
    exitWithValidationError("server_id", "forge-cli servers get <server_id>", ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await getServer({ server_id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

/**
 * Reboot a server by ID or name.
 */
export async function serversReboot(args: string[], ctx: CommandContext): Promise<void> {
  const [server] = args;

  if (!server) {
    exitWithValidationError("server_id", "forge-cli servers reboot <server_id>", ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    await rebootServer({ server_id }, execCtx);
    ctx.formatter.success(`Server ${server_id} reboot initiated.`);
  }, ctx.formatter);
}
