import type {
  DeployKeyAttributes,
  HealthcheckEndpointAttributes,
  LoadBalancingNodeAttributes,
  LogAttributes,
  UpdateLoadBalancingNodesData,
} from "@studiometa/forge-api";

import type { ListOptions } from "../list-options.ts";

import { SiteScoped } from "./site-scoped.ts";

/** The logs of a site. */
export type SiteLogType = "nginx-access" | "nginx-error" | "application";

/** Options for listing the nodes of a site of a load balancer. */
export type LoadBalancingNodeListOptions = ListOptions<never, "id">;

/**
 * The healthcheck endpoint of a site: the URL that Forge checks after each deployment.
 *
 * Access via `forge.server(id).site(id).healthcheck`.
 *
 * @example
 * ```ts
 * await forge.server(123).site(456).healthcheck.update('https://example.com/up');
 * ```
 */
export class SiteHealthcheckResource extends SiteScoped {
  /**
   * Get the healthcheck endpoint, or `null` without one.
   *
   * @example
   * ```ts
   * const url = await forge.server(123).site(456).healthcheck.get();
   * ```
   */
  async get(): Promise<string | null> {
    const healthcheck = await this.getResource<HealthcheckEndpointAttributes>(
      `${this.sitePath}/healthcheck`,
    );
    return healthcheck.healthcheck_endpoint;
  }

  /**
   * Set the healthcheck endpoint, or remove it with `null`.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).healthcheck.update('https://example.com/up');
   * ```
   */
  async update(endpoint: string | null): Promise<void> {
    await this.client.put(`${this.sitePath}/healthcheck`, { healthcheck_endpoint: endpoint });
  }
}

/**
 * The Nginx and application logs of a site.
 *
 * Access via `forge.server(id).site(id).logs`.
 *
 * @example
 * ```ts
 * const log = await forge.server(123).site(456).logs.get('application');
 * ```
 */
export class SiteLogsResource extends SiteScoped {
  /**
   * Get the content of a log of the site.
   *
   * @example
   * ```ts
   * const log = await forge.server(123).site(456).logs.get('nginx-error');
   * ```
   */
  async get(type: SiteLogType): Promise<string> {
    return (await this.getResource<LogAttributes>(`${this.sitePath}/logs/${type}`)).content;
  }

  /**
   * Clear a log of the site.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).logs.clear('application');
   * ```
   */
  async clear(type: SiteLogType): Promise<void> {
    await this.client.delete(`${this.sitePath}/logs/${type}`);
  }
}

/**
 * The deploy key of a site: an SSH key that only clones its repository.
 *
 * Access via `forge.server(id).site(id).deployKey`.
 *
 * @example
 * ```ts
 * const { key } = await forge.server(123).site(456).deployKey.create();
 * ```
 */
export class SiteDeployKeyResource extends SiteScoped {
  /**
   * Get the public deploy key of the site, or `null` without one.
   *
   * @example
   * ```ts
   * const key = await forge.server(123).site(456).deployKey.get();
   * ```
   */
  async get(): Promise<string | null> {
    return (await this.getResource<DeployKeyAttributes>(`${this.sitePath}/deploy-key`)).key;
  }

  /**
   * Create a deploy key for the site, and return its public key. Forge returns the current key
   * when the site already has one.
   *
   * @example
   * ```ts
   * const key = await forge.server(123).site(456).deployKey.create();
   * ```
   */
  async create(): Promise<string | null> {
    return (await this.postResource<DeployKeyAttributes>(`${this.sitePath}/deploy-key`)).key;
  }

  /**
   * Remove the deploy key of the site.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).deployKey.delete();
   * ```
   */
  async delete(): Promise<void> {
    await this.client.delete(`${this.sitePath}/deploy-key`);
  }
}

/**
 * The servers that a site of a load balancer sends traffic to.
 *
 * Access via `forge.server(id).site(id).loadBalancing`.
 *
 * @example
 * ```ts
 * const nodes = await forge.server(123).site(456).loadBalancing.list();
 * ```
 */
export class SiteLoadBalancingResource extends SiteScoped {
  /**
   * List the nodes of the load balancer.
   *
   * @example
   * ```ts
   * const nodes = await forge.server(123).site(456).loadBalancing.list();
   * ```
   */
  async list(
    options: LoadBalancingNodeListOptions = {},
  ): Promise<Array<LoadBalancingNodeAttributes & { id: number }>> {
    return this.listPage<LoadBalancingNodeAttributes>(
      `${this.sitePath}/load-balancing-nodes`,
      options,
    );
  }

  /**
   * Replace the nodes and the method of the load balancer.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).loadBalancing.update({
   *   balancer_method: 'round_robin',
   *   balancing: [{ server_id: 789, weight: 1 }],
   * });
   * ```
   */
  async update(data: UpdateLoadBalancingNodesData): Promise<void> {
    await this.client.put(`${this.sitePath}/load-balancing-nodes`, data);
  }
}
