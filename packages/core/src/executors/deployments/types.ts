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
