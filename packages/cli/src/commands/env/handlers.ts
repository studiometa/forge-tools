import { getEnv, updateEnv } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { readContentOption } from "../../utils/content-source.ts";
import { reportDrift } from "../../utils/drift.ts";
import { printContent } from "../../utils/print-content.ts";
import { resolveServerId, resolveSiteId } from "../../utils/resolve.ts";
import { envDrift } from "./env-diff.ts";

export async function envGet(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge env get --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  if (!site) {
    exitWithValidationError(
      "site_id",
      "forge env get --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await getEnv({ server_id, site_id }, execCtx);
    if (ctx.formatter.isJson()) {
      console.log(JSON.stringify({ content: result.data }));
    } else {
      printContent(result.data);
    }
  }, ctx.formatter);
}

export async function envUpdate(ctx: CommandContext): Promise<void> {
  const usage =
    "forge env update --server <server_id> --site <site_id> (--file <path|-> | --content <content>) [--check]";
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
    label: "environment file",
    usage,
    formatter: ctx.formatter,
  });

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    if (check) {
      const remote = await getEnv({ server_id, site_id }, execCtx);
      reportDrift("environment file", envDrift(remote.data, content), ctx.formatter);
      return;
    }

    await updateEnv({ server_id, site_id, content }, execCtx);
    ctx.formatter.success("Environment variables updated.");
  }, ctx.formatter);
}
