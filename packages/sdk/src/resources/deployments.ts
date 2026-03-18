import type {
  HttpClient,
  JsonApiDocument,
  JsonApiListDocument,
  DeploymentAttributes,
  DeploymentOutputAttributes,
  DeploymentScriptAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing deployments.
 */
export interface DeploymentListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
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
    const params = new URLSearchParams({ sort: "-created_at" });
    if (options.cursor !== undefined) {
      params.set("page[cursor]", options.cursor);
    }
    const response = await this.client.get<JsonApiListDocument<DeploymentAttributes>>(
      `${this.basePath}?${params.toString()}`,
    );
    return unwrapListDocument(response);
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
  all(): AsyncPaginatedIterator<DeploymentAttributes & { id: number }> {
    return new AsyncPaginatedIterator<DeploymentAttributes & { id: number }>(async (cursor) => {
      const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
      const response = await this.client.get<JsonApiListDocument<DeploymentAttributes>>(
        `${this.basePath}${query}`,
      );
      return {
        items: unwrapListDocument(response),
        nextCursor: response.meta.next_cursor ?? null,
      };
    });
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
      `${this.basePath}/${deploymentId}/output`,
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
      `/orgs/${this.orgSlug}/servers/${this.serverId}/sites/${this.siteId}/deployments/script`,
    );
    return unwrapDocument(response).content;
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
    await this.client.put(
      `/orgs/${this.orgSlug}/servers/${this.serverId}/sites/${this.siteId}/deployments/script`,
      { content },
    );
  }
}
