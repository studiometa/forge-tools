import { listDeployments, deploySite } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";

export async function deploymentsList(ctx: CommandContext): Promise<void> {
  const server_id = String(ctx.options.server ?? "");
  const site_id = String(ctx.options.site ?? "");

  if (!server_id) {
    exitWithValidationError(
      "server_id",
      "forge-cli deployments list --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  if (!site_id) {
    exitWithValidationError(
      "site_id",
      "forge-cli deployments list --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const result = await listDeployments({ server_id, site_id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function deploymentsDeploy(ctx: CommandContext): Promise<void> {
  const server_id = String(ctx.options.server ?? "");
  const site_id = String(ctx.options.site ?? "");

  if (!server_id) {
    exitWithValidationError(
      "server_id",
      "forge-cli deployments deploy --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  if (!site_id) {
    exitWithValidationError(
      "site_id",
      "forge-cli deployments deploy --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    await deploySite({ server_id, site_id }, execCtx);
    ctx.formatter.success(`Deployment triggered for site ${site_id}.`);
  }, ctx.formatter);
}
