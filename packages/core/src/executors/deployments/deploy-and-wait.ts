import type { ForgeSite, SiteResponse, DeploymentsResponse } from "@studiometa/forge-api";

import type { ExecutorContext, ExecutorResult } from "../../context.ts";

import type { DeploySiteAndWaitOptions, DeployResult } from "./types.ts";

/**
 * Trigger a deployment and wait for it to complete, streaming logs in real time.
 *
 * 1. POSTs to the deploy endpoint.
 * 2. Fetches the latest deployment ID from the deployments list.
 * 3. Polls GET /servers/{id}/sites/{site_id} every `poll_interval_ms` ms.
 * 4. On each poll, fetches the deployment output and emits new lines via `onLog`.
 * 5. When `deployment_status` becomes null the deploy is done.
 * 6. Fetches the final deployment log.
 * 7. Checks the most recent deployment status to determine success/failure.
 */
export async function deploySiteAndWait(
  options: DeploySiteAndWaitOptions,
  ctx: ExecutorContext,
): Promise<ExecutorResult<DeployResult>> {
  const {
    server_id,
    site_id,
    poll_interval_ms = 3000,
    timeout_ms = 600_000,
    onProgress,
    onLog,
  } = options;

  const baseUrl = `/servers/${server_id}/sites/${site_id}`;

  // 1. Trigger deploy
  await ctx.client.post(`${baseUrl}/deployment/deploy`);

  // 2. Resolve the deployment ID for output streaming
  let deploymentId: number | null = null;
  if (onLog) {
    try {
      const deploymentsResponse = await ctx.client.get<DeploymentsResponse>(
        `${baseUrl}/deployments`,
      );
      const deployments = deploymentsResponse.deployments;
      if (deployments.length > 0) {
        deploymentId = deployments[0]!.id;
      }
    } catch {
      // If we can't get the deployment ID, we'll skip streaming
    }
  }

  const startTime = Date.now();
  let logOffset = 0;

  // 3. Poll until deployment_status is null (done)
  await new Promise<void>((resolve) => {
    const tick = async (): Promise<void> => {
      const elapsed_ms = Date.now() - startTime;

      if (elapsed_ms >= timeout_ms) {
        resolve();
        return;
      }

      const response = await ctx.client.get<SiteResponse>(`/servers/${server_id}/sites/${site_id}`);
      const site = response.site as ForgeSite;
      const currentStatus = site.deployment_status;

      if (onProgress) {
        onProgress({ status: currentStatus ?? "done", elapsed_ms });
      }

      // 4. Stream deployment output incrementally
      if (onLog && deploymentId !== null) {
        try {
          const output = await ctx.client.get<string>(
            `${baseUrl}/deployments/${deploymentId}/output`,
          );
          if (output && output.length > logOffset) {
            onLog(output.slice(logOffset));
            logOffset = output.length;
          }
        } catch {
          // Output may not be available yet; continue
        }
      }

      if (currentStatus === null) {
        resolve();
        return;
      }

      await new Promise<void>((r) => setTimeout(r, poll_interval_ms));
      await tick();
    };

    tick().catch(() => resolve());
  });

  const elapsed_ms = Date.now() - startTime;

  // 5. Final log fetch — emit any remaining output
  let log = "";
  try {
    log = await ctx.client.get<string>(`${baseUrl}/deployment/log`);
  } catch {
    // log may not be available; continue
  }

  if (onLog && log.length > logOffset) {
    onLog(log.slice(logOffset));
  }

  // 6. Determine success/failure from the most recent deployment
  let deployStatus: "success" | "failed" = "failed";
  try {
    const deploymentsResponse = await ctx.client.get<DeploymentsResponse>(`${baseUrl}/deployments`);
    const deployments = deploymentsResponse.deployments;
    if (deployments.length > 0) {
      const latest = deployments[0]!;
      deployStatus = latest.status === "finished" ? "success" : "failed";
    }
  } catch {
    // If we can't fetch deployments, keep 'failed'
  }

  // 7. If we timed out, force 'failed'
  if (elapsed_ms >= timeout_ms) {
    deployStatus = "failed";
  }

  return {
    data: {
      status: deployStatus,
      log,
      elapsed_ms,
    },
  };
}
