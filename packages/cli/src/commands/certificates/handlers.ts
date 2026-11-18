import type { CertificateAttributes } from "@studiometa/forge-api";
import { activateCertificate, getCertificate, listCertificates } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId, resolveSiteId } from "../../utils/resolve.ts";

const CERTIFICATE_FIELDS: Array<keyof CertificateAttributes | "id"> = [
  "id",
  "type",
  "active",
  "status",
  "request_status",
  "verification_method",
  "key_type",
  "created_at",
];

function requireServerSiteRaw(
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

function requireServerSiteDomainRaw(
  ctx: CommandContext,
  usage: string,
): { server: string; site: string; domain: string } {
  const { server, site } = requireServerSiteRaw(ctx, usage);
  const domain = String(ctx.options.domain ?? "");

  if (!domain) {
    exitWithValidationError("domain_id", usage, ctx.formatter);
  }

  return { server, site, domain };
}

/**
 * List the certificates of a domain, or of every domain of the site without `--domain`.
 */
export async function certificatesList(ctx: CommandContext): Promise<void> {
  const usage =
    "forge certificates list --server <server_id> --site <site_id> [--domain <domain_id>]";
  const { server, site } = requireServerSiteRaw(ctx, usage);
  const domain = ctx.options.domain === undefined ? undefined : String(ctx.options.domain);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await listCertificates(
      { server_id, site_id, ...(domain ? { domain_id: domain } : {}) },
      execCtx,
    );
    ctx.formatter.outputList(
      result.data,
      CERTIFICATE_FIELDS,
      "No certificates found.",
      (cert) =>
        `${String(cert.id).padEnd(8)} ${cert.type.padEnd(12)} ${cert.status.padEnd(12)} ${cert.active ? "active" : ""}`,
    );
  }, ctx.formatter);
}

/**
 * Get a certificate of a domain: the active one, or the one with the given ID.
 */
export async function certificatesGet(args: string[], ctx: CommandContext): Promise<void> {
  const usage =
    "forge certificates get [certificate_id] --server <server_id> --site <site_id> --domain <domain_id>";
  const { server, site, domain } = requireServerSiteDomainRaw(ctx, usage);
  const [id] = args;

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await getCertificate(
      { server_id, site_id, domain_id: domain, ...(id ? { id } : {}) },
      execCtx,
    );
    ctx.formatter.outputOne(result.data, CERTIFICATE_FIELDS);
  }, ctx.formatter);
}

/**
 * Activate a certificate of a domain.
 */
export async function certificatesActivate(args: string[], ctx: CommandContext): Promise<void> {
  const usage =
    "forge certificates activate <certificate_id> --server <server_id> --site <site_id> --domain <domain_id>";
  const [id] = args;

  if (!id) {
    exitWithValidationError("certificate_id", usage, ctx.formatter);
  }

  const { server, site, domain } = requireServerSiteDomainRaw(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    await activateCertificate({ server_id, site_id, domain_id: domain, id }, execCtx);
    ctx.formatter.success(`Certificate ${id} of domain ${domain} activated.`);
  }, ctx.formatter);
}
