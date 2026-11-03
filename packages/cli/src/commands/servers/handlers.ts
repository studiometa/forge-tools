/**
 * CLI handlers for servers commands.
 * Delegates all HTTP logic to forge-core executors.
 */

import type { CreateServerOptions } from "@studiometa/forge-core";
import { listServers, getServer, createServer, rebootServer } from "@studiometa/forge-core";

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
          `${String(server.id).padEnd(8)} ${server.name.padEnd(30)} ${(server.ip_address ?? "—").padEnd(16)} ${server.is_ready ? "ready" : "provisioning"}`,
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
    exitWithValidationError("server_id", "forge servers get <server_id>", ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await getServer({ server_id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

const CREATE_USAGE = "forge servers create --name <name> --ip-address <ip> [options]";

/**
 * Create a server. Defaults to a Custom VPS app server on Ubuntu 24.04.
 */
export async function serversCreate(ctx: CommandContext): Promise<void> {
  const name = String(ctx.options.name ?? "");
  const provider = String(ctx.options.provider ?? "custom");
  const ip_address = String(ctx.options["ip-address"] ?? "");

  if (!name) {
    exitWithValidationError("name", CREATE_USAGE, ctx.formatter);
  }

  if (provider === "custom" && !ip_address) {
    exitWithValidationError("ip-address", CREATE_USAGE, ctx.formatter);
  }

  const options: CreateServerOptions = {
    name,
    provider,
    type: String(ctx.options.type ?? "app"),
    ubuntu_version: String(ctx.options["ubuntu-version"] ?? "24.04"),
    php_version: String(ctx.options["php-version"] ?? "php84"),
  };

  if (ctx.options.database) options.database_type = String(ctx.options.database);
  if (ctx.options["credential-id"]) options.credential_id = String(ctx.options["credential-id"]);

  const tags = ctx.options.tag;
  if (tags) options.tags = (Array.isArray(tags) ? tags : [tags]).map(String);

  if (provider === "custom") {
    options.custom = { ip_address, ssh_port: String(ctx.options["ssh-port"] ?? "22") };
    if (ctx.options["private-ip"])
      options.custom.private_ip_address = String(ctx.options["private-ip"]);
  } else {
    (options as Record<string, unknown>)[provider] = {
      region_id: String(ctx.options.region ?? ""),
      size_id: String(ctx.options.size ?? ""),
    };
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await createServer(options, execCtx);

    const format = String(ctx.options.format ?? ctx.options.f ?? "human");

    if (format === "table" || format === "json") {
      ctx.formatter.output(result.data);
      return;
    }

    ctx.formatter.success(`Server ${result.data.name} created (ID ${result.data.id}).`);
    if (provider === "custom") {
      ctx.formatter.info(
        `Run the provisioning command from the Forge server page as root on ${ip_address}.`,
      );
    }
  }, ctx.formatter);
}

/**
 * Reboot a server by ID or name.
 */
export async function serversReboot(args: string[], ctx: CommandContext): Promise<void> {
  const [server] = args;

  if (!server) {
    exitWithValidationError("server_id", "forge servers reboot <server_id>", ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    await rebootServer({ server_id }, execCtx);
    ctx.formatter.success(`Server ${server_id} reboot initiated.`);
  }, ctx.formatter);
}
