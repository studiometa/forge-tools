import type { DeploymentAttributes, HttpClient } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";
import type { AsyncPaginatedIterator } from "../pagination.ts";

import { BaseCollection } from "./base.ts";

/** Options for listing the deployments of a server. */
export type ServerDeploymentListOptions = ListOptions<
  "commit_hash" | "commit_message" | "commit_author",
  "created_at",
  "site" | "siteCount" | "siteExists" | "initiator" | "initiatorCount" | "initiatorExists"
>;

/**
 * The recent deployments of every site of a server.
 *
 * Access via `forge.server(id).deployments`.
 *
 * @example
 * ```ts
 * const deployments = await forge.server(123).deployments.list({ include: ['site'] });
 * ```
 */
export class ServerDeploymentsCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly serverId: number,
  ) {
    super(client, orgSlug);
  }

  /** @internal */
  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/deployments`;
  }

  /**
   * List the deployments of the sites of this server, the most recent first.
   *
   * @example
   * ```ts
   * const deployments = await forge.server(123).deployments.list();
   * ```
   */
  async list(
    options: ServerDeploymentListOptions = {},
  ): Promise<Array<DeploymentAttributes & { id: number }>> {
    return this.listPage<DeploymentAttributes>(this.basePath, {
      sort: ["-created_at"],
      ...options,
    });
  }

  /**
   * Iterate over all the deployments of the sites of this server.
   *
   * @example
   * ```ts
   * const deployments = await forge.server(123).deployments.all().toArray();
   * ```
   */
  all(
    options: AllOptions<ServerDeploymentListOptions> = {},
  ): AsyncPaginatedIterator<DeploymentAttributes & { id: number }> {
    return this.iterate<DeploymentAttributes>(this.basePath, { sort: ["-created_at"], ...options });
  }
}
