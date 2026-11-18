import type {
  CreateMonitorData,
  HttpClient,
  JsonApiDocument,
  MonitorAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument } from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing monitors.
 */
export type MonitorListOptions = ListOptions<
  "status" | "state" | "type" | "notify",
  "state" | "status" | "created_at" | "updated_at"
>;

/**
 * Collection of server monitors.
 *
 * Access via `forge.server(id).monitors`.
 *
 * @example
 * ```ts
 * const monitors = await forge.server(123).monitors.list();
 * ```
 */
export class MonitorsCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly serverId: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/monitors`;
  }

  /**
   * List monitors on this server.
   *
   * @example
   * ```ts
   * const monitors = await forge.server(123).monitors.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.server(123).monitors.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(options: MonitorListOptions = {}): Promise<Array<MonitorAttributes & { id: number }>> {
    return this.listPage<MonitorAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all monitors across all pages.
   *
   * @example
   * ```ts
   * for await (const monitor of forge.server(123).monitors.all()) {
   *   console.log(monitor);
   * }
   *
   * // Or collect all at once:
   * const monitors = await forge.server(123).monitors.all().toArray();
   * ```
   */
  all(
    options: AllOptions<MonitorListOptions> = {},
  ): AsyncPaginatedIterator<MonitorAttributes & { id: number }> {
    return this.iterate<MonitorAttributes>(this.basePath, options);
  }

  /**
   * Get a specific monitor.
   *
   * @example
   * ```ts
   * const monitor = await forge.server(123).monitors.get(789);
   * ```
   */
  async get(monitorId: number): Promise<MonitorAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<MonitorAttributes>>(
      `${this.basePath}/${monitorId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Create a new monitor.
   *
   * @example
   * ```ts
   * const monitor = await forge.server(123).monitors.create({
   *   type: 'cpu_load',
   *   operator: 'gte',
   *   threshold: 80,
   *   minutes: 5,
   * });
   * ```
   */
  async create(data: CreateMonitorData): Promise<MonitorAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<MonitorAttributes>>(
      this.basePath,
      data,
    );
    return unwrapDocument(response);
  }

  /**
   * Delete a monitor.
   *
   * @example
   * ```ts
   * await forge.server(123).monitors.delete(789);
   * ```
   */
  async delete(monitorId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${monitorId}`);
  }
}
