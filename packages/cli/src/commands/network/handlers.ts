import { getServerNetwork, updateServerNetwork } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId } from "../../utils/resolve.ts";

/**
 * List the servers in the network of a server.
 */
export async function networkGet(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");
  if (!server) {
    exitWithValidationError("server_id", "forge network get --server <server_id>", ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await getServerNetwork({ server_id }, execCtx);
    ctx.formatter.outputList(
      result.data,
      ["id", "name", "private_ip_address"],
      "No servers in the network.",
      (s) => `${String(s.id).padEnd(8)} ${s.name.padEnd(30)} ${s.private_ip_address ?? "—"}`,
    );
  }, ctx.formatter);
}

/**
 * Set the network of a server: `--servers` (IDs or names, comma-separated) replaces it.
 */
export async function networkUpdate(ctx: CommandContext): Promise<void> {
  const usage = "forge network update --server <server_id> --servers <id,id,...>";
  const server = String(ctx.options.server ?? "");
  const servers = ctx.options.servers;

  if (!server) {
    exitWithValidationError("server_id", usage, ctx.formatter);
  }
  if (typeof servers !== "string") {
    exitWithValidationError("servers", usage, ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const names = servers
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);
    const ids: number[] = [];
    for (const name of names) ids.push(Number(await resolveServerId(name, execCtx)));
    await updateServerNetwork({ server_id, servers: ids }, execCtx);
    ctx.formatter.success(`Network of server ${server_id} updated.`);
  }, ctx.formatter);
}
