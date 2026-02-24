import { listCertificates, getCertificate, activateCertificate } from "@studiometa/forge-core";

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

export async function certificatesList(ctx: CommandContext): Promise<void> {
  const usage = "forge-cli certificates list --server <server_id> --site <site_id>";
  const { server_id, site_id } = requireServerAndSite(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await listCertificates({ server_id, site_id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function certificatesGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const usage = "forge-cli certificates get <cert_id> --server <server_id> --site <site_id>";

  if (!id) {
    exitWithValidationError("certificate_id", usage, ctx.formatter);
  }

  const { server_id, site_id } = requireServerAndSite(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await getCertificate({ server_id, site_id, id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function certificatesActivate(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const usage = "forge-cli certificates activate <cert_id> --server <server_id> --site <site_id>";

  if (!id) {
    exitWithValidationError("certificate_id", usage, ctx.formatter);
  }

  const { server_id, site_id } = requireServerAndSite(ctx, usage);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    await activateCertificate({ server_id, site_id, id }, execCtx);
    ctx.formatter.success(`Certificate ${id} activated.`);
  }, ctx.formatter);
}
