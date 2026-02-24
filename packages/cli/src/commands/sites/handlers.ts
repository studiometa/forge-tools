import { listSites, getSite } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";

export async function sitesList(ctx: CommandContext): Promise<void> {
  const server_id = String(ctx.options.server ?? "");

  if (!server_id) {
    exitWithValidationError(
      "server_id",
      "forge-cli sites list --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await listSites({ server_id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function sitesGet(args: string[], ctx: CommandContext): Promise<void> {
  const [site_id] = args;
  const server_id = String(ctx.options.server ?? "");

  if (!site_id) {
    exitWithValidationError(
      "site_id",
      "forge-cli sites get <site_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server_id) {
    exitWithValidationError(
      "server_id",
      "forge-cli sites get <site_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await getSite({ server_id, site_id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}
