import { listSites, getSite } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId } from "../../utils/resolve.ts";

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
  const [site_id] = args;
  const server = String(ctx.options.server ?? "");

  if (!site_id) {
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
    const result = await getSite({ server_id, site_id }, execCtx);
    ctx.formatter.outputOne(result.data, [
      "id",
      "name",
      "status",
      "php_version",
      "project_type",
      "repository",
      "repository_branch",
      "quick_deploy",
      "deployment_status",
      "is_secured",
      "created_at",
    ]);
  }, ctx.formatter);
}
