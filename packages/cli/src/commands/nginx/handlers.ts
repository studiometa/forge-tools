import { getNginxConfig, updateNginxConfig } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";

export async function nginxGet(ctx: CommandContext): Promise<void> {
  const server_id = String(ctx.options.server ?? "");
  const site_id = String(ctx.options.site ?? "");

  if (!server_id) {
    exitWithValidationError(
      "server_id",
      "forge-cli nginx get --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  if (!site_id) {
    exitWithValidationError(
      "site_id",
      "forge-cli nginx get --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await getNginxConfig({ server_id, site_id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function nginxUpdate(ctx: CommandContext): Promise<void> {
  const server_id = String(ctx.options.server ?? "");
  const site_id = String(ctx.options.site ?? "");
  const content = String(ctx.options.content ?? "");

  if (!server_id) {
    exitWithValidationError(
      "server_id",
      "forge-cli nginx update --server <server_id> --site <site_id> --content <content>",
      ctx.formatter,
    );
  }

  if (!site_id) {
    exitWithValidationError(
      "site_id",
      "forge-cli nginx update --server <server_id> --site <site_id> --content <content>",
      ctx.formatter,
    );
  }

  if (!content) {
    exitWithValidationError(
      "content",
      "forge-cli nginx update --server <server_id> --site <site_id> --content <content>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    await updateNginxConfig({ server_id, site_id, content }, execCtx);
    ctx.formatter.success("Nginx configuration updated.");
  }, ctx.formatter);
}
