import { writeFileSync } from "node:fs";

import {
  createRedirectRule,
  deleteRedirectRule,
  exportRedirectRules,
  getRedirectRule,
  importRedirectRules,
  listRedirectRules,
  reorderRedirectRules,
} from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { readContentFile } from "../../utils/content-source.ts";
import { printContent } from "../../utils/print-content.ts";
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
  const type = String(ctx.options.type ?? "redirect");

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
    await createRedirectRule({ server_id, site_id, from, to, type }, execCtx);
    ctx.formatter.success("Redirect rule created.");
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

/**
 * Print the redirect rules of a site as CSV, or write them to `--output`.
 */
export async function redirectRulesExport(ctx: CommandContext): Promise<void> {
  const usage =
    "forge redirect-rules export --server <server_id> --site <site_id> [--output <file>]";
  const { server, site } = requireServerAndSiteRaw(ctx, usage);
  const output = ctx.options.output;

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const csv = (await exportRedirectRules({ server_id, site_id }, execCtx)).data;
    if (typeof output === "string" && output) {
      writeFileSync(output, csv);
      ctx.formatter.success(`Redirect rules written to ${output}.`);
    } else {
      printContent(csv);
    }
  }, ctx.formatter);
}

/**
 * Import redirect rules from a CSV file (`from,to,type` header row).
 */
export async function redirectRulesImport(ctx: CommandContext): Promise<void> {
  const usage =
    "forge redirect-rules import --server <server_id> --site <site_id> --file <path|-> [--mode append|replace]";
  const { server, site } = requireServerAndSiteRaw(ctx, usage);
  const mode = String(ctx.options.mode ?? "append");

  if (mode !== "append" && mode !== "replace") {
    exitWithValidationError("mode", usage, ctx.formatter);
  }

  const csv = readContentFile(ctx.options.file, "file", {
    label: "CSV file",
    usage,
    formatter: ctx.formatter,
  });

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await importRedirectRules({ server_id, site_id, csv, mode }, execCtx);
    ctx.formatter.success(`${result.data.imported} redirect rule(s) imported.`);
  }, ctx.formatter);
}

/**
 * Set the order of the redirect rules of a site from `--ids` (every rule ID, in order).
 */
export async function redirectRulesReorder(ctx: CommandContext): Promise<void> {
  const usage =
    "forge redirect-rules reorder --server <server_id> --site <site_id> --ids <id,id,...>";
  const { server, site } = requireServerAndSiteRaw(ctx, usage);
  const ids =
    typeof ctx.options.ids === "string"
      ? ctx.options.ids
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
          .map(Number)
      : [];

  if (ids.length === 0 || ids.some((id) => !Number.isInteger(id))) {
    exitWithValidationError("ids", usage, ctx.formatter);
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    await reorderRedirectRules({ server_id, site_id, redirects: ids }, execCtx);
    ctx.formatter.success("Redirect rules reordered.");
  }, ctx.formatter);
}
