import { createCommand, getCommand, listCommands } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId, resolveSiteId } from "../../utils/resolve.ts";

function requireServerAndSiteRaw(
  ctx: CommandContext,
  usage: string,
): { server: string; site: string } {
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");

  if (!server) {
    exitWithValidationError("server_id", usage, ctx.formatter);
  }
  if (!site) {
    exitWithValidationError("site_id", usage, ctx.formatter);
  }

  return { server, site };
}

export async function commandsList(ctx: CommandContext): Promise<void> {
  const usage = "forge-cli commands list --server <server_id> --site <site_id>";
  const { server, site } = requireServerAndSiteRaw(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await listCommands({ server_id, site_id }, execCtx);
    ctx.formatter.outputList(
      result.data,
      ["id", "command", "status", "created_at"],
      "No commands found.",
      (c) =>
        `${String(c.id).padEnd(8)} ${c.command.padEnd(50)} ${c.status.padEnd(12)} ${c.created_at}`,
    );
  }, ctx.formatter);
}

export async function commandsGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const usage = "forge-cli commands get <command_id> --server <server_id> --site <site_id>";

  if (!id) {
    exitWithValidationError("command_id", usage, ctx.formatter);
  }

  const { server, site } = requireServerAndSiteRaw(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await getCommand({ server_id, site_id, id }, execCtx);
    ctx.formatter.outputOne(result.data, [
      "id", "command", "status", "user_name", "created_at",
    ]);
  }, ctx.formatter);
}

export async function commandsCreate(ctx: CommandContext): Promise<void> {
  const usage =
    "forge-cli commands create --server <server_id> --site <site_id> --command <command>";
  const { server, site } = requireServerAndSiteRaw(ctx, usage);
  const command = String(ctx.options.command ?? "");

  if (!command) {
    exitWithValidationError("command", usage, ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await createCommand({ server_id, site_id, command }, execCtx);
    ctx.formatter.outputOne(result.data, ["id", "command", "status", "created_at"]);
  }, ctx.formatter);
}
