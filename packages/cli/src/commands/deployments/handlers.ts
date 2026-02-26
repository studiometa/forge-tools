import { listDeployments, deploySiteAndWait } from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId, resolveSiteId } from "../../utils/resolve.ts";

export async function deploymentsList(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli deployments list --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  if (!site) {
    exitWithValidationError(
      "site_id",
      "forge-cli deployments list --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await listDeployments({ server_id, site_id }, execCtx);
    ctx.formatter.outputList(
      result.data,
      ["id", "status", "commit_hash", "started_at"],
      "No deployments found.",
      (d) =>
        `${String(d.id).padEnd(8)} ${d.status.padEnd(12)} ${(d.commit_hash ?? "—").padEnd(10)} ${d.started_at}`,
    );
  }, ctx.formatter);
}

export async function deploymentsDeploy(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli deployments deploy --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  if (!site) {
    exitWithValidationError(
      "site_id",
      "forge-cli deployments deploy --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);

    const result = await deploySiteAndWait(
      {
        server_id,
        site_id,
        onProgress: ({ status, elapsed_ms }) => {
          process.stderr.write(`\rDeploying… ${status} (${(elapsed_ms / 1000).toFixed(1)}s)`);
        },
      },
      execCtx,
    );

    // Clear the progress line
    process.stderr.write("\n");

    const elapsedSec = (result.data.elapsed_ms / 1000).toFixed(1);

    if (result.data.status === "success") {
      ctx.formatter.success(`Deployment succeeded for site ${site_id} (${elapsedSec}s).`);
    } else {
      ctx.formatter.success(`Deployment failed for site ${site_id} (${elapsedSec}s).`);
    }

    if (result.data.log) {
      ctx.formatter.output(result.data.log);
    }
  }, ctx.formatter);
}
