import {
  createRedirectRule,
  deleteRedirectRule,
  getRedirectRule,
  listRedirectRules,
} from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";

function requireServerAndSite(
  ctx: CommandContext,
  usage: string,
): { server_id: string; site_id: string } {
  const server_id = String(ctx.options.server ?? "");
  const site_id = String(ctx.options.site ?? "");

  if (!server_id) {
    exitWithValidationError("server_id", usage, ctx.formatter);
  }
  if (!site_id) {
    exitWithValidationError("site_id", usage, ctx.formatter);
  }

  return { server_id, site_id };
}

export async function redirectRulesList(ctx: CommandContext): Promise<void> {
  const usage = "forge-cli redirect-rules list --server <server_id> --site <site_id>";
  const { server_id, site_id } = requireServerAndSite(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await listRedirectRules({ server_id, site_id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function redirectRulesGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const usage = "forge-cli redirect-rules get <rule_id> --server <server_id> --site <site_id>";

  if (!id) {
    exitWithValidationError("rule_id", usage, ctx.formatter);
  }

  const { server_id, site_id } = requireServerAndSite(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await getRedirectRule({ server_id, site_id, id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function redirectRulesCreate(ctx: CommandContext): Promise<void> {
  const usage =
    "forge-cli redirect-rules create --server <server_id> --site <site_id> --from <from> --to <to>";
  const { server_id, site_id } = requireServerAndSite(ctx, usage);
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
    const result = await createRedirectRule({ server_id, site_id, from, to }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function redirectRulesDelete(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const usage = "forge-cli redirect-rules delete <rule_id> --server <server_id> --site <site_id>";

  if (!id) {
    exitWithValidationError("rule_id", usage, ctx.formatter);
  }

  const { server_id, site_id } = requireServerAndSite(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    await deleteRedirectRule({ server_id, site_id, id }, execCtx);
    ctx.formatter.success(`Redirect rule ${id} deleted.`);
  }, ctx.formatter);
}
