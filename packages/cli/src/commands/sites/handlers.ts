import { listSites, getSite, updateSite } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId, resolveSiteId } from "../../utils/resolve.ts";

export async function sitesList(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");

  if (!server) {
    exitWithValidationError("server_id", "forge sites list --server <server_id>", ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await listSites({ server_id }, execCtx);
    ctx.formatter.outputList(
      result.data,
      ["id", "name", "status", "php_version"],
      "No sites found.",
      (s) =>
        `${String(s.id).padEnd(8)} ${s.name.padEnd(40)} ${s.status.padEnd(12)} ${s.php_version}`,
    );
  }, ctx.formatter);
}

export async function sitesGet(args: string[], ctx: CommandContext): Promise<void> {
  const [siteArg] = args;
  const server = String(ctx.options.server ?? "");

  if (!siteArg) {
    exitWithValidationError(
      "site_id",
      "forge sites get <site_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge sites get <site_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(siteArg, server_id, execCtx);
    const result = await getSite({ server_id, site_id }, execCtx);
    ctx.formatter.outputOne(result.data, [
      "id",
      "name",
      "status",
      "php_version",
      "app_type",
      "repository",
      "quick_deploy",
      "deployment_status",
      "https",
      "created_at",
    ]);
  }, ctx.formatter);
}

export async function sitesUpdate(args: string[], ctx: CommandContext): Promise<void> {
  const [siteArg] = args;
  const server = String(ctx.options.server ?? "");

  if (!siteArg) {
    exitWithValidationError(
      "site_id",
      "forge sites update <site_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge sites update <site_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(siteArg, server_id, execCtx);
    const result = await updateSite(
      {
        server_id,
        site_id,
        root_path: ctx.options.root_path as string | undefined,
        directory: ctx.options.directory as string | undefined,
        type: ctx.options.type as string | undefined,
        php_version: ctx.options.php_version as string | undefined,
        push_to_deploy:
          ctx.options.push_to_deploy !== undefined
            ? ctx.options.push_to_deploy === "true" || ctx.options.push_to_deploy === true
            : undefined,
        repository_branch: ctx.options.repository_branch as string | undefined,
      },
      execCtx,
    );
    ctx.formatter.outputOne(result.data, [
      "id",
      "name",
      "status",
      "php_version",
      "app_type",
      "repository",
      "quick_deploy",
      "deployment_status",
      "https",
      "created_at",
    ]);
  }, ctx.formatter);
}
