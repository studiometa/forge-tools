import { getNginxConfig, updateNginxConfig } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { readContentOption } from "../../utils/content-source.ts";
import { reportTextDrift } from "../../utils/drift.ts";
import { printContent } from "../../utils/print-content.ts";
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
      printContent(result.data);
    }
  }, ctx.formatter);
}

export async function nginxUpdate(ctx: CommandContext): Promise<void> {
  const usage =
    "forge nginx update --server <server_id> --site <site_id> (--file <path|-> | --content <content>) [--check]";
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");
  const check = Boolean(ctx.options.check);

  if (!server) {
    exitWithValidationError("server_id", usage, ctx.formatter);
  }

  if (!site) {
    exitWithValidationError("site_id", usage, ctx.formatter);
  }

  const content = readContentOption(ctx.options, {
    label: "nginx configuration",
    usage,
    formatter: ctx.formatter,
  });

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    if (check) {
      const remote = await getNginxConfig({ server_id, site_id }, execCtx);
      reportTextDrift("nginx configuration", remote.data, content, ctx.formatter);
      return;
    }

    await updateNginxConfig({ server_id, site_id, content }, execCtx);
    ctx.formatter.success("Nginx configuration updated.");
  }, ctx.formatter);
}
