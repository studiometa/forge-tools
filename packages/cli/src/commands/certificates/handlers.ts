import { getCertificate, activateCertificate } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId, resolveSiteId } from "../../utils/resolve.ts";

function requireServerSiteDomainRaw(
  ctx: CommandContext,
  usage: string,
): { server: string; site: string; domain: string } {
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");
  const domain = String(ctx.options.domain ?? "");

  if (!server) {
    exitWithValidationError("server_id", usage, ctx.formatter);
  }
  if (!site) {
    exitWithValidationError("site_id", usage, ctx.formatter);
  }
  if (!domain) {
    exitWithValidationError("domain_id", usage, ctx.formatter);
  }

  return { server, site, domain };
}

export async function certificatesGet(args: string[], ctx: CommandContext): Promise<void> {
  const usage = "forge certificates get --server <server_id> --site <site_id> --domain <domain_id>";

  const { server, site, domain } = requireServerSiteDomainRaw(ctx, usage);

  // Allow positional domain_id as first arg for convenience
  const domainId = args[0] || domain;

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await getCertificate({ server_id, site_id, domain_id: domainId }, execCtx);
    ctx.formatter.outputOne(result.data, [
      "id",
      "type",
      "verification_method",
      "key_type",
      "status",
      "request_status",
      "created_at",
    ]);
  }, ctx.formatter);
}

export async function certificatesActivate(args: string[], ctx: CommandContext): Promise<void> {
  const usage =
    "forge certificates activate --server <server_id> --site <site_id> --domain <domain_id>";

  const { server, site, domain } = requireServerSiteDomainRaw(ctx, usage);

  // Allow positional domain_id as first arg for convenience
  const domainId = args[0] || domain;

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    await activateCertificate({ server_id, site_id, domain_id: domainId }, execCtx);
    ctx.formatter.success(`Certificate for domain ${domainId} activated.`);
  }, ctx.formatter);
}
