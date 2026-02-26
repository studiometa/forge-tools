import { getEnv, updateEnv } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId, resolveSiteId } from "../../utils/resolve.ts";

export async function envGet(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli env get --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  if (!site) {
    exitWithValidationError(
      "site_id",
      "forge-cli env get --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await getEnv({ server_id, site_id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function envUpdate(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");
  const content = String(ctx.options.content ?? "");

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli env update --server <server_id> --site <site_id> --content <content>",
      ctx.formatter,
    );
  }

  if (!site) {
    exitWithValidationError(
      "site_id",
      "forge-cli env update --server <server_id> --site <site_id> --content <content>",
      ctx.formatter,
    );
  }

  if (!content) {
    exitWithValidationError(
      "content",
      "forge-cli env update --server <server_id> --site <site_id> --content <content>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    await updateEnv({ server_id, site_id, content }, execCtx);
    ctx.formatter.success("Environment variables updated.");
  }, ctx.formatter);
}
