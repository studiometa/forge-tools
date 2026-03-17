import type {
  CreateMonitorData,
  HttpClient,
  JsonApiDocument,
  JsonApiListDocument,
  MonitorAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing monitors.
 */
export interface MonitorListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
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
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<MonitorAttributes>>(
      `${this.basePath}${query}`,
    );
    return unwrapListDocument(response);
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
  all(): AsyncPaginatedIterator<MonitorAttributes & { id: number }> {
    return new AsyncPaginatedIterator<MonitorAttributes & { id: number }>(async (cursor) => {
      const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
      const response = await this.client.get<JsonApiListDocument<MonitorAttributes>>(
        `${this.basePath}${query}`,
      );
      return {
        items: unwrapListDocument(response),
        nextCursor: response.meta.next_cursor ?? null,
      };
    });
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
