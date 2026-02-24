import type {
  ForgeDeployment,
  HttpClient,
  DeploymentResponse,
  DeploymentsResponse,
} from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";

/**
 * Collection of deployments for a site.
 *
 * Access via `forge.server(id).site(id).deployments`.
 *
 * @example
 * ```ts
 * const deployments = await forge.server(123).site(456).deployments.list();
 * ```
 */
export class DeploymentsCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    private readonly serverId: number,
    private readonly siteId: number,
  ) {
    super(client);
  }

  private get basePath(): string {
    return `/servers/${this.serverId}/sites/${this.siteId}/deployments`;
  }

  /**
   * List all deployments for this site.
   *
   * @example
   * ```ts
   * const deployments = await forge.server(123).site(456).deployments.list();
   * ```
   */
  async list(): Promise<ForgeDeployment[]> {
    const response = await this.client.get<DeploymentsResponse>(this.basePath);
    return response.deployments;
  }

  /**
   * Get a specific deployment.
   *
   * @example
   * ```ts
   * const deployment = await forge.server(123).site(456).deployments.get(789);
   * ```
   */
  async get(deploymentId: number): Promise<ForgeDeployment> {
    const response = await this.client.get<DeploymentResponse>(`${this.basePath}/${deploymentId}`);
    return response.deployment;
  }

  /**
   * Get the output of a deployment.
   *
   * @example
   * ```ts
   * const output = await forge.server(123).site(456).deployments.output(789);
   * ```
   */
  async output(deploymentId: number): Promise<string> {
    return this.client.get<string>(`${this.basePath}/${deploymentId}/output`);
  }

  /**
   * Get the deployment script.
   *
   * @example
   * ```ts
   * const script = await forge.server(123).site(456).deployments.script();
   * ```
   */
  async script(): Promise<string> {
    return this.client.get<string>(
      `/servers/${this.serverId}/sites/${this.siteId}/deployment/script`,
    );
  }

  /**
   * Update the deployment script.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).deployments.updateScript('npm run build && ...');
   * ```
   */
  async updateScript(content: string): Promise<void> {
    await this.client.put(`/servers/${this.serverId}/sites/${this.siteId}/deployment/script`, {
      content,
    });
  }
}
