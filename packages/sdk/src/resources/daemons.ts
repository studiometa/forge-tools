import type {
  CreateDaemonData,
  HttpClient,
  JsonApiDocument,
  JsonApiListDocument,
  BackgroundProcessAttributes,
} from "@studiometa/forge-api";

import { unwrapDocument, unwrapListDocument } from "@studiometa/forge-api";

import { BaseCollection } from "./base.ts";
import { AsyncPaginatedIterator } from "../pagination.ts";

/**
 * Options for listing daemons.
 */
export interface DaemonListOptions {
  /** Cursor for pagination (from previous response's next_cursor). */
  cursor?: string;
}

/**
 * Collection of daemons (background processes) on a server.
 *
 * Access via `forge.server(id).daemons`.
 *
 * @example
 * ```ts
 * const daemons = await forge.server(123).daemons.list();
 * ```
 */
export class DaemonsCollection extends BaseCollection {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    private readonly serverId: number,
  ) {
    super(client, orgSlug);
  }

  private get basePath(): string {
    return `/orgs/${this.orgSlug}/servers/${this.serverId}/background-processes`;
  }

  /**
   * List daemons on this server.
   *
   * @example
   * ```ts
   * const daemons = await forge.server(123).daemons.list();
   *
   * // Fetch a specific cursor page:
   * const page2 = await forge.server(123).daemons.list({ cursor: 'next-cursor-value' });
   * ```
   */
  async list(
    options: DaemonListOptions = {},
  ): Promise<Array<BackgroundProcessAttributes & { id: number }>> {
    const query = options.cursor !== undefined ? `?page[cursor]=${options.cursor}` : "";
    const response = await this.client.get<JsonApiListDocument<BackgroundProcessAttributes>>(
      `${this.basePath}${query}`,
    );
    return unwrapListDocument(response);
  }

  /**
   * Iterate over all daemons across all pages.
   *
   * @example
   * ```ts
   * for await (const daemon of forge.server(123).daemons.all()) {
   *   console.log(daemon);
   * }
   *
   * // Or collect all at once:
   * const daemons = await forge.server(123).daemons.all().toArray();
   * ```
   */
  all(): AsyncPaginatedIterator<BackgroundProcessAttributes & { id: number }> {
    return new AsyncPaginatedIterator<BackgroundProcessAttributes & { id: number }>(
      async (cursor) => {
        const query = cursor !== null ? `?page[cursor]=${cursor}` : "";
        const response = await this.client.get<JsonApiListDocument<BackgroundProcessAttributes>>(
          `${this.basePath}${query}`,
        );
        return {
          items: unwrapListDocument(response),
          nextCursor: response.meta.next_cursor ?? null,
        };
      },
    );
  }

  /**
   * Get a specific daemon.
   *
   * @example
   * ```ts
   * const daemon = await forge.server(123).daemons.get(789);
   * ```
   */
  async get(daemonId: number): Promise<BackgroundProcessAttributes & { id: number }> {
    const response = await this.client.get<JsonApiDocument<BackgroundProcessAttributes>>(
      `${this.basePath}/${daemonId}`,
    );
    return unwrapDocument(response);
  }

  /**
   * Create a new daemon.
   *
   * @example
   * ```ts
   * const daemon = await forge.server(123).daemons.create({
   *   command: 'php artisan queue:work',
   *   user: 'forge',
   * });
   * ```
   */
  async create(data: CreateDaemonData): Promise<BackgroundProcessAttributes & { id: number }> {
    const response = await this.client.post<JsonApiDocument<BackgroundProcessAttributes>>(
      this.basePath,
      data,
    );
    return unwrapDocument(response);
  }

  /**
   * Delete a daemon.
   *
   * @example
   * ```ts
   * await forge.server(123).daemons.delete(789);
   * ```
   */
  async delete(daemonId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${daemonId}`);
  }

  /**
   * Restart a daemon.
   *
   * @example
   * ```ts
   * await forge.server(123).daemons.restart(789);
   * ```
   */
  async restart(daemonId: number): Promise<void> {
    await this.client.post(`${this.basePath}/${daemonId}/restart`);
  }
}
