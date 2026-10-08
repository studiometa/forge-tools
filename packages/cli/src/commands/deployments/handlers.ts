import { readFileSync } from "node:fs";

import {
  listDeployments,
  deploySiteAndWait,
  getDeploymentLog,
  getDeploymentScript,
  updateDeploymentScript,
} from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";
import type { OutputFormatter } from "../../output.ts";
import type { OptionValue } from "../../utils/args.ts";

import { exitWithValidationError, handleError, runCommand } from "../../error-handler.ts";
import { ApiError, ValidationError } from "../../errors.ts";
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

/**
 * Output a validation error and exit.
 */
function exitWithError(error: ValidationError, formatter: OutputFormatter): never {
  handleError(error, formatter);
  // Unreachable in production
  throw error;
}

/**
 * Read a deployment script from a file path, or from stdin when the path is "-".
 */
function readScriptFile(
  path: OptionValue,
  field: string,
  usage: string,
  formatter: OutputFormatter,
): string {
  if (typeof path !== "string" || !path) {
    exitWithError(
      new ValidationError(`--${field} requires a path (use - for stdin)`, field, [
        `Usage: ${usage}`,
      ]),
      formatter,
    );
  }

  try {
    return readFileSync(path === "-" ? 0 : path, "utf8");
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return exitWithError(
      new ValidationError(`Cannot read deployment script from ${path}: ${reason}`, field),
      formatter,
    );
  }
}

/**
 * Exit when a deployment script is empty, so Forge never gets a blank script.
 */
function assertScriptNotEmpty(script: string, field: string, formatter: OutputFormatter): void {
  if (!script.trim()) {
    exitWithError(new ValidationError("Deployment script is empty", field), formatter);
  }
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
      console.log(result.data);
    }
  }, ctx.formatter);
}

export async function deploymentsUpdateScript(ctx: CommandContext): Promise<void> {
  const usage =
    "forge deployments update-script --server <server_id> --site <site_id> (--file <path|-> | --content <script>)";
  const server = String(ctx.options.server ?? "");
  const site = String(ctx.options.site ?? "");
  const { file, content } = ctx.options;

  if (!server) {
    exitWithValidationError("server_id", usage, ctx.formatter);
  }

  if (!site) {
    exitWithValidationError("site_id", usage, ctx.formatter);
  }

  if (file !== undefined && content !== undefined) {
    exitWithError(
      new ValidationError("Use either --file or --content, not both", "file", [`Usage: ${usage}`]),
      ctx.formatter,
    );
  }

  if (file === undefined && content === undefined) {
    exitWithError(
      new ValidationError("A deployment script source is required: --file or --content", "file", [
        `Usage: ${usage}`,
      ]),
      ctx.formatter,
    );
  }

  // `--content` without a value parses as `true`: treat it as an empty script.
  const inline = typeof content === "string" ? content : "";
  const field = file !== undefined ? "file" : "content";
  const script = file !== undefined ? readScriptFile(file, field, usage, ctx.formatter) : inline;
  assertScriptNotEmpty(script, field, ctx.formatter);

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const site_id = await resolveSiteId(site, server_id, execCtx);
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

  let script: string | undefined;
  if (scriptFile !== undefined) {
    script = readScriptFile(scriptFile, "script-file", usage, ctx.formatter);
    assertScriptNotEmpty(script, "script-file", ctx.formatter);
  }

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
