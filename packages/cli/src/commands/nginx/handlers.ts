import { getNginxConfig, updateNginxConfig } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId, resolveSiteId } from "../../utils/resolve.ts";

export async function nginxGet(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge nginx get --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  if (!site) {
    exitWithValidationError(
      "site_id",
      "forge nginx get --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await getNginxConfig({ server_id, site_id }, execCtx);
    if (ctx.formatter.isJson()) {
      console.log(JSON.stringify({ content: result.data }));
    } else {
      console.log(result.data);
    }
  }, ctx.formatter);
}

export async function nginxUpdate(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");
  const content = String(ctx.options.content ?? "");

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge nginx update --server <server_id> --site <site_id> --content <content>",
      ctx.formatter,
    );
  }

  if (!site) {
    exitWithValidationError(
      "site_id",
      "forge nginx update --server <server_id> --site <site_id> --content <content>",
      ctx.formatter,
    );
  }

  if (!content) {
    exitWithValidationError(
      "content",
      "forge nginx update --server <server_id> --site <site_id> --content <content>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    await updateNginxConfig({ server_id, site_id, content }, execCtx);
    ctx.formatter.success("Nginx configuration updated.");
  }, ctx.formatter);
}
