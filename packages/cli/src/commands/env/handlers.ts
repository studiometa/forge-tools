import { getEnv, updateEnv } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";

export async function envGet(ctx: CommandContext): Promise<void> {
  const server_id = String(ctx.options.server ?? "");
  const site_id = String(ctx.options.site ?? "");

  if (!server_id) {
    exitWithValidationError(
      "server_id",
      "forge-cli env get --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  if (!site_id) {
    exitWithValidationError(
      "site_id",
      "forge-cli env get --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await getEnv({ server_id, site_id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function envUpdate(ctx: CommandContext): Promise<void> {
  const server_id = String(ctx.options.server ?? "");
  const site_id = String(ctx.options.site ?? "");
  const content = String(ctx.options.content ?? "");

  if (!server_id) {
    exitWithValidationError(
      "server_id",
      "forge-cli env update --server <server_id> --site <site_id> --content <content>",
      ctx.formatter,
    );
  }

  if (!site_id) {
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
    await updateEnv({ server_id, site_id, content }, execCtx);
    ctx.formatter.success("Environment variables updated.");
  }, ctx.formatter);
}
