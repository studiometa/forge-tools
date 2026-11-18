import { createSiteDeployKey, deleteSiteDeployKey, getSiteDeployKey } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";
import type { ExecutorContext } from "@studiometa/forge-core";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId, resolveSiteId } from "../../utils/resolve.ts";

/**
 * Run an action on the deploy key of the site of `--server` and `--site`.
 */
async function withSite(
  ctx: CommandContext,
  subcommand: string,
  run: (ids: { server_id: string; site_id: string }, execCtx: ExecutorContext) => Promise<void>,
): Promise<void> {
  const usage = `forge deploy-key ${subcommand} --server <server_id> --site <site_id>`;
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");
  if (!server) exitWithValidationError("server_id", usage, ctx.formatter);
  if (!site) exitWithValidationError("site_id", usage, ctx.formatter);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    await run({ server_id, site_id }, execCtx);
  }, ctx.formatter);
}

function printKey(ctx: CommandContext, key: string | null): void {
  if (ctx.formatter.isJson()) {
    ctx.formatter.output({ key });
  } else if (key) {
    console.log(key);
  } else {
    ctx.formatter.info("The site has no deploy key.");
  }
}

/**
 * Print the deploy key of a site.
 */
export async function deployKeyGet(ctx: CommandContext): Promise<void> {
  await withSite(ctx, "get", async (ids, execCtx) => {
    printKey(ctx, (await getSiteDeployKey(ids, execCtx)).data.key);
  });
}

/**
 * Create a deploy key for a site (or get the one it has) and print it.
 */
export async function deployKeyCreate(ctx: CommandContext): Promise<void> {
  await withSite(ctx, "create", async (ids, execCtx) => {
    printKey(ctx, (await createSiteDeployKey(ids, execCtx)).data.key);
  });
}

/**
 * Delete the deploy key of a site.
 */
export async function deployKeyDelete(ctx: CommandContext): Promise<void> {
  await withSite(ctx, "delete", async (ids, execCtx) => {
    await deleteSiteDeployKey(ids, execCtx);
    ctx.formatter.success(`Deploy key of site ${ids.site_id} deleted.`);
  });
}
