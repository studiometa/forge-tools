import {
  createRedirectRule,
  deleteRedirectRule,
  getRedirectRule,
  listRedirectRules,
} from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId, resolveSiteId } from "../../utils/resolve.ts";

function requireServerAndSiteRaw(
  ctx: CommandContext,
  usage: string,
): { server: string; site: string } {
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");

  if (!server) {
    exitWithValidationError("server_id", usage, ctx.formatter);
  }
  if (!site) {
    exitWithValidationError("site_id", usage, ctx.formatter);
  }

  return { server, site };
}

export async function redirectRulesList(ctx: CommandContext): Promise<void> {
  const usage = "forge redirect-rules list --server <server_id> --site <site_id>";
  const { server, site } = requireServerAndSiteRaw(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await listRedirectRules({ server_id, site_id }, execCtx);
    ctx.formatter.outputList(
      result.data,
      ["id", "from", "to", "type"],
      "No redirect rules found.",
      (r) => `${String(r.id).padEnd(8)} ${r.from.padEnd(30)} ${r.to.padEnd(30)} ${r.type}`,
    );
  }, ctx.formatter);
}

export async function redirectRulesGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const usage = "forge redirect-rules get <rule_id> --server <server_id> --site <site_id>";

  if (!id) {
    exitWithValidationError("rule_id", usage, ctx.formatter);
  }

  const { server, site } = requireServerAndSiteRaw(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await getRedirectRule({ server_id, site_id, id }, execCtx);
    ctx.formatter.outputOne(result.data, ["id", "from", "to", "type", "created_at"]);
  }, ctx.formatter);
}

export async function redirectRulesCreate(ctx: CommandContext): Promise<void> {
  const usage =
    "forge redirect-rules create --server <server_id> --site <site_id> --from <from> --to <to>";
  const { server, site } = requireServerAndSiteRaw(ctx, usage);
  const from = String(ctx.options.from ?? "");
  const to = String(ctx.options.to ?? "");

  if (!from) {
    exitWithValidationError("from", usage, ctx.formatter);
  }

  if (!to) {
    exitWithValidationError("to", usage, ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await createRedirectRule({ server_id, site_id, from, to }, execCtx);
    ctx.formatter.outputOne(result.data, ["id", "from", "to", "type", "created_at"]);
  }, ctx.formatter);
}

export async function redirectRulesDelete(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const usage = "forge redirect-rules delete <rule_id> --server <server_id> --site <site_id>";

  if (!id) {
    exitWithValidationError("rule_id", usage, ctx.formatter);
  }

  const { server, site } = requireServerAndSiteRaw(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    await deleteRedirectRule({ server_id, site_id, id }, execCtx);
    ctx.formatter.success(`Redirect rule ${id} deleted.`);
  }, ctx.formatter);
}
