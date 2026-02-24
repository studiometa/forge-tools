import { createCommand, getCommand, listCommands } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";

function requireServerAndSite(
  ctx: CommandContext,
  usage: string,
): { server_id: string; site_id: string } {
  const server_id = String(ctx.options.server ?? "");
  const site_id = String(ctx.options.site ?? "");

  if (!server_id) {
    exitWithValidationError("server_id", usage, ctx.formatter);
  }
  if (!site_id) {
    exitWithValidationError("site_id", usage, ctx.formatter);
  }

  return { server_id, site_id };
}

export async function commandsList(ctx: CommandContext): Promise<void> {
  const usage = "forge-cli commands list --server <server_id> --site <site_id>";
  const { server_id, site_id } = requireServerAndSite(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await listCommands({ server_id, site_id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function commandsGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const usage = "forge-cli commands get <command_id> --server <server_id> --site <site_id>";

  if (!id) {
    exitWithValidationError("command_id", usage, ctx.formatter);
  }

  const { server_id, site_id } = requireServerAndSite(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await getCommand({ server_id, site_id, id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function commandsCreate(ctx: CommandContext): Promise<void> {
  const usage =
    "forge-cli commands create --server <server_id> --site <site_id> --command <command>";
  const { server_id, site_id } = requireServerAndSite(ctx, usage);
  const command = String(ctx.options.command ?? "");

  if (!command) {
    exitWithValidationError("command", usage, ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await createCommand({ server_id, site_id, command }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}
