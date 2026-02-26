/**
 * Option types for deployment executors.
 */

/**
 * Options for listing deployments for a site.
 */
export interface ListDeploymentsOptions {
  server_id: string;
  site_id: string;
}

/**
 * Options for triggering a deployment.
 */
export interface DeploySiteOptions {
  server_id: string;
  site_id: string;
}

/**
 * Options for getting deployment output.
 */
export interface GetDeploymentOutputOptions {
  server_id: string;
  site_id: string;
  deployment_id: string;
}

/**
 * Options for getting the deployment script.
 */
export interface GetDeploymentScriptOptions {
  server_id: string;
  site_id: string;
}

/**
 * Options for updating the deployment script.
 */
export interface UpdateDeploymentScriptOptions {
  server_id: string;
  site_id: string;
  content: string;
}

/**
 * Options for getting the deployment log.
 */
export interface GetDeploymentLogOptions {
  server_id: string;
  site_id: string;
}

/**
 * Options for deploying a site and waiting for completion.
 */
export interface DeploySiteAndWaitOptions {
  server_id: string;
  site_id: string;
  /** Polling interval in milliseconds. Default: 3000 */
  poll_interval_ms?: number;
  /** Timeout in milliseconds. Default: 600000 (10 min) */
  timeout_ms?: number;
  /** Called on each poll iteration with current status and elapsed time. */
  onProgress?: (update: { status: string; elapsed_ms: number }) => void;
}

/**
 * Result of the deploySiteAndWait executor.
 */
export interface DeployResult {
  status: "success" | "failed";
  log: string;
  elapsed_ms: number;
}
