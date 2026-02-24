import type {
  ForgeDeployment,
  HttpClient,
  DeploymentResponse,
  DeploymentsResponse,
} from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing deployments.
 */
export interface DeploymentListOptions {
  /** Page number to fetch (1-indexed). */
  page?: number;
}

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
   * List deployments for this site.
   *
   * @example
   * ```ts
   * const deployments = await forge.server(123).site(456).deployments.list();
   *
   * // Fetch a specific page:
   * const page2 = await forge.server(123).site(456).deployments.list({ page: 2 });
   * ```
   */
  async list(options: DeploymentListOptions = {}): Promise<ForgeDeployment[]> {
    const query = options.page !== undefined ? `?page=${options.page}` : "";
    const response = await this.client.get<DeploymentsResponse>(`${this.basePath}${query}`);
    return response.deployments;
  }

  /**
   * Iterate over all deployments across all pages.
   *
   * @example
   * ```ts
   * for await (const deployment of forge.server(123).site(456).deployments.all()) {
   *   console.log(deployment);
   * }
   *
   * // Or collect all at once:
   * const deployments = await forge.server(123).site(456).deployments.all().toArray();
   * ```
   */
  all(options: Omit<DeploymentListOptions, "page"> = {}): AsyncPaginatedIterator<ForgeDeployment> {
    return new AsyncPaginatedIterator<ForgeDeployment>((page) => this.list({ ...options, page }));
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
