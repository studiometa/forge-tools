import {
  unwrapDocument,
  jsonApiDocumentSchema,
  DeploymentAttributesSchema,
  DeploymentOutputAttributesSchema,
} from "@studiometa/forge-api";

import type { ExecutorContext, ExecutorResult } from "../../context.ts";
import { ROUTES, request } from "../../routes.ts";

import type { DeploySiteAndWaitOptions, DeployResult } from "./types.ts";

/**
 * Trigger a deployment and wait for it to complete, streaming logs in real time.
 *
 * 1. POSTs to the deploy endpoint.
 * 2. Polls deployment status every `poll_interval_ms` ms.
 * 3. On each poll, fetches the latest deployment log and emits new content via `onLog`.
 * 4. When status becomes null/idle the deploy is done.
 * 5. Fetches the final deployment log to emit any remaining content.
 * 6. Checks the most recent deployment to determine success/failure.
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

  // 1. Trigger deploy and get the deployment ID
  const createResponse = await request(
    ROUTES.deployments.create,
    ctx,
    { server_id, site_id },
    { body: {}, schema: jsonApiDocumentSchema(DeploymentAttributesSchema) },
  );
  const deployment = unwrapDocument(createResponse);
  const deploymentId = deployment.id;

  const startTime = Date.now();
  let logOffset = 0;

  // 2. Poll until deployment is done
  await new Promise<void>((resolve) => {
    const tick = async (): Promise<void> => {
      const elapsed_ms = Date.now() - startTime;

      if (elapsed_ms >= timeout_ms) {
        resolve();
        return;
      }

      // Check deployment status by fetching the specific deployment
      let currentStatus: string | null = null;
      try {
        const deploymentResponse = await request(
          ROUTES.deployments.get,
          ctx,
          { server_id, site_id, id: deploymentId },
          { schema: jsonApiDocumentSchema(DeploymentAttributesSchema) },
        );
        const deploymentData = unwrapDocument(deploymentResponse);
        currentStatus = deploymentData.status;
      } catch {
        // If we can't fetch the deployment, treat as done (will check final status below)
        currentStatus = null;
      }

      if (onProgress) {
        onProgress({ status: currentStatus ?? "done", elapsed_ms });
      }

      // 3. Stream deployment log incrementally
      if (onLog) {
        try {
          const logResponse = await request(
            ROUTES.deployments.getLog,
            ctx,
            { server_id, site_id, id: deploymentId },
            { schema: jsonApiDocumentSchema(DeploymentOutputAttributesSchema) },
          );
          const logData = unwrapDocument(logResponse);
          if (logData.output && logData.output.length > logOffset) {
            onLog(logData.output.slice(logOffset));
            logOffset = logData.output.length;
          }
        } catch {
          // Log may not be available yet; continue
        }
      }

      // Check if deployment is in a terminal state
      const terminalStatuses = ["finished", "failed", "failed-build"];
      if (currentStatus === null || terminalStatuses.includes(currentStatus)) {
        resolve();
        return;
      }

      await new Promise<void>((r) => {
        setTimeout(r, poll_interval_ms);
      });
      await tick();
    };

    tick().catch(() => resolve());
  });

  const elapsed_ms = Date.now() - startTime;

  // 4. Final log + status fetch for the specific deployment
  let log = "";
  let deployStatus: "success" | "failed" = "failed";
  try {
    const deploymentResponse = await request(
      ROUTES.deployments.get,
      ctx,
      { server_id, site_id, id: deploymentId },
      { schema: jsonApiDocumentSchema(DeploymentAttributesSchema) },
    );
    const finalDeployment = unwrapDocument(deploymentResponse);
    deployStatus = finalDeployment.status === "finished" ? "success" : "failed";

    // Fetch final log
    try {
      const logResponse = await request(
        ROUTES.deployments.getLog,
        ctx,
        { server_id, site_id, id: deploymentId },
        { schema: jsonApiDocumentSchema(DeploymentOutputAttributesSchema) },
      );
      const logData = unwrapDocument(logResponse);
      log = logData.output ?? "";
    } catch {
      // log may not be available; continue
    }
  } catch {
    // If we can't fetch the deployment, keep 'failed'
  }

  if (onLog && log.length > logOffset) {
    onLog(log.slice(logOffset));
  }

  // 6. If we timed out, force 'failed'
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
