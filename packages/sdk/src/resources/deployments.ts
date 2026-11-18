import type {
  HttpClient,
  JsonApiDocument,
  DeploymentAttributes,
  DeploymentOutputAttributes,
  DeploymentScriptAttributes,
  DeploymentStatusAttributes,
  DeployHookAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";

import { BaseCollection } from "./base.ts";
import type { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for updating the deployment script.
 */
export interface UpdateDeploymentScriptOptions {
  /** Load the environment variables of the site in the script. */
  autoSource?: boolean;
}

/**
 * Options for listing deployments.
 */
export type DeploymentListOptions = ListOptions<
  "commit_hash" | "commit_message" | "commit_author",
  "created_at"
>;

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
    orgSlug: string,
    private readonly serverId: number,
    private readonly siteId: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/sites/${this.siteId}/deployments`;
  }

  /**
   * List deployments for this site.
   *
   * @example
   * ```ts
   * const deployments = await forge.server(123).site(456).deployments.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.server(123).site(456).deployments.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(
    options: DeploymentListOptions = {},
  ): Promise<Array<DeploymentAttributes & { id: number }>> {
    return this.listPage<DeploymentAttributes>(this.basePath, {
      sort: ["-created_at"],
      ...options,
    });
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
  all(
    options: AllOptions<DeploymentListOptions> = {},
  ): AsyncPaginatedIterator<DeploymentAttributes & { id: number }> {
    return this.iterate<DeploymentAttributes>(this.basePath, { sort: ["-created_at"], ...options });
  }

  /**
   * Get a specific deployment.
   *
   * @example
   * ```ts
   * const deployment = await forge.server(123).site(456).deployments.get(789);
   * ```
   */
  async get(deploymentId: number): Promise<DeploymentAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<DeploymentAttributes>>(
      `${this.basePath}/${deploymentId}`,
    );
    return unwrapDocument(response);
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
    const response = await this.client.get<JsonApiDocument<DeploymentOutputAttributes>>(
      `${this.basePath}/${deploymentId}/log`,
    );
    return unwrapDocument(response).output;
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
    const response = await this.client.get<JsonApiDocument<DeploymentScriptAttributes>>(
      `${this.basePath}/script`,
    );
    return unwrapDocument(response).content ?? "";
  }

  /**
   * Update the deployment script.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).deployments.updateScript('npm run build && ...');
   * ```
   */
  async updateScript(content: string, options: UpdateDeploymentScriptOptions = {}): Promise<void> {
    await this.client.put(`${this.basePath}/script`, {
      content,
      ...(options.autoSource === undefined ? {} : { auto_source: options.autoSource }),
    });
  }

  /**
   * Get the deployment state of the site: whether a deployment runs.
   *
   * @example
   * ```ts
   * const { status } = await forge.server(123).site(456).deployments.status();
   * ```
   */
  async status(): Promise<DeploymentStatusAttributes & { id: number }> {
    return this.getResource<DeploymentStatusAttributes>(`${this.basePath}/status`);
  }

  /**
   * Reset the deployment state of the site, after a deployment that did not end.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).deployments.resetStatus();
   * ```
   */
  async resetStatus(): Promise<void> {
    await this.client.delete(`${this.basePath}/status`);
  }

  /**
   * Get the deployment hook: the URL that starts a deployment of the site.
   *
   * @example
   * ```ts
   * const { url } = await forge.server(123).site(456).deployments.deployHook();
   * ```
   */
  async deployHook(): Promise<DeployHookAttributes & { id: number }> {
    return this.getResource<DeployHookAttributes>(`${this.basePath}/deploy-hook`);
  }

  /**
   * Generate a new token for the deployment hook, and return its URL.
   *
   * @example
   * ```ts
   * const { url } = await forge.server(123).site(456).deployments.regenerateDeployHook();
   * ```
   */
  async regenerateDeployHook(): Promise<DeployHookAttributes & { id: number }> {
    return this.putResource<DeployHookAttributes>(`${this.basePath}/deploy-hook`);
  }

  /**
   * Deploy the site on each push to its branch.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).deployments.enablePushToDeploy();
   * ```
   */
  async enablePushToDeploy(): Promise<void> {
    await this.client.post(`${this.basePath}/push-to-deploy`);
  }

  /**
   * Stop deploying the site on each push to its branch.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).deployments.disablePushToDeploy();
   * ```
   */
  async disablePushToDeploy(): Promise<void> {
    await this.client.delete(`${this.basePath}/push-to-deploy`);
  }
}
