import type {
  CreateMonitorData,
  ForgeMonitor,
  HttpClient,
  MonitorResponse,
  MonitorsResponse,
} from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing monitors.
 */
export interface MonitorListOptions {
  /** Page number to fetch (1-indexed). */
  page?: number;
}

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
    private readonly serverId: number,
  ) {
    super(client);
  }

  private get basePath(): string {
    return `/servers/${this.serverId}/monitors`;
  }

  /**
   * List monitors on this server.
   *
   * @example
   * ```ts
   * const monitors = await forge.server(123).monitors.list();
   *
   * // Fetch a specific page:
   * const page2 = await forge.server(123).monitors.list({ page: 2 });
   * ```
   */
  async list(options: MonitorListOptions = {}): Promise<ForgeMonitor[]> {
    const query = options.page !== undefined ? `?page=${options.page}` : "";
    const response = await this.client.get<MonitorsResponse>(`${this.basePath}${query}`);
    return response.monitors;
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
  all(options: Omit<MonitorListOptions, "page"> = {}): AsyncPaginatedIterator<ForgeMonitor> {
    return new AsyncPaginatedIterator<ForgeMonitor>((page) => this.list({ ...options, page }));
  }

  /**
   * Get a specific monitor.
   *
   * @example
   * ```ts
   * const monitor = await forge.server(123).monitors.get(789);
   * ```
   */
  async get(monitorId: number): Promise<ForgeMonitor> {
    const response = await this.client.get<MonitorResponse>(`${this.basePath}/${monitorId}`);
    return response.monitor;
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
  async create(data: CreateMonitorData): Promise<ForgeMonitor> {
    const response = await this.client.post<MonitorResponse>(this.basePath, data);
    return response.monitor;
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
