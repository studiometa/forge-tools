import {
  getDomainNginxConfig,
  getNginxConfig,
  updateDomainNginxConfig,
  updateNginxConfig,
} from "@studiometa/forge-core";
import type { ExecutorContext } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { readContentOption } from "../../utils/content-source.ts";
import { reportTextDrift } from "../../utils/drift.ts";
import { resolveServerId, resolveSiteId } from "../../utils/resolve.ts";

interface NginxTarget {
  server_id: string;
  site_id: string;
  /** Domain record ID or domain name; empty for the site configuration. */
  domain: string;
}

/**
 * Read the --server, --site and optional --domain options.
 * Exits with a validation error when --server or --site is missing,
 * or when --domain is given without a value.
 */
function readTarget(ctx: CommandContext, usage: string): NginxTarget {
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");
  const { domain } = ctx.options;

  if (!server) {
    exitWithValidationError("server_id", usage, ctx.formatter);
  }

  if (!site) {
    exitWithValidationError("site_id", usage, ctx.formatter);
  }

  if (domain !== undefined && (typeof domain !== "string" || !domain)) {
    exitWithValidationError("domain", usage, ctx.formatter);
  }

  return { server_id: server, site_id: site, domain: domain ?? "" };
}

/**
 * Resolve server and site names to IDs. The domain is resolved by the core executors.
 */
async function resolveTarget(target: NginxTarget, execCtx: ExecutorContext): Promise<NginxTarget> {
  const server_id = await resolveServerId(target.server_id, execCtx);
  const site_id = await resolveSiteId(target.site_id, server_id, execCtx);
  return { server_id, site_id, domain: target.domain };
}

/**
 * Get the Nginx configuration of the site, or of one domain when a domain is given.
 */
async function fetchConfig(
  { domain, ...site }: NginxTarget,
  execCtx: ExecutorContext,
): Promise<string> {
  const result = domain
    ? await getDomainNginxConfig({ ...site, domain }, execCtx)
    : await getNginxConfig(site, execCtx);
  return result.data;
}

export async function nginxGet(ctx: CommandContext): Promise<void> {
  const target = readTarget(
    ctx,
    "forge nginx get --server <server_id> --site <site_id> [--domain <domain>]",
  );

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const content = await fetchConfig(await resolveTarget(target, execCtx), execCtx);
    if (ctx.formatter.isJson()) {
      console.log(JSON.stringify({ content }));
    } else {
      console.log(content);
    }
  }, ctx.formatter);
}

export async function nginxUpdate(ctx: CommandContext): Promise<void> {
  const usage =
    "forge nginx update --server <server_id> --site <site_id> [--domain <domain>] (--file <path|-> | --content <content>) [--check]";
  const target = readTarget(ctx, usage);
  const check = Boolean(ctx.options.check);

  const content = readContentOption(ctx.options, {
    label: "nginx configuration",
    usage,
    formatter: ctx.formatter,
  });

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const resolved = await resolveTarget(target, execCtx);
    if (check) {
      const remote = await fetchConfig(resolved, execCtx);
      reportTextDrift("nginx configuration", remote, content, ctx.formatter);
      return;
    }

    const { domain, ...site } = resolved;
    if (domain) {
      await updateDomainNginxConfig({ ...site, domain, content }, execCtx);
      ctx.formatter.success(`Nginx configuration for domain ${domain} updated.`);
    } else {
      await updateNginxConfig({ ...site, content }, execCtx);
      ctx.formatter.success("Nginx configuration updated.");
    }
  }, ctx.formatter);
}
