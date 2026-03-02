import { listCertificates, getCertificate, activateCertificate } from "@studiometa/forge-core";

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

export async function certificatesList(ctx: CommandContext): Promise<void> {
  const usage = "forge certificates list --server <server_id> --site <site_id>";
  const { server, site } = requireServerAndSiteRaw(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await listCertificates({ server_id, site_id }, execCtx);
    ctx.formatter.outputList(
      result.data,
      ["id", "domain", "type", "status", "active"],
      "No certificates found.",
      (c) =>
        `${String(c.id).padEnd(8)} ${c.domain.padEnd(40)} ${c.type.padEnd(10)} ${c.status.padEnd(12)} ${c.active ? "active" : "—"}`,
    );
  }, ctx.formatter);
}

export async function certificatesGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const usage = "forge certificates get <cert_id> --server <server_id> --site <site_id>";

  if (!id) {
    exitWithValidationError("certificate_id", usage, ctx.formatter);
  }

  const { server, site } = requireServerAndSiteRaw(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await getCertificate({ server_id, site_id, id }, execCtx);
    ctx.formatter.outputOne(result.data, [
      "id",
      "domain",
      "type",
      "status",
      "request_status",
      "active",
      "existing",
      "created_at",
    ]);
  }, ctx.formatter);
}

export async function certificatesActivate(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const usage = "forge certificates activate <cert_id> --server <server_id> --site <site_id>";

  if (!id) {
    exitWithValidationError("certificate_id", usage, ctx.formatter);
  }

  const { server, site } = requireServerAndSiteRaw(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    await activateCertificate({ server_id, site_id, id }, execCtx);
    ctx.formatter.success(`Certificate ${id} activated.`);
  }, ctx.formatter);
}
