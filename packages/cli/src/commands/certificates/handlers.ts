import type { CertificateAttributes, CreateCertificateData } from "@studiometa/forge-api";
import type { ExecutorContext } from "@studiometa/forge-core";
import {
  activateCertificate,
  createCertificate,
  deactivateCertificate,
  deleteCertificate,
  getCertificate,
  listCertificates,
} from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { readContentFile } from "../../utils/content-source.ts";
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

/**
 * Resolve the server and the site, then run an action on a certificate of the domain.
 */
async function withDomain(
  ctx: CommandContext,
  usage: string,
  run: (
    ids: { server_id: string; site_id: string; domain_id: string },
    execCtx: ExecutorContext,
  ) => Promise<void>,
): Promise<void> {
  const { server, site, domain } = requireServerSiteDomainRaw(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    await run({ server_id, site_id, domain_id: domain }, execCtx);
  }, ctx.formatter);
}

/**
 * Deactivate a certificate of a domain.
 */
export async function certificatesDeactivate(args: string[], ctx: CommandContext): Promise<void> {
  const usage =
    "forge certificates deactivate <certificate_id> --server <server_id> --site <site_id> --domain <domain_id>";
  const [id] = args;
  if (!id) exitWithValidationError("certificate_id", usage, ctx.formatter);

  await withDomain(ctx, usage, async (ids, execCtx) => {
    await deactivateCertificate({ ...ids, id }, execCtx);
    ctx.formatter.success(`Certificate ${id} of domain ${ids.domain_id} deactivated.`);
  });
}

/**
 * Delete a certificate of a domain.
 */
export async function certificatesDelete(args: string[], ctx: CommandContext): Promise<void> {
  const usage =
    "forge certificates delete <certificate_id> --server <server_id> --site <site_id> --domain <domain_id>";
  const [id] = args;
  if (!id) exitWithValidationError("certificate_id", usage, ctx.formatter);

  await withDomain(ctx, usage, async (ids, execCtx) => {
    await deleteCertificate({ ...ids, id }, execCtx);
    ctx.formatter.success(`Certificate ${id} of domain ${ids.domain_id} deleted.`);
  });
}

const CREATE_USAGE =
  "forge certificates create --server <server_id> --site <site_id> --domain <domain_id> --type letsencrypt|existing|csr|clone [options]";

const CSR_FIELDS = ["country", "state", "city", "organization", "department"] as const;

/**
 * Build the certificate request from the options of `forge certificates create`.
 */
function certificateData(ctx: CommandContext): CreateCertificateData {
  const options = ctx.options;
  const type = String(options.type ?? "letsencrypt");
  const enable = options.enable === undefined ? {} : { enable: Boolean(options.enable) };

  switch (type) {
    case "letsencrypt": {
      const method = String(options["verification-method"] ?? "http-01");
      const keyType = String(options["key-type"] ?? "ecdsa");
      if (method !== "http-01" && method !== "dns-01") {
        exitWithValidationError("verification-method", CREATE_USAGE, ctx.formatter);
      }
      if (keyType !== "ecdsa" && keyType !== "rsa") {
        exitWithValidationError("key-type", CREATE_USAGE, ctx.formatter);
      }
      return { type, letsencrypt: { verification_method: method, key_type: keyType } };
    }
    case "existing": {
      const source = { label: "file", usage: CREATE_USAGE, formatter: ctx.formatter };
      return {
        type,
        ...enable,
        existing: {
          key: readContentFile(options["key-file"], "key-file", {
            ...source,
            label: "private key",
          }),
          certificate: readContentFile(options["certificate-file"], "certificate-file", {
            ...source,
            label: "certificate",
          }),
        },
      };
    }
    case "csr": {
      const domain = String(options["csr-domain"] ?? "");
      if (!domain) exitWithValidationError("csr-domain", CREATE_USAGE, ctx.formatter);
      const fields = Object.fromEntries(
        CSR_FIELDS.map((field) => {
          const value = String(options[field] ?? "");
          if (!value) exitWithValidationError(field, CREATE_USAGE, ctx.formatter);
          return [field, value];
        }),
      ) as Record<(typeof CSR_FIELDS)[number], string>;
      return {
        type,
        csr: { domain, ...(options.sans ? { sans: String(options.sans) } : {}), ...fields },
      };
    }
    case "clone": {
      const certificateId = Number(options["certificate-id"]);
      if (!Number.isInteger(certificateId) || certificateId <= 0) {
        exitWithValidationError("certificate-id", CREATE_USAGE, ctx.formatter);
      }
      return { type, ...enable, clone: { certificate_id: certificateId } };
    }
    default:
      return exitWithValidationError("type", CREATE_USAGE, ctx.formatter);
  }
}

/**
 * Create a certificate for a domain.
 */
export async function certificatesCreate(ctx: CommandContext): Promise<void> {
  requireServerSiteDomainRaw(ctx, CREATE_USAGE);
  const data = certificateData(ctx);

  await withDomain(ctx, CREATE_USAGE, async (ids, execCtx) => {
    const result = await createCertificate({ ...ids, ...data }, execCtx);
    if (ctx.formatter.isJson()) {
      ctx.formatter.output(result.data);
      return;
    }
    ctx.formatter.success(
      `Certificate ${result.data.id} (${result.data.type}) requested for domain ${ids.domain_id}.`,
    );
  });
}
