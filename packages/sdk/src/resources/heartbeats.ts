import type {
  CreateHeartbeatData,
  HeartbeatAttributes,
  UpdateHeartbeatData,
} from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";
import type { AsyncPaginatedIterator } from "../pagination.ts";

import { SiteScoped } from "./site-scoped.ts";

/** Options for listing the heartbeats of a site. */
export type HeartbeatListOptions = ListOptions;

/**
 * The heartbeats of a site: URLs that a task pings, and that Forge watches.
 *
 * Access via `forge.server(id).site(id).heartbeats`.
 *
 * @example
 * ```ts
 * const heartbeat = await forge.server(123).site(456).heartbeats.create({
 *   name: 'Backups',
 *   grace_period: 5,
 *   frequency: 1440,
 * });
 * ```
 */
export class HeartbeatsCollection extends SiteScoped {
  /** @internal */
  private get basePath(): string {
    return `${this.sitePath}/heartbeats`;
  }

  /**
   * List the heartbeats of the site.
   *
   * @example
   * ```ts
   * const heartbeats = await forge.server(123).site(456).heartbeats.list();
   * ```
   */
  async list(
    options: HeartbeatListOptions = {},
  ): Promise<Array<HeartbeatAttributes & { id: number }>> {
    return this.listPage<HeartbeatAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all the heartbeats of the site.
   *
   * @example
   * ```ts
   * const heartbeats = await forge.server(123).site(456).heartbeats.all().toArray();
   * ```
   */
  all(
    options: AllOptions<HeartbeatListOptions> = {},
  ): AsyncPaginatedIterator<HeartbeatAttributes & { id: number }> {
    return this.iterate<HeartbeatAttributes>(this.basePath, options);
  }

  /**
   * Get a heartbeat.
   *
   * @example
   * ```ts
   * const heartbeat = await forge.server(123).site(456).heartbeats.get(789);
   * ```
   */
  async get(heartbeatId: number): Promise<HeartbeatAttributes & { id: number }> {
    return this.getResource<HeartbeatAttributes>(`${this.basePath}/${heartbeatId}`);
  }

  /**
   * Create a heartbeat.
   *
   * @example
   * ```ts
   * const heartbeat = await forge.server(123).site(456).heartbeats.create({
   *   name: 'Backups',
   *   grace_period: 5,
   *   frequency: 1440,
   * });
   * ```
   */
  async create(data: CreateHeartbeatData): Promise<HeartbeatAttributes & { id: number }> {
    return this.postResource<HeartbeatAttributes>(this.basePath, data);
  }

  /**
   * Update a heartbeat.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).heartbeats.update(789, {
   *   name: 'Backups',
   *   grace_period: 10,
   *   frequency: 1440,
   * });
   * ```
   */
  async update(
    heartbeatId: number,
    data: UpdateHeartbeatData,
  ): Promise<HeartbeatAttributes & { id: number }> {
    return this.putResource<HeartbeatAttributes>(`${this.basePath}/${heartbeatId}`, data);
  }

  /**
   * Delete a heartbeat.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).heartbeats.delete(789);
   * ```
   */
  async delete(heartbeatId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${heartbeatId}`);
  }
}
