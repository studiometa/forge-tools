import {
  createSecurityRule,
  deleteSecurityRule,
  getSecurityRule,
  listSecurityRules,
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

export async function securityRulesList(ctx: CommandContext): Promise<void> {
  const usage = "forge security-rules list --server <server_id> --site <site_id>";
  const { server, site } = requireServerAndSiteRaw(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await listSecurityRules({ server_id, site_id }, execCtx);
    ctx.formatter.outputList(
      result.data,
      ["id", "name", "path"],
      "No security rules found.",
      (r) => `${String(r.id).padEnd(8)} ${r.name.padEnd(30)} ${r.path ?? "—"}`,
    );
  }, ctx.formatter);
}

export async function securityRulesGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const usage = "forge security-rules get <rule_id> --server <server_id> --site <site_id>";

  if (!id) {
    exitWithValidationError("rule_id", usage, ctx.formatter);
  }

  const { server, site } = requireServerAndSiteRaw(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await getSecurityRule({ server_id, site_id, id }, execCtx);
    ctx.formatter.outputOne(result.data, ["id", "name", "path", "credentials", "created_at"]);
  }, ctx.formatter);
}

export async function securityRulesCreate(ctx: CommandContext): Promise<void> {
  const usage = "forge security-rules create --server <server_id> --site <site_id> --name <name>";
  const { server, site } = requireServerAndSiteRaw(ctx, usage);
  const name = String(ctx.options.name ?? "");

  if (!name) {
    exitWithValidationError("name", usage, ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await createSecurityRule({ server_id, site_id, name, credentials: [] }, execCtx);
    ctx.formatter.outputOne(result.data, ["id", "name", "path", "created_at"]);
  }, ctx.formatter);
}

export async function securityRulesDelete(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const usage = "forge security-rules delete <rule_id> --server <server_id> --site <site_id>";

  if (!id) {
    exitWithValidationError("rule_id", usage, ctx.formatter);
  }

  const { server, site } = requireServerAndSiteRaw(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    await deleteSecurityRule({ server_id, site_id, id }, execCtx);
    ctx.formatter.success(`Security rule ${id} deleted.`);
  }, ctx.formatter);
}
