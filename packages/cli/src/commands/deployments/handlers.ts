import {
  listDeployments,
  deploySiteAndWait,
  getDeploymentLog,
  getDeploymentScript,
  updateDeploymentScript,
} from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { ApiError } from "../../errors.ts";
import { readContentFile, readContentOption } from "../../utils/content-source.ts";
import { reportTextDrift } from "../../utils/drift.ts";
import { resolveServerId, resolveSiteId } from "../../utils/resolve.ts";

export async function deploymentsList(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge deployments list --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  if (!site) {
    exitWithValidationError(
      "site_id",
      "forge deployments list --server <server_id> --site <site_id>",
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
      ["id", "status", "commit", "started_at"],
      "No deployments found.",
      (d) =>
        `${String(d.id).padEnd(8)} ${d.status.padEnd(12)} ${(d.commit.hash ?? "—").padEnd(10)} ${d.started_at}`,
    );
  }, ctx.formatter);
}

export async function deploymentsLogs(args: string[], ctx: CommandContext): Promise<void> {
  const [deploymentId] = args;
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge deployments logs [deployment_id] --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  if (!site) {
    exitWithValidationError(
      "site_id",
      "forge deployments logs [deployment_id] --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);

    let deployment_id = deploymentId;
    if (!deployment_id) {
      const deployments = await listDeployments({ server_id, site_id }, execCtx);
      if (deployments.data.length === 0) {
        ctx.formatter.info("No deployments found.");
        return;
      }
      deployment_id = String(deployments.data[0].id);
    }

    const result = await getDeploymentLog({ server_id, site_id, deployment_id }, execCtx);
    if (result.data) {
      ctx.formatter.outputText(result.data);
    } else {
      ctx.formatter.info("No log output available.");
    }
  }, ctx.formatter);
}

export async function deploymentsScript(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge deployments script --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  if (!site) {
    exitWithValidationError(
      "site_id",
      "forge deployments script --server <server_id> --site <site_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    const result = await getDeploymentScript({ server_id, site_id }, execCtx);
    if (ctx.formatter.isJson()) {
      console.log(JSON.stringify({ content: result.data }));
    } else {
      // Keep the content as it is, so `script > deploy.sh` round-trips without drift.
      process.stdout.write(result.data.endsWith("\n") ? result.data : `${result.data}\n`);
    }
  }, ctx.formatter);
}

export async function deploymentsUpdateScript(ctx: CommandContext): Promise<void> {
  const usage =
    "forge deployments update-script --server <server_id> --site <site_id> (--file <path|-> | --content <script>) [--check]";
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");
  const check = Boolean(ctx.options.check);

  if (!server) {
    exitWithValidationError("server_id", usage, ctx.formatter);
  }

  if (!site) {
    exitWithValidationError("site_id", usage, ctx.formatter);
  }

  const script = readContentOption(ctx.options, {
    label: "deployment script",
    usage,
    formatter: ctx.formatter,
  });

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
    if (check) {
      const remote = await getDeploymentScript({ server_id, site_id }, execCtx);
      reportTextDrift("deployment script", remote.data, script, ctx.formatter);
      return;
    }

    await updateDeploymentScript({ server_id, site_id, content: script }, execCtx);
    ctx.formatter.success("Deployment script updated.");
  }, ctx.formatter);
}

export async function deploymentsDeploy(ctx: CommandContext): Promise<void> {
  const usage =
    "forge deployments deploy --server <server_id> --site <site_id> [--script-file <path>]";
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");
  const streamLogs = Boolean(ctx.options.stream);
  const scriptFile = ctx.options["script-file"];

  if (!server) {
    exitWithValidationError("server_id", usage, ctx.formatter);
  }

  if (!site) {
    exitWithValidationError("site_id", usage, ctx.formatter);
  }

  const script =
    scriptFile === undefined
      ? undefined
      : readContentFile(scriptFile, "script-file", {
          label: "deployment script",
          usage,
          formatter: ctx.formatter,
        });

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);

    // Upload the script first: a failure throws here, so the deploy never starts.
    if (script !== undefined) {
      await updateDeploymentScript({ server_id, site_id, content: script }, execCtx);
      process.stderr.write("Deployment script updated.\n");
    }

    const result = await deploySiteAndWait(
      {
        server_id,
        site_id,
        // Use either progress callback OR log streaming, not both
        onProgress: streamLogs
          ? undefined
          : ({ status, elapsed_ms }) => {
              process.stderr.write(`\rDeploying… ${status} (${(elapsed_ms / 1000).toFixed(1)}s)`);
            },
        onLog: streamLogs
          ? (chunk) => {
              process.stdout.write(chunk);
            }
          : undefined,
      },
      execCtx,
    );

    // Separate the final status message from preceding output: in stream mode the
    // last log chunk has no trailing newline, otherwise clear the progress line.
    if (streamLogs) {
      process.stdout.write("\n");
    } else {
      process.stderr.write("\n");
    }

    const elapsedSec = (result.data.elapsed_ms / 1000).toFixed(1);

    // Output full log if we didn't stream it (needed for both success and failure).
    if (!streamLogs && result.data.log) {
      ctx.formatter.output(result.data.log);
    }

    if (result.data.status === "success") {
      ctx.formatter.success(`Deployment succeeded for site ${site_id} (${elapsedSec}s).`);
    } else {
      // Throw so the failure propagates to the exit code (non-zero) and the audit log
      // records status "error" instead of "success".
      throw new ApiError(`Deployment failed for site ${site_id} (${elapsedSec}s).`);
    }
  }, ctx.formatter);
}
